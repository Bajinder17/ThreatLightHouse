@echo off
echo Setting up ThreatLightHouse Application...
echo.

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv --clear
    if ERRORLEVEL 1 (
        echo Failed to create virtual environment!
        echo Please try manually with: python -m venv venv --clear
        goto error
    )
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
if ERRORLEVEL 1 (
    echo Failed to activate virtual environment!
    goto error
)

echo Installing Python dependencies...
pip install -r requirements.txt
if ERRORLEVEL 1 (
    echo Failed to install Python dependencies!
    goto error
)

echo Starting Python backend server...
start cmd /k "call venv\Scripts\activate.bat && python api/app.py"

echo Starting React frontend server...
start cmd /k "npm install && npm start"

echo.
echo ThreatLightHouse components started. Access the application at http://localhost:3000
goto end

:error
echo.
echo There was an error setting up the environment.
echo Please make sure Python is installed and not currently running.
echo Try closing all Command Prompt windows and try again.
echo.

:end
