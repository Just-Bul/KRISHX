# Enhanced Pest Detection Model
import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from keras.preprocessing import image
import warnings
warnings.filterwarnings('ignore')
try:
    import pillow_heif
    pillow_heif.register_heif_opener()  # lets Image.open() decode iPhone/Android HEIC/HEIF photos
except Exception:
    pass
try:
    import tf_keras
except Exception:
    tf_keras = None

def _get_preprocess_fn(name):
    """Return the correct preprocessing function by model family name."""
    name = (name or '').lower()
    if 'efficientnet' in name:
        from tensorflow.keras.applications.efficientnet import preprocess_input
        return preprocess_input
    elif 'mobilenet' in name:
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
        return preprocess_input
    else:
        # Default: simple /255 rescale
        return lambda x: x / 255.0

class PestDetector:
    def __init__(self, model_path='pest_model/pest_model_best.h5', labels_path='pest_model/labels.json'):
        """Initialize the pest detector with model and labels"""
        self.model = None
        self.labels = None
        self.class_mappings = None
        self.model_path = model_path
        self.labels_path = labels_path
        self._model_mtime = None
        self.load_model()

    def is_stale(self):
        """Return True if the model file has been updated since last load."""
        try:
            return os.path.getmtime(self.model_path) != self._model_mtime
        except OSError:
            return False
    
    def load_model(self):
        """Load the trained model and labels with fallbacks"""
        try:
            model_candidates = [self.model_path]
            last_load_errors = []
            if self.model_path.endswith('pest_model_best.h5'):
                model_candidates.append(self.model_path.replace('pest_model_best.h5', 'pest_model_final.h5'))

            for candidate in model_candidates:
                if os.path.exists(candidate):
                    # Try TensorFlow/Keras loaders with compatibility options to support
                    # models saved with different Keras generations.
                    load_errors = []
                    for loader_name, loader in (
                        ("tf.keras", tf.keras.models.load_model),
                        ("tf_keras", tf_keras.models.load_model if tf_keras else None),
                    ):
                        if loader is None:
                            continue
                        try:
                            self.model = loader(candidate, compile=False, safe_mode=False)
                            self.model_path = candidate
                            print(f"[OK] Loaded model from {candidate} using {loader_name}")
                            break
                        except TypeError:
                            # Older TensorFlow versions may not support safe_mode.
                            self.model = loader(candidate, compile=False)
                            self.model_path = candidate
                            print(f"[OK] Loaded model from {candidate} using {loader_name}")
                            break
                        except Exception as e:
                            load_errors.append(f"{loader_name}: {e}")

                    if self.model is not None:
                        break
                    else:
                        last_load_errors.extend(load_errors)
                        print(f"[WARN] Failed loading {candidate}. Tried -> {' | '.join(load_errors)}")

            if self.model is None:
                existing = [p for p in model_candidates if os.path.exists(p)]
                if existing:
                    raise RuntimeError(
                        f"Model files found but failed to load: {existing}. "
                        f"Errors: {' | '.join(last_load_errors)}"
                    )
                raise FileNotFoundError(f"Model file not found: tried {model_candidates}")

            # Load labels with fallback to same directory as model
            labels_candidates = [self.labels_path, os.path.join(os.path.dirname(self.model_path), 'labels.json')]
            for lpath in labels_candidates:
                if os.path.exists(lpath):
                    with open(lpath, 'r') as f:
                        self.labels = json.load(f)
                    self.labels_path = lpath
                    print(f"[OK] Loaded labels from {lpath}")
                    break

            if self.labels is None:
                raise FileNotFoundError(f"Labels file not found: tried {labels_candidates}")

            # Load class mappings if available (same directory as model)
            mappings_path = os.path.join(os.path.dirname(self.model_path), 'class_mappings.json')
            if os.path.exists(mappings_path):
                with open(mappings_path, 'r') as f:
                    self.class_mappings = json.load(f)
                print(f"[OK] Loaded class mappings from {mappings_path}")

            # Load preprocessing type from model_config.json (written by training script)
            config_path = os.path.join(os.path.dirname(self.model_path), 'model_config.json')
            preprocess_name = 'efficientnet'   # safe default for current model
            if os.path.exists(config_path):
                with open(config_path) as f:
                    cfg = json.load(f)
                preprocess_name = cfg.get('preprocessing', preprocess_name)
            self._preprocess_fn = _get_preprocess_fn(preprocess_name)
            print(f"[OK] Preprocessing: {preprocess_name}")

            # Record file modification time so we can detect when training saves a new model
            try:
                self._model_mtime = os.path.getmtime(self.model_path)
            except OSError:
                pass

        except Exception as e:
            print(f"[ERROR] Error loading model: {e}")
            raise e
    
    def preprocess_image(self, img, target_size=(224, 224)):
        """Preprocess image for prediction using the model-specific preprocessing."""
        if isinstance(img, str):
            img = Image.open(img).convert('RGB')
        elif not isinstance(img, Image.Image):
            img = Image.fromarray(img).convert('RGB')

        img = img.resize(target_size)
        img_array = image.img_to_array(img)          # shape (H, W, 3), float32 [0-255]
        img_array = np.expand_dims(img_array, axis=0) # shape (1, H, W, 3)
        img_array = self._preprocess_fn(img_array)    # model-specific scaling
        return img_array
    
    def predict(self, img, top_k=3):
        """Predict pest class from image"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Preprocess image
        processed_img = self.preprocess_image(img)
        
        # Get predictions
        predictions = self.model.predict(processed_img, verbose=0)[0]
        
        # Get top-k predictions
        top_indices = np.argsort(predictions)[-top_k:][::-1]
        top_predictions = []
        
        for idx in top_indices:
            class_name = self.labels[idx] if idx < len(self.labels) else f"Class_{idx}"
            confidence = float(predictions[idx])
            top_predictions.append({
                'class': class_name,
                'confidence': confidence,
                'index': int(idx)
            })
        
        return top_predictions
    
    def predict_single(self, img):
        """Predict single best pest class"""
        predictions = self.predict(img, top_k=1)
        return predictions[0] if predictions else None
    
    def get_class_info(self, class_name):
        """Get information about a specific pest class"""
        if self.class_mappings:
            return {
                'name': class_name,
                'index': self.class_mappings['class_to_idx'].get(class_name, -1),
                'total_classes': len(self.labels)
            }
        return {'name': class_name, 'index': -1, 'total_classes': len(self.labels)}
    
    def get_model_info(self):
        """Get model information"""
        return {
            'model_path': self.model_path,
            'labels_path': self.labels_path,
            'num_classes': len(self.labels) if self.labels else 0,
            'class_names': self.labels if self.labels else [],
            'model_loaded': self.model is not None,
            'labels_loaded': self.labels is not None
        }

# Global detector instance
_detector = None
_detector_error = None

def get_detector():
    """Get or create global detector instance. Auto-reloads when training saves a new model."""
    global _detector, _detector_error
    # If a new model was saved by training, reload it
    if _detector is not None and _detector.is_stale():
        print("[INFO] Model file updated — reloading detector...")
        _detector = None
        _detector_error = None
    if _detector is None:
        if _detector_error is not None:
            raise RuntimeError(_detector_error)
        try:
            _detector = PestDetector()
        except Exception as e:
            _detector_error = str(e)
            raise
    return _detector

def predict_from_pil(img, model_path='pest_model/pest_model_best.h5', labels_path='pest_model/labels.json'):
    """Legacy function for backward compatibility"""
    try:
        # Reuse global detector to avoid repeated expensive loads and repeated errors.
        detector = get_detector()
        result = detector.predict_single(img)
        
        if result:
            return {
                'label': result['class'],
                'confidence': result['confidence'],
                'all_scores': {pred['class']: pred['confidence'] for pred in detector.predict(img, top_k=len(detector.labels))}
            }
        else:
            return {'label': 'Unknown', 'confidence': 0.0, 'all_scores': {}}
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {'label': 'Error', 'confidence': 0.0, 'all_scores': {}, 'error': str(e)}

def predict_pest_detailed(img, top_k=3):
    """Enhanced prediction with detailed results"""
    try:
        detector = get_detector()
        predictions = detector.predict(img, top_k=top_k)
        
        return {
            'success': True,
            'predictions': predictions,
            'best_prediction': predictions[0] if predictions else None,
            'model_info': detector.get_model_info()
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'predictions': [],
            'best_prediction': None
        }

def get_pest_classes():
    """Get list of available pest classes"""
    try:
        detector = get_detector()
        return {
            'success': True,
            'classes': detector.labels,
            'num_classes': len(detector.labels)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'classes': [],
            'num_classes': 0
        }

# Test function
def test_model():
    """Test the model with a sample image"""
    try:
        detector = get_detector()
        print("Model Info:", detector.get_model_info())
        
        # Create a dummy image for testing
        dummy_img = Image.new('RGB', (224, 224), color='red')
        result = detector.predict_single(dummy_img)
        print("Test prediction:", result)
        
        return True
    except Exception as e:
        print(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    test_model()