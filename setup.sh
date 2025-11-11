#!/bin/bash

# Safe Map Setup Script
# This script helps set up the Safe Map application

set -e

echo "🗺️  Safe Map Setup Script"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install root dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Setting up environment variables..."

# Backend .env
if [ ! -f "packages/server/.env" ]; then
    echo "Creating backend .env file..."
    cp packages/server/.env.example packages/server/.env
    echo "✅ Created packages/server/.env"
else
    echo "⚠️  packages/server/.env already exists"
fi

# Frontend .env
if [ ! -f "packages/web/.env" ]; then
    echo "Creating frontend .env file..."
    cp packages/web/.env.example packages/web/.env
    echo "✅ Created packages/web/.env"
else
    echo "⚠️  packages/web/.env already exists"
fi

echo ""
echo "🔑 Google Maps API Key Setup"
echo "=============================="
echo ""
echo "To use Safe Map, you need a Google Maps API Key:"
echo "1. Visit: https://console.cloud.google.com/"
echo "2. Create a new project or select existing"
echo "3. Enable 'Maps JavaScript API' and 'Places API'"
echo "4. Create an API Key"
echo ""

read -p "Do you have a Google Maps API Key? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Google Maps API Key: " api_key
    
    # Update backend .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your_google_maps_api_key_here/$api_key/g" packages/server/.env
        sed -i '' "s/your_google_maps_api_key_here/$api_key/g" packages/web/.env
    else
        # Linux
        sed -i "s/your_google_maps_api_key_here/$api_key/g" packages/server/.env
        sed -i "s/your_google_maps_api_key_here/$api_key/g" packages/web/.env
    fi
    
    echo "✅ API key configured"
else
    echo "⚠️  You'll need to manually add your API key to:"
    echo "   - packages/server/.env"
    echo "   - packages/web/.env"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Google Maps API Key (if you haven't already)"
echo "2. Run 'npm run dev' to start the application"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see:"
echo "- README.md - Full documentation"
echo "- QUICKSTART.md - Quick start guide"
echo "- API.md - API documentation"
echo ""
echo "Happy mapping! 🚀"
