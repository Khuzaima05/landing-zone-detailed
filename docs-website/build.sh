#!/bin/bash

# IBM Cloud Landing Zone Documentation - Build Script
# This script builds the static documentation site

set -e

echo "🏗️  Building IBM Cloud Landing Zone Documentation"
echo "================================================"
echo ""

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
fi

# Clean previous build
if [ -d "site" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf site
fi

# Build the documentation
echo "📦 Building documentation..."
mkdocs build --verbose

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Static site generated in: ./site/"
echo "📊 Site size: $(du -sh site | cut -f1)"
echo ""
echo "To preview the built site:"
echo "  cd site && python3 -m http.server 8000"
echo ""
