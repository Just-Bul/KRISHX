#!/usr/bin/env python3
"""
Generate accuracy graphs for:
  1. Pest Detection System  (EfficientNetB4 - real 2-phase training logs)
  2. Crop Recommendation System (KNN - k-neighbors vs accuracy curve)
"""

import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import joblib
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR    = os.path.join(SCRIPT_DIR, 'analysis_output')
os.makedirs(OUT_DIR, exist_ok=True)

BLUE   = '#1f77b4'
ORANGE = '#ff7f0e'
GREEN  = '#2ca02c'
RED    = '#d62728'
GRAY   = '#888888'


def _apply_style(ax, title, xlabel, ylabel, pct=True):
    ax.set_title(title, fontsize=15, fontweight='bold', pad=12)
    ax.set_xlabel(xlabel, fontsize=12)
    ax.set_ylabel(ylabel, fontsize=12)
    ax.set_facecolor('white')
    ax.grid(True, linestyle='--', linewidth=0.6, alpha=0.55, color='#cccccc')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    if pct:
        ax.yaxis.set_major_formatter(mticker.PercentFormatter(xmax=1, decimals=0))
    ax.legend(fontsize=11, framealpha=0.9)


# ─── Graph 1 : Pest Detection — epoch accuracy curves ───────────────────────

def plot_pest_detection():
    p1 = pd.read_csv(os.path.join(SCRIPT_DIR, 'pest_model', 'training_log_phase1.csv'))
    p2 = pd.read_csv(os.path.join(SCRIPT_DIR, 'pest_model', 'training_log_phase2.csv'))

    n1 = len(p1)
    e1 = np.arange(1, n1 + 1)
    e2 = np.arange(n1 + 1, n1 + len(p2) + 1)

    fig, ax = plt.subplots(figsize=(11, 6), facecolor='white')

    # Phase 1
    ax.plot(e1, p1['accuracy'],     color=BLUE,   lw=2, marker='o', ms=4,
            label='Training Accuracy (Phase 1 – feature extraction)')
    ax.plot(e1, p1['val_accuracy'], color=ORANGE, lw=2, marker='s', ms=4,
            label='Validation Accuracy (Phase 1)')

    # Phase 2
    ax.plot(e2, p2['accuracy'],     color=BLUE,   lw=2, marker='o', ms=4,
            ls='--', label='Training Accuracy (Phase 2 – fine-tune)')
    ax.plot(e2, p2['val_accuracy'], color=ORANGE, lw=2, marker='s', ms=4,
            ls='--', label='Validation Accuracy (Phase 2)')

    # Phase boundary
    ax.axvline(x=n1 + 0.5, color=GRAY, ls=':', lw=1.5, label='Fine-tune start')

    best_val = max(p1['val_accuracy'].max(), p2['val_accuracy'].max())
    ax.axhline(y=best_val, color=GREEN, ls='-.', lw=1.2,
               label=f'Best Val Acc ({best_val:.1%})')

    # Annotate final val accuracy
    final_val = p2['val_accuracy'].iloc[-1]
    ax.annotate(f'{final_val:.1%}',
                xy=(e2[-1], final_val),
                xytext=(e2[-1] - 3, final_val - 0.025),
                fontsize=10, color=ORANGE,
                arrowprops=dict(arrowstyle='->', color=ORANGE, lw=1))

    _apply_style(ax,
                 title='Pest Detection System — Training & Validation Accuracy',
                 xlabel='Epoch',
                 ylabel='Accuracy')
    ax.set_ylim(0.72, 1.00)

    fig.tight_layout()
    out = os.path.join(OUT_DIR, 'pest_detection_accuracy.png')
    fig.savefig(out, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"[OK] Pest detection graph saved: {out}")


# ─── Graph 2 : Crop Recommendation — k vs accuracy curve ────────────────────

def plot_crop_recommendation():
    from sklearn.model_selection import train_test_split

    m       = joblib.load(os.path.join(SCRIPT_DIR, 'crop_model.pkl'))
    le_soil = m['le_soil']

    df = pd.read_csv(os.path.join(SCRIPT_DIR, 'data_core_original.csv'))
    df['Soil_enc'] = le_soil.transform(df['Soil Type'])

    FEATURES = ['Temparature','Humidity','Moisture','Nitrogen','Potassium','Phosphorous','Soil_enc']
    X = df[FEATURES]
    y = df['Crop Type']

    # Train on full dataset (same as deployed model) and evaluate on same data
    scaler = StandardScaler().fit(X)
    Xs     = scaler.transform(X)

    k_values = list(range(1, 52, 2))
    accs     = []

    for k in k_values:
        knn = KNeighborsClassifier(n_neighbors=k, metric='euclidean', weights='uniform')
        knn.fit(Xs, y)
        accs.append(accuracy_score(y, knn.predict(Xs)))
        print(f"  k={k:2d}  acc={accs[-1]:.4f}")

    accs = np.array(accs)

    selected_k   = 15
    selected_acc = accs[k_values.index(selected_k)]

    fig, ax = plt.subplots(figsize=(11, 6), facecolor='white')

    ax.plot(k_values, accs, color=BLUE, lw=2.5, marker='o', ms=5,
            label='Model Accuracy (full dataset)')

    ax.axvline(x=selected_k, color=GRAY, ls=':', lw=1.5,
               label=f'Selected k = {selected_k}')

    ax.axhline(y=selected_acc, color=GREEN, ls='-.', lw=1.2,
               label=f'Accuracy at k=15 ({selected_acc:.1%})')

    ax.scatter([selected_k], [selected_acc], color=RED, zorder=5, s=80)
    ax.annotate(f'{selected_acc:.1%}',
                xy=(selected_k, selected_acc),
                xytext=(selected_k + 3, selected_acc - 0.04),
                fontsize=10, color=RED,
                arrowprops=dict(arrowstyle='->', color=RED, lw=1))

    _apply_style(ax,
                 title='Crop Recommendation System — Accuracy vs Number of Neighbours (KNN)',
                 xlabel='Number of Neighbours (k)',
                 ylabel='Accuracy')
    ax.set_xticks(k_values[::2])
    ax.set_ylim(0.70, 1.02)

    fig.tight_layout()
    out = os.path.join(OUT_DIR, 'crop_recommendation_accuracy.png')
    fig.savefig(out, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"[OK] Crop recommendation graph saved: {out}")


if __name__ == '__main__':
    print("=== Graph 1: Pest Detection ===")
    plot_pest_detection()
    print("\n=== Graph 2: Crop Recommendation ===")
    plot_crop_recommendation()
    print("\nDone. Both graphs saved to analysis_output/")
