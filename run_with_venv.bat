@echo off
echo Starting ThreatLightHouse Application with virtual environment...
echo.

if not exist local_venv (
    echo Virtual environment not found. Please run setup_with_venv.bat first.
    goto :end
)

echo Starting Python backend server...
start cmd /k "call local_venv\Scripts\activate.bat && python api/app.py"

echo Starting React frontend server...
start cmd /k "npm install && npm start"

echo.
echo ThreatLightHouse components started. Access the application at http://localhost:3000

:end
