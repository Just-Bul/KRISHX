#!/usr/bin/env python3
"""
Publication-quality per-class accuracy graph for the Crop Recommendation System.
Uses the actual trained KNN pipeline evaluated on the dataset it was built for.
"""

import os
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, accuracy_score

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR    = os.path.join(SCRIPT_DIR, 'analysis_output')
os.makedirs(OUT_DIR, exist_ok=True)

# ── Load model & data ─────────────────────────────────────────────────────────
m        = joblib.load(os.path.join(SCRIPT_DIR, 'crop_model.pkl'))
pipeline = m['pipeline']
le_soil  = m['le_soil']

df = pd.read_csv(os.path.join(SCRIPT_DIR, 'data_core_original.csv'))
df['Soil_enc'] = le_soil.transform(df['Soil Type'])

FEATURES = ['Temparature','Humidity','Moisture','Nitrogen','Potassium','Phosphorous','Soil_enc']
X = df[FEATURES]
y = df['Crop Type']

preds   = pipeline.predict(X)
overall = accuracy_score(y, preds)
report  = classification_report(y, preds, output_dict=True)

classes = sorted([c for c in report if c not in ('accuracy', 'macro avg', 'weighted avg')])
prec    = np.array([report[c]['precision'] for c in classes])
rec     = np.array([report[c]['recall']    for c in classes])
f1      = np.array([report[c]['f1-score']  for c in classes])

print(f"Overall Accuracy : {overall*100:.2f}%")
print(f"Macro Precision  : {report['macro avg']['precision']*100:.2f}%")
print(f"Macro Recall     : {report['macro avg']['recall']*100:.2f}%")
print(f"Macro F1         : {report['macro avg']['f1-score']*100:.2f}%")

# ── Plot ──────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(14, 7), facecolor='white')
ax.set_facecolor('white')

x     = np.arange(len(classes))
w     = 0.26
C_P   = '#1f77b4'   # blue  — precision
C_R   = '#ff7f0e'   # orange — recall
C_F   = '#2ca02c'   # green — F1

b1 = ax.bar(x - w,     prec, w, color=C_P, alpha=0.88, label='Precision', zorder=3)
b2 = ax.bar(x,         rec,  w, color=C_R, alpha=0.88, label='Recall',    zorder=3)
b3 = ax.bar(x + w,     f1,   w, color=C_F, alpha=0.88, label='F1-Score',  zorder=3)

# overall accuracy reference line
ax.axhline(y=overall, color='#d62728', ls='--', lw=1.8,
           label=f'Overall Accuracy ({overall*100:.1f}%)', zorder=4)

# value labels on bars
for bars, color in [(b1, C_P), (b2, C_R), (b3, C_F)]:
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, h + 0.005,
                f'{h:.2f}', ha='center', va='bottom',
                fontsize=8, color=color, fontweight='bold')

# axes
ax.set_xticks(x)
ax.set_xticklabels(classes, rotation=30, ha='right', fontsize=11, fontweight='bold')
ax.set_ylabel('Score', fontsize=13, fontweight='bold')
ax.set_xlabel('Crop Type', fontsize=13, fontweight='bold')
ax.set_title('Crop Recommendation System — Per-Class Accuracy (KNN)',
             fontsize=16, fontweight='bold', pad=14)
ax.set_ylim(0, 1.10)
ax.yaxis.set_major_formatter(matplotlib.ticker.PercentFormatter(xmax=1, decimals=0))

ax.grid(axis='y', linestyle='--', linewidth=0.6, alpha=0.55, color='#cccccc', zorder=0)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

ax.legend(fontsize=11, framealpha=0.9, loc='upper right')

# stats footer
stats = (f"Overall Accuracy: {overall*100:.1f}%   |   "
         f"Macro Precision: {report['macro avg']['precision']*100:.1f}%   |   "
         f"Macro Recall: {report['macro avg']['recall']*100:.1f}%   |   "
         f"Macro F1: {report['macro avg']['f1-score']*100:.1f}%")
fig.text(0.5, 0.01, stats, ha='center', va='bottom', fontsize=10,
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#eef4fb',
                   edgecolor='#1f77b4', linewidth=1))

fig.tight_layout(rect=[0, 0.05, 1, 1])

out_png = os.path.join(OUT_DIR, 'crop_recommendation_accuracy.png')
out_pdf = os.path.join(OUT_DIR, 'crop_recommendation_accuracy.pdf')
fig.savefig(out_png, dpi=300, bbox_inches='tight', facecolor='white')
fig.savefig(out_pdf, bbox_inches='tight', facecolor='white')
plt.close(fig)

print(f"Saved PNG: {out_png}")
print(f"Saved PDF: {out_pdf}")
