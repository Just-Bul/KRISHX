#!/usr/bin/env python3
"""
Publication-quality confusion matrix for the Pest Detection System.
- Model  : EfficientNetB4 (pest_model_best.h5)
- Data   : dataset2, validation split (same seed/shuffle as training)
- Output : confusion_matrix.png  +  confusion_matrix.pdf

Run locally  : python generate_confusion_matrix.py
Run in Colab : set COLAB = True and mount your Drive first.
"""

# ─── 0. Colab toggle ──────────────────────────────────────────────────────────
COLAB = False          # ← set True when running in Google Colab

if COLAB:
    from google.colab import drive
    drive.mount('/content/drive')
    # ↓ Adjust these two paths to wherever your files live on Drive
    DATASET_DIR = '/content/drive/MyDrive/AI_AGRI/dataset2'
    MODEL_PATH  = '/content/drive/MyDrive/AI_AGRI/pest_model/pest_model_best.h5'
    OUT_DIR     = '/content/drive/MyDrive/AI_AGRI/pest_model'
else:
    import os
    _HERE       = os.path.dirname(os.path.abspath(__file__))
    DATASET_DIR = os.path.abspath(os.path.join(_HERE, '..', 'dataset2'))
    MODEL_PATH  = os.path.join(_HERE, 'pest_model', 'pest_model_best.h5')
    OUT_DIR     = os.path.join(_HERE, 'pest_model')

# ─── 1. Imports ───────────────────────────────────────────────────────────────
import json, itertools
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.colors import LinearSegmentedColormap
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import (confusion_matrix, classification_report,
                             accuracy_score, precision_score,
                             recall_score, f1_score)

os.makedirs(OUT_DIR, exist_ok=True)

print("TensorFlow:", tf.__version__)
print(f"Dataset  : {DATASET_DIR}")
print(f"Model    : {MODEL_PATH}")

# ─── 2. Constants (must match training in train_dataset2.py) ──────────────────
INPUT_SHAPE = (224, 224, 3)
BATCH_SIZE  = 16
VAL_SPLIT   = 0.20
SEED        = 42

CLASS_NAMES = [
    "ants", "bees", "beetle", "catterpillar", "earthworms",
    "earwig", "grasshopper", "moth", "slug", "snail", "wasp", "weevil"
]

# ─── 3. Validation generator (identical settings to training script) ───────────
print("\nBuilding validation generator...")
val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=VAL_SPLIT
)
val_gen = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=INPUT_SHAPE[:2],
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    classes=CLASS_NAMES,          # enforce exact class order
    shuffle=False,
    seed=SEED
)

print(f"  Validation samples : {val_gen.samples}")
print(f"  Classes found      : {list(val_gen.class_indices.keys())}")

# ─── 4. Load model & predict ──────────────────────────────────────────────────
print("\nLoading model…")
model = load_model(MODEL_PATH)

print("Running predictions on validation set…")
val_gen.reset()
raw_preds   = model.predict(val_gen, verbose=1)
pred_labels = np.argmax(raw_preds, axis=1)
true_labels = val_gen.classes

# ─── 5. Metrics ───────────────────────────────────────────────────────────────
acc       = accuracy_score(true_labels, pred_labels)
mac_prec  = precision_score(true_labels, pred_labels, average='macro', zero_division=0)
mac_rec   = recall_score(true_labels, pred_labels, average='macro',    zero_division=0)
mac_f1    = f1_score(true_labels, pred_labels, average='macro',        zero_division=0)

print("\n" + "="*60)
print("  PERFORMANCE SUMMARY")
print("="*60)
print(f"  Overall Accuracy  : {acc*100:.2f}%")
print(f"  Macro Precision   : {mac_prec*100:.2f}%")
print(f"  Macro Recall      : {mac_rec*100:.2f}%")
print(f"  Macro F1-Score    : {mac_f1*100:.2f}%")
print("="*60)

print("\n  CLASSIFICATION REPORT\n" + "-"*60)
print(classification_report(true_labels, pred_labels,
                             target_names=CLASS_NAMES, digits=4))

# ─── 6. Confusion matrix ──────────────────────────────────────────────────────
cm = confusion_matrix(true_labels, pred_labels)

# Normalised version (row = true class → percentage recalled)
cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)

# ─── 7. Strongest off-diagonal confusion pairs ────────────────────────────────
print("  TOP CONFUSION PAIRS (off-diagonal, by count)")
print("-"*60)
off_diag = []
for i in range(len(CLASS_NAMES)):
    for j in range(len(CLASS_NAMES)):
        if i != j and cm[i, j] > 0:
            off_diag.append((cm[i, j], CLASS_NAMES[i], CLASS_NAMES[j]))
off_diag.sort(reverse=True)
for count, true_c, pred_c in off_diag[:10]:
    print(f"  True={true_c:<14s}  Predicted={pred_c:<14s}  Count={count}")
print()

# ─── 8. Publication-quality plot ──────────────────────────────────────────────
N = len(CLASS_NAMES)

# Academic blue colormap (white → dark blue)
blues = LinearSegmentedColormap.from_list(
    'academic_blues',
    ['#ffffff', '#c6dbef', '#6baed6', '#2171b5', '#08306b'],
    N=256
)

fig, ax = plt.subplots(figsize=(14, 12), facecolor='white')
ax.set_facecolor('white')

im = ax.imshow(cm, interpolation='nearest', cmap=blues,
               vmin=0, vmax=cm.max())

# ── colour bar ────────────────────────────────────────────────────────────────
cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
cbar.set_label('Count', fontsize=13)
cbar.ax.tick_params(labelsize=11)

# ── tick labels ───────────────────────────────────────────────────────────────
tick_marks = np.arange(N)
ax.set_xticks(tick_marks)
ax.set_yticks(tick_marks)
ax.set_xticklabels(CLASS_NAMES, rotation=45, ha='right',
                   fontsize=12, fontweight='bold')
ax.set_yticklabels(CLASS_NAMES, fontsize=12, fontweight='bold')

# ── cell annotations ──────────────────────────────────────────────────────────
thresh = cm.max() / 2.0
for i, j in itertools.product(range(N), range(N)):
    count = cm[i, j]
    pct   = cm_norm[i, j] * 100
    color = 'white' if count > thresh else 'black'

    # Primary: raw count (large)
    ax.text(j, i - 0.12, str(count),
            ha='center', va='center',
            fontsize=11, fontweight='bold', color=color)
    # Secondary: percentage (small)
    ax.text(j, i + 0.22, f'{pct:.1f}%',
            ha='center', va='center',
            fontsize=8, color=color, alpha=0.85)

# ── axes labels & title ───────────────────────────────────────────────────────
ax.set_xlabel('Predicted', fontsize=15, fontweight='bold', labelpad=12)
ax.set_ylabel('True',      fontsize=15, fontweight='bold', labelpad=12)
ax.set_title('Confusion Matrix',
             fontsize=18, fontweight='bold', pad=18)

# ── grid lines between cells ─────────────────────────────────────────────────
ax.set_xticks(np.arange(N) - 0.5, minor=True)
ax.set_yticks(np.arange(N) - 0.5, minor=True)
ax.grid(which='minor', color='white', linewidth=1.5)
ax.tick_params(which='minor', length=0)

# ── summary stats text box ───────────────────────────────────────────────────
stats_text = (
    f"Accuracy : {acc*100:.2f}%   |   "
    f"Macro Precision : {mac_prec*100:.2f}%   |   "
    f"Macro Recall : {mac_rec*100:.2f}%   |   "
    f"Macro F1 : {mac_f1*100:.2f}%"
)
fig.text(0.5, 0.01, stats_text,
         ha='center', va='bottom', fontsize=11,
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#eef4fb',
                   edgecolor='#2171b5', linewidth=1))

fig.tight_layout(rect=[0, 0.04, 1, 1])

# ─── 9. Save ──────────────────────────────────────────────────────────────────
png_path = os.path.join(OUT_DIR, 'confusion_matrix.png')
pdf_path = os.path.join(OUT_DIR, 'confusion_matrix.pdf')

fig.savefig(png_path, dpi=300, bbox_inches='tight', facecolor='white')
fig.savefig(pdf_path, bbox_inches='tight', facecolor='white')
plt.close(fig)

print(f"Saved PNG : {png_path}")
print(f"Saved PDF : {pdf_path}")
print("\nDone.")
