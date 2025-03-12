@echo off
echo Setting up ThreatLightHouse with virtual environment...
echo.

python --version >nul 2>&1
if ERRORLEVEL 1 (
    echo Python is not installed or not in PATH. Please install Python first.
    goto :end
)

if not exist local_venv (
    echo Creating virtual environment...
    python -m venv local_venv
    if ERRORLEVEL 1 (
        echo Failed to create virtual environment.
        goto :end
    )
)

echo Activating virtual environment...
call local_venv\Scripts\activate.bat
if ERRORLEVEL 1 (
    echo Failed to activate virtual environment.
    goto :end
)

echo Installing Flask and other essential packages...
pip install flask==2.0.1 flask-cors==3.0.10 requests==2.27.1 python-dotenv==0.19.2

echo.
echo Installing scanning libraries...
pip install virustotal-python==0.1.3 python-nmap==0.7.1

echo.
echo Installing database connection...
pip install supabase==0.7.1

echo.
echo Installing utilities...
pip install urllib3==1.26.9 werkzeug==2.0.3 pyopenssl==22.0.0

echo.
echo Installing report generation packages...
pip install reportlab==3.6.12 pillow==9.2.0

echo.
echo Setup complete!
echo.
echo To run the application:
echo 1. First activate the virtual environment:
echo    call local_venv\Scripts\activate.bat
echo 2. Then start the application:
echo    python api/app.py

:end
