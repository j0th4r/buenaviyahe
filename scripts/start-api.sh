#!/bin/bash
# Unix/Linux/macOS script to start the Travel Home API server

echo "🌊 Travel Home API Server Starter"
echo "===================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Run the Python starter script
python3 "$SCRIPT_DIR/start-api.py"






