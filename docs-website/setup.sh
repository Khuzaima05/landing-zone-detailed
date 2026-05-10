#!/bin/bash

# IBM Cloud Landing Zone Documentation - Setup Script
# This script installs all dependencies needed to build and serve the documentation

set -e

echo "🚀 IBM Cloud Landing Zone Documentation Setup"
echo "=============================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or later."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"
echo ""

# Create virtual environment (optional but recommended)
read -p "Do you want to create a virtual environment? (recommended) [Y/n]: " create_venv
create_venv=${create_venv:-Y}

if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
    
    echo "✅ Virtual environment created and activated"
    echo "   To activate it later, run: source venv/bin/activate"
    echo ""
fi

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip3 install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies from requirements.txt..."
pip3 install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run './serve.sh' to start the development server"
echo "  2. Run './build.sh' to build the static site"
echo "  3. Visit http://127.0.0.1:8000 to view the documentation"
echo ""
echo "For deployment:"
echo "  - Run './deploy.sh' to deploy to GitHub Pages"
echo ""

# Made with Bob
