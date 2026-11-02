# KRISHX – AI-Powered Agricultural Assistant

KRISHX is a unified platform that helps farmers decide **what to grow, what to fertilize with, and what is attacking their crops**.

## Features
- **Crop recommendation** – suggests suitable crops from soil type, temperature, humidity, moisture and NPK levels.
- **Fertilizer guidance** – picks the closest fertilizer profile to the soil's nutrient needs.
- **Pest detection** – identify pests from an uploaded photo using an EfficientNetB4 transfer-learning model (12+ pest classes), returning top-k confidences.
- **Analytics** – training curves, confusion matrices and comparison charts generated under `backend/analysis_output/`.

## Tech Stack
- **Backend:** Python, Flask, scikit-learn (Random Forest), TensorFlow/Keras, Pandas, Pillow/OpenCV
- **Web frontend:** React 19 + Vite
- **Mobile app:** React Native (Expo)
- **Docs:** see [`docs/`](docs/) and [`Project_Report.md`](Project_Report.md)

## Project Structure
```
backend/    Flask API, ML models, training and analysis scripts
frontend/   React + Vite web app
mobile/     Expo / React Native app
docs/       Project, architecture, deployment and user documentation
diagrams/   Architecture and evaluation diagrams
```

## Getting Started
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py          # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev
```
On Windows, `start_dev.bat` starts both. Large datasets and trained model files (`*.h5`, `*.pkl`) are not stored in this repository; see `docs/` for how to train them (`train.bat`).
