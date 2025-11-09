@echo off
REM Video Categorizer - Easy Run Script for Windows 11
REM This batch file makes it easy to run the video categorizer

echo ============================================================
echo VIDEO CATEGORIZER - AI-Powered Video Organization
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Check if config.json exists
if not exist "config.json" (
    echo WARNING: config.json not found
    echo Creating from config.json.example...
    if exist "config.json.example" (
        copy config.json.example config.json
        echo.
        echo Please edit config.json and add your OpenAI API key
        echo Then run this script again.
        pause
        exit /b 1
    ) else (
        echo ERROR: config.json.example not found
        pause
        exit /b 1
    )
)

REM Check if videos folder exists
if not exist "videos" (
    echo Creating videos folder...
    mkdir videos
    echo.
    echo Please place your video files in the "videos" folder
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Checking dependencies...
pip show openai >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Run the script
echo.
echo Starting video categorization...
echo.
python video_categorizer.py

REM Pause at the end so user can see results
echo.
echo ============================================================
pause
