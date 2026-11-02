import warnings
import os
import hashlib
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.ensemble import RandomForestClassifier

warnings.filterwarnings('ignore', message='X does not have valid feature names')

FEATURES    = ['Temparature', 'Humidity', 'Moisture', 'Nitrogen', 'Potassium', 'Phosphorous']
MODEL_DIR   = os.path.join(os.path.dirname(__file__), 'soil_model')
os.makedirs(MODEL_DIR, exist_ok=True)

def _csv_hash(path):
    """Fast hash of a CSV to detect dataset changes."""
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()


class SoilCropModel:
    def __init__(self, core_path):
        import joblib

        self.data = pd.read_csv(core_path)

        self.le_crop       = LabelEncoder()
        self.le_fertilizer = LabelEncoder()

        self.data['Crop Type Enc']       = self.le_crop.fit_transform(self.data['Crop Type'])
        self.data['Fertilizer Name Enc'] = self.le_fertilizer.fit_transform(self.data['Fertilizer Name'])

        self.SOIL_TYPES = sorted(self.data['Soil Type'].unique().tolist())
        self.CROP_TYPES = sorted(self.data['Crop Type'].unique().tolist())

        self.scaler   = StandardScaler()
        X             = self.data[FEATURES]
        self.X_scaled = self.scaler.fit_transform(X)

        # ── Try to load pre-trained classifiers from disk ─────────────────────
        csv_hash   = _csv_hash(core_path)
        hash_file  = os.path.join(MODEL_DIR, 'dataset_hash.txt')
        soil_pkl   = os.path.join(MODEL_DIR, 'soil_clf.joblib')
        crop_pkl   = os.path.join(MODEL_DIR, 'crop_clf.joblib')
        scaler_pkl = os.path.join(MODEL_DIR, 'scaler.joblib')

        cached = (
            os.path.exists(hash_file)
            and os.path.exists(soil_pkl)
            and os.path.exists(crop_pkl)
            and os.path.exists(scaler_pkl)
            and open(hash_file).read().strip() == csv_hash
        )

        if cached:
            print('[Model] Loading cached classifiers...')
            self._soil_clf = joblib.load(soil_pkl)
            self._crop_clf = joblib.load(crop_pkl)
            print('[Model] Cached classifiers loaded.')
        else:
            print('[Model] Training RandomForest classifiers (first run)...')
            self._soil_clf = RandomForestClassifier(
                n_estimators=300, random_state=42, n_jobs=-1
            )
            self._soil_clf.fit(self.X_scaled, self.data['Soil Type'].values)

            self._crop_clf = RandomForestClassifier(
                n_estimators=300, random_state=42, n_jobs=-1
            )
            self._crop_clf.fit(self.X_scaled, self.data['Crop Type'].values)

            joblib.dump(self._soil_clf, soil_pkl)
            joblib.dump(self._crop_clf, crop_pkl)
            joblib.dump(self.scaler, scaler_pkl)
            with open(hash_file, 'w') as f:
                f.write(csv_hash)
            print('[Model] Classifiers trained and cached.')

        # ── Per-soil k-NN for crop diversity ranking ──────────────────────────
        self._soil_knn = {}
        self._soil_idx = {}
        for soil in self.SOIL_TYPES:
            mask = self.data['Soil Type'] == soil
            idxs = np.where(mask)[0]
            k    = min(30, len(idxs))
            nbrs = NearestNeighbors(n_neighbors=k, metric='euclidean', algorithm='ball_tree')
            nbrs.fit(self.X_scaled[idxs])
            self._soil_knn[soil] = nbrs
            self._soil_idx[soil] = idxs

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _nutrient_level(self, val):
        if val < 10:
            return 'Low'
        elif val <= 30:
            return 'Medium'
        return 'High'

    def _rank_crops_knn(self, neighbors_df, distances):
        weights = 1.0 / (np.sqrt(distances) + 0.5)
        scores  = {}
        for w, (_, row) in zip(weights, neighbors_df.iterrows()):
            crop = row['Crop Type']
            scores[crop] = scores.get(crop, 0.0) + float(w)
        total  = sum(scores.values())
        ranked = sorted(scores.items(), key=lambda x: -x[1])[:5]
        crops      = [c for c, _ in ranked]
        confidence = {c: round(float(v) / total * 100, 1) for c, v in ranked}
        return crops, confidence

    # ── Public API ─────────────────────────────────────────────────────────────

    def predict_soil_type(self, Temparature, Humidity, Moisture, Nitrogen, Phosphorous, Potassium):
        x_raw = np.array([[Temparature, Humidity, Moisture, Nitrogen, Potassium, Phosphorous]])
        x     = self.scaler.transform(x_raw)

        predicted = self._soil_clf.predict(x)[0]
        proba     = self._soil_clf.predict_proba(x)[0]
        classes   = self._soil_clf.classes_

        soil_confidence = {
            cls: round(float(p) * 100, 1)
            for cls, p in zip(classes, proba)
        }
        return predicted, soil_confidence

    def recommend_crops(self, Temparature, Humidity, Moisture, Nitrogen, Phosphorous, Potassium):
        predicted_soil, soil_conf = self.predict_soil_type(
            Temparature, Humidity, Moisture, Nitrogen, Phosphorous, Potassium
        )

        x_raw = np.array([[Temparature, Humidity, Moisture, Nitrogen, Potassium, Phosphorous]])
        x     = self.scaler.transform(x_raw)

        nbrs   = self._soil_knn[predicted_soil]
        idxs   = self._soil_idx[predicted_soil]
        dists, local_indices = nbrs.kneighbors(x)
        neighbors = self.data.iloc[idxs[local_indices[0]]]
        crops, knn_conf = self._rank_crops_knn(neighbors, dists[0])

        rf_proba  = self._crop_clf.predict_proba(x)[0]
        rf_classes = self._crop_clf.classes_
        rf_conf   = {c: round(float(p) * 100, 1) for c, p in zip(rf_classes, rf_proba)}

        merged_conf = {
            c: round(knn_conf.get(c, 0.0) * 0.4 + rf_conf.get(c, 0.0) * 0.6, 1)
            for c in crops
        }

        return {
            'Soil Type':        predicted_soil,
            'Soil Confidence':  soil_conf,
            'Nutrient Levels': {
                'Nitrogen':    self._nutrient_level(Nitrogen),
                'Phosphorous': self._nutrient_level(Phosphorous),
                'Potassium':   self._nutrient_level(Potassium),
            },
            'Recommended Crops': crops,
            'Crop Confidence':   merged_conf,
        }

    def describe_fertilizer_npk(self, fert_name):
        if not fert_name or not isinstance(fert_name, str) or '-' not in fert_name:
            return fert_name
        parts = fert_name.split('-')
        try:
            if len(parts) == 3:
                n, p, k = map(int, parts)
                high = ['nitrogen', 'phosphorus', 'potassium'][np.argmax([n, p, k])]
                return (f"NPK fertilizer high in {high}, with "
                        f"{n}% nitrogen, {p}% phosphorus, and {k}% potassium.")
            elif len(parts) == 2:
                n, p = map(int, parts)
                if n == p:
                    return (f"NPK fertilizer with equal proportions of nitrogen, "
                            f"phosphorus, and potassium, each {n}%.")
                return f"NPK fertilizer with {n}% nitrogen and {p}% phosphorus."
        except Exception:
            pass
        return fert_name

    def recommend_fertilizer(self, crop, n, p, k, soil_type=None):
        if crop not in self.le_crop.classes_:
            return {"error": "Crop not recognized"}

        fert_data = self.data[self.data['Crop Type'] == crop].copy()

        if soil_type and soil_type in self.SOIL_TYPES:
            soil_filtered = fert_data[fert_data['Soil Type'] == soil_type]
            if len(soil_filtered) > 0:
                fert_data = soil_filtered

        if fert_data.empty:
            return {"error": "No fertilizer data for this crop"}

        fert_data = fert_data.copy()
        fert_data['distance'] = np.sqrt(
            (fert_data['Nitrogen']    - n) ** 2 +
            (fert_data['Phosphorous'] - p) ** 2 +
            (fert_data['Potassium']   - k) ** 2
        )
        best_row  = fert_data.loc[fert_data['distance'].idxmin()]
        fert_name = self.le_fertilizer.inverse_transform([int(best_row['Fertilizer Name Enc'])])[0]
        return {"Recommended Fertilizer": self.describe_fertilizer_npk(fert_name)}

    def get_soil_types(self):
        return self.SOIL_TYPES

    def get_crop_types(self):
        return self.CROP_TYPES
