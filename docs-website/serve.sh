#!/bin/bash

# IBM Cloud Landing Zone Documentation - Development Server
# This script starts the MkDocs development server with live reload

set -e

echo "🚀 Starting MkDocs development server..."
echo "========================================"
echo ""
echo "📝 Documentation will be available at: http://127.0.0.1:8000"
echo "🔄 Live reload is enabled - changes will be reflected automatically"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
fi

# Start the development server
mkdocs serve --dev-addr=127.0.0.1:8000
