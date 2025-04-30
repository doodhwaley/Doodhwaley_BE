#!/bin/bash

# Clean previous build
echo "Cleaning previous build..."
rm -rf node_modules
rm -rf build

# Install production dependencies
echo "Installing production dependencies..."
npm install --production

# Create build directory
echo "Creating build directory..."
mkdir -p build

# Copy necessary files
echo "Copying files to build directory..."
cp -r config build/
cp -r controllers build/
cp -r cron build/
cp -r middlewares build/
cp -r models build/
cp -r routes build/
cp .env.production build/.env
cp index.js build/
cp package.json build/
cp package-lock.json build/

# Create a zip file
echo "Creating release zip..."
cd build
zip -r ../doodhwaley-release.zip .

echo "Build completed successfully!"
echo "Release package: doodhwaley-release.zip" 