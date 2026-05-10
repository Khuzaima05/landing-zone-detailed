#!/bin/bash

# IBM Cloud Landing Zone Documentation - Deploy Script
# This script deploys the documentation to GitHub Pages

set -e

echo "🚀 Deploying IBM Cloud Landing Zone Documentation"
echo "================================================="
echo ""

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
fi

# Confirm deployment
read -p "⚠️  This will deploy to GitHub Pages. Continue? [y/N]: " confirm
confirm=${confirm:-N}

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Check if git is configured
if ! git config user.name &> /dev/null; then
    echo "⚙️  Configuring git..."
    git config user.name "Documentation Deploy"
    git config user.email "docs@example.com"
fi

# Deploy to GitHub Pages
echo "📤 Deploying to GitHub Pages..."
mkdocs gh-deploy --force --clean --verbose

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your documentation will be available at:"
echo "   https://<username>.github.io/<repository>/"
echo ""
echo "Note: It may take a few minutes for changes to appear."
echo ""
