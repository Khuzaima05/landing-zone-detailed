#!/bin/bash
set -e

echo "Installing dependencies with uv pip..."
uv pip install --system -r requirements.txt

echo "Building MkDocs site..."
mkdocs build

echo "Build complete!"

# Made with Bob
