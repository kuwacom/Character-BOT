@echo off

REM Create Venv
py -3.10 -m venv ./venv

REM Activate virtual environment
call .\venv\Scripts\activate

REM Upgrade pip
python -m pip install --upgrade pip

echo Virtual environment setup complete.
