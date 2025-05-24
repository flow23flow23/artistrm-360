#!/bin/bash

echo "🚀 ArtistRM 360 - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm 9+ first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install functions dependencies
echo "📦 Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Firebase credentials"
fi

# Initialize git hooks
echo "🔧 Setting up git hooks..."
npx husky install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Firebase credentials"
echo "2. Run 'firebase login' to authenticate"
echo "3. Run 'firebase use zamx-v1' to select your project"
echo "4. Run 'npm run dev:all' to start development"
echo ""
echo "Happy coding! 🎉"