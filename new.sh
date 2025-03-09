#!/bin/bash

# Get app name from user input and clean it
read -p "Enter the new app name: " app_name
app_name=$(echo "$app_name" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

# Source directory
src_dir="apps/demo"

# Destination directory
dest_dir="apps/dash"

# Check if source directory exists
if [ ! -d "$src_dir" ]; then
    echo "Error: Source directory $src_dir does not exist"
    exit 1
fi

# Check if destination already exists
if [ -d "$dest_dir" ]; then
    echo "Warning: Destination directory $dest_dir already exists"
    read -p "Do you want to remove it and continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Operation cancelled."
        exit 1
    fi
    rm -rf "$dest_dir"
fi

# Ask if user wants to set up a submodule
read -p "Do you want to set up this app as a Git submodule? (y/n): " setup_submodule

if [ "$setup_submodule" = "y" ]; then
    # Get Git repository URL for the new submodule
    read -p "Enter the Git repository URL for the client submodule: " repo_url
    
    # Create temp directory to prepare the submodule content
    temp_dir=$(mktemp -d)
    cp -r "$src_dir"/* "$temp_dir"/

    # Check for existing submodule configuration
    if grep -q "$dest_dir" .gitmodules 2>/dev/null; then
        echo "Removing existing submodule configuration..."
        git submodule deinit -f "$dest_dir" 2>/dev/null || true
        git rm -f "$dest_dir" 2>/dev/null || true
        rm -rf ".git/modules/$dest_dir" 2>/dev/null || true
    fi

    # Initialize the submodule repository from the client's repository URL
    echo "Adding submodule from $repo_url..."
    git submodule add --force "$repo_url" "$dest_dir"

    # Check if submodule was added successfully
    if [ ! -d "$dest_dir" ]; then
        echo "Error: Failed to add submodule. Directory $dest_dir does not exist."
        exit 1
    fi

    # Copy the template files to the submodule directory
    echo "Copying template files..."
    cp -r "$temp_dir"/* "$dest_dir"/

    # Clean up the temp directory
    rm -rf "$temp_dir"

    # Commit the submodule addition
    echo "Committing the new submodule to the main repository..."
    git add .gitmodules 2>/dev/null || true
    git add "$dest_dir" 2>/dev/null || true
    git commit -m "Add $app_name app as a submodule" || echo "Nothing to commit. Submodule might already be tracked."

    echo "Successfully created new app as a submodule at $dest_dir"
    echo ""
    echo "Instructions for clients:"
    echo "======================="
    echo "1. Clone the repository with: git clone --recurse-submodules [main-repo-url]"
    echo "2. To work on their app:"
    echo "   cd $dest_dir"
    echo "   # Make changes"
    echo "   git add ."
    echo "   git commit -m \"Your commit message\""
    echo "   git push"
    echo ""
    echo "3. To pull updates from the main repository:"
    echo "   cd [main-repo-root]"
    echo "   git pull"
    echo "   git submodule update --remote"
    echo ""
    echo "Note: Clients can only push to the $dest_dir submodule, not to the main repository"
else
    # Simple directory copy without submodule setup
    echo "Creating a regular app directory (not a submodule)..."
    cp -r "$src_dir" "$dest_dir"
    
    echo "Successfully created new app at $dest_dir"
    echo ""
    echo "To set up as a submodule later, you'll need to:"
    echo "1. Create a Git repository for this app"
    echo "2. Remove this directory from the main repository"
    echo "3. Add the repository as a submodule"
fi