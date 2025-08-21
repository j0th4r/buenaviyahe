#!/usr/bin/env python3
"""
Simple script to run the Travel Home API server.
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages."""
    print("📦 Installing requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def run_server():
    """Run the Flask server."""
    print("🚀 Starting Travel Home API Server...")
    os.system(f"{sys.executable} main.py")

if __name__ == "__main__":
    try:
        # Check if requirements are installed
        import flask
        import flask_cors
    except ImportError:
        print("❌ Missing dependencies. Installing...")
        install_requirements()
    
    run_server()
