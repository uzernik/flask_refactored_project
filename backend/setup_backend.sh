## located in ~/flask_refactor_project/backend/
## TO RUN:
## rm -rf venv
## cd ~/flask_refactor_project/backend/
## bash -v setup_backend.sh

#!/bin/bash

# Ensure the script is run from the correct directory (e.g., project root of backend)
cd "$(dirname "$0")"

# Step 1: Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

# Step 2: Create a new virtual environment without pip
echo "Creating new virtual environment without pip..."
python3 -m venv venv --without-pip
if [ $? -ne 0 ]; then
    echo "Failed to create virtual environment. Please check your Python installation."
    exit 1
fi
echo "Virtual environment created successfully."

# Step 3: Activate the virtual environment
source venv/bin/activate

# Step 4: Manually install pip
echo "Manually installing pip..."
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
if [ $? -ne 0 ]; then
    echo "Failed to install pip."
    exit 1
fi
echo "Pip installed successfully."

# Step 5: Install Flask and dependencies
echo "Installing Flask, Werkzeug, flask-cors, pandas, yfinance, and scipy..."
pip install Flask==2.0.3 Werkzeug==2.0.1 flask-cors pandas yfinance scipy

# Step 6: Check if requirements.txt exists and install requirements
if [ -f "../requirements.txt" ]; then
    echo "Installing additional requirements from requirements.txt..."
    pip install -r ../requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install additional requirements."
        exit 1
    fi
else
    echo "requirements.txt not found, using default Flask installation."
fi

echo "Setup completed successfully."

# Step 7: Run the Flask application in the background
echo "Starting Flask application in the background..."
nohup python ./main.py > ./app.log 2>&1 &
echo "Flask application started in the background, PID $!"

# Return to the initial directory
cd ..
