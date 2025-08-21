@echo off
REM Windows batch script to start the Travel Home API server

echo Travel Home API Server Starter
echo ====================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Run the Python starter script
python "%~dp0start-api.py"
pause






