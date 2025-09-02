#!/bin/bash

# GitHub Sync Script for Version Management
# This script syncs your local versions with GitHub

echo "🔄 GitHub Version Sync"
echo "======================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first."
    exit 1
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "❌ No remote repository configured."
    echo "Add one with: git remote add origin <your-github-url>"
    exit 1
fi

# Function to push all versions
push_versions() {
    echo "📤 Pushing all local versions to GitHub..."
    
    # Push main branch
    echo "Pushing main branch..."
    git push origin main
    
    # Push all version branches
    echo "Pushing version branches..."
    git push origin --all
    
    echo "✅ All versions pushed to GitHub!"
}

# Function to pull all versions
pull_versions() {
    echo "📥 Pulling all versions from GitHub..."
    
    # Fetch all branches
    git fetch --all
    
    # List remote version branches
    echo "Available remote versions:"
    git branch -r | grep "version/"
    
    echo "✅ All versions fetched from GitHub!"
}

# Function to sync (pull then push)
sync_versions() {
    echo "🔄 Syncing with GitHub..."
    pull_versions
    push_versions
    echo "✅ Sync complete!"
}

# Main menu
if [ "$1" == "push" ]; then
    push_versions
elif [ "$1" == "pull" ]; then
    pull_versions
elif [ "$1" == "sync" ]; then
    sync_versions
else
    echo "Usage:"
    echo "  ./scripts/github-sync.sh push  - Push all versions to GitHub"
    echo "  ./scripts/github-sync.sh pull  - Pull all versions from GitHub"
    echo "  ./scripts/github-sync.sh sync  - Sync (pull then push)"
fi