#!/bin/bash

# Script to connect local directory to GitHub repository
# https://github.com/alcaxchirag-sys/Spilt-tool.git

echo "Setting up GitHub connection..."

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add remote origin
echo "Adding remote origin..."
git remote remove origin 2>/dev/null  # Remove if exists
git remote add origin https://github.com/alcaxchirag-sys/Spilt-tool.git

# Verify remote
echo "Verifying remote connection..."
git remote -v

echo ""
echo "GitHub repository connected!"
echo ""
echo "Next steps:"
echo "1. Configure git user (if not already set):"
echo "   git config --global user.name 'Your Name'"
echo "   git config --global user.email 'your.email@example.com'"
echo ""
echo "2. Add files and make initial commit:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo ""
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo "   (or 'git push -u origin master' if using master branch)"

