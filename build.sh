#!/bin/bash
set -e

echo "Building Tradelia web app..."

# Check if apps/web exists
if [ ! -d "apps/web" ]; then
  echo "Error: apps/web directory not found"
  ls -la
  exit 1
fi

# Go to web app directory
cd apps/web

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the app
echo "Building Next.js app..."
npm run build

echo "Build completed successfully!"