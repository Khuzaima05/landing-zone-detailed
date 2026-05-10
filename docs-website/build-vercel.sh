#!/bin/bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Building MkDocs site..."
mkdocs build

echo "Build complete!"

# Made with Bob
