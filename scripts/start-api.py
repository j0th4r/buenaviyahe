#!/usr/bin/env python3
"""
Start API Server Script

This script starts the Travel Home API server with proper setup.
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required.")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required packages."""
    api_dir = Path(__file__).parent.parent / "api" / "server"
    requirements_file = api_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "-r", str(requirements_file)
        ])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install requirements")
        sys.exit(1)

def start_server():
    """Start the Flask server."""
    api_dir = Path(__file__).parent.parent / "api" / "server"
    main_file = api_dir / "main.py"
    
    if not main_file.exists():
        print("❌ main.py not found!")
        sys.exit(1)
    
    print("🚀 Starting Travel Home API Server...")
    print("📍 Server will be available at: http://localhost:3001")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Change to the API server directory
    os.chdir(api_dir)
    
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    print("🌊 Travel Home API Server Starter")
    print("=" * 40)
    
    check_python_version()
    
    # Check if requirements are already installed
    try:
        import flask
        import flask_cors
        print("✅ Requirements already satisfied")
    except ImportError:
        install_requirements()
    
    start_server()

if __name__ == "__main__":
    main()






