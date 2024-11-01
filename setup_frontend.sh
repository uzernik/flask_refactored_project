#!/bin/bash
## located in ~/flask_refactor_project/
## cd ~/flask_refactor_project/
## bash -v setup_frontend.sh


# Ensure the script is run from the correct directory (e.g., project root)
cd "$(dirname "$0")" || { echo "Failed to change directory to script location."; exit 1; }

# Logging start
echo "Starting frontend setup..."

# Step 1: Check and create frontend directory if it doesn't exist
echo "Checking if frontend directory exists..."
if [ ! -d "frontend" ]; then
    echo "Creating frontend directory and initializing React project..."
    mkdir -p frontend && cd frontend || { echo "Failed to create or change to frontend directory."; exit 1; }

    # Step 2: Initialize a new React project
    echo "Initializing new React project..."
    npx create-react-app . || { echo "Failed to create React project."; exit 1; }
else
    echo "Frontend directory already exists."
    cd frontend || { echo "Failed to change to frontend directory."; exit 1; }
fi

# Step 3: Check if node_modules directory exists
echo "Checking if node_modules directory exists..."
if [ ! -d "node_modules" ]; then
    echo "node_modules not found, running npm install to set up dependencies..."
    npm install || { echo "Failed to install dependencies."; exit 1; }
else
    echo "node_modules directory already exists, skipping npm install."
fi

# Step 4: Install additional dependencies
echo "Installing additional dependencies..."
npm install axios react-router-dom react-chartjs-2 chart.js react-select || { echo "Failed to install additional dependencies."; exit 1; }
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools


# Step 5: Copy .env file from project root
echo "Copying .env file from project root..."
cp ../.env . || { echo "Failed to copy .env file."; exit 1; }

# Step 6: Check package.json for proxy setting
echo "Checking package.json for proxy setting..."
if ! grep -q '"proxy": "http://127.0.0.1:5000"' package.json; then
    echo "Setting up proxy to Flask backend in package.json..."
    sed -i 's/"dependencies": {/"proxy": "http:\/\/127.0.0.1:5000",\n  "dependencies": {/' package.json || { echo "Failed to set proxy in package.json."; exit 1; }
fi

# Step 7: Automatically start the React development server with nohup and logging
echo "Automatically starting the React development server in a detached mode..."
nohup npm start > frontend.log 2>&1 &

echo "React development server started, logs are being written to frontend.log."
echo "To stop the server, kill the PID: $!"

# End script
echo "Frontend setup completed successfully."
