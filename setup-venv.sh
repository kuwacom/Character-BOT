#!/bin/bash
# Check for Python 3.10
if ! python3 --version | grep -q "3.10"; then
    echo "Python 3.10 is required."
    exit 1
fi

# install python3 vnev
apt install -y python3.10-venv

# Create virtual environment
python3 -m venv ./venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
python3 -m pip install --upgrade pip

echo "Virtual environment setup complete."
