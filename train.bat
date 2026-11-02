@echo off
echo Starting Pest Detection Training...

cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt

echo Starting training...
python train_optimized.py

echo Training completed successfully!
pause
