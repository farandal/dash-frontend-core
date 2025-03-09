#!/bin/bash

# Get app name from user input and clean it
read -p "Enter the new app name: " app_name
app_name=$(echo "$app_name" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

# Source directory
src_dir="apps/demo"

# Destination directory (will always be apps/dash)
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
        echo "Operation canceled"
        exit 1
    fi
    
    # Clean up existing submodule if it exists
    if grep -q "$dest_dir" .gitmodules 2>/dev/null; then
        echo "Cleaning up existing submodule reference..."
        git submodule deinit -f -- "$dest_dir" || true
        git rm -f "$dest_dir" || true
        rm -rf .git/modules/"$dest_dir" || true
    else
        # If it's not a submodule, just remove the directory
        rm -rf "$dest_dir"
    fi
fi

# Get Git repository URL for the new submodule
read -p "Enter the Git repository URL for the client submodule: " repo_url

# Create temp directory to prepare the submodule content
temp_dir=$(mktemp -d)
echo "Copying template files to temporary directory..."
cp -r "$src_dir"/* "$temp_dir"/

# Update package.json with the new app name in the temp directory
echo "Updating package.json with new app name..."
sed -i.bak "s/\"name\": \".*\"/\"name\": \"$app_name\"/" "$temp_dir/package.json" && rm "$temp_dir/package.json.bak"

# Clone the repository, initialize it if empty, and push template files
echo "Initializing repository with template files..."
temp_clone_dir=$(mktemp -d)
if ! git clone "$repo_url" "$temp_clone_dir"; then
    echo "Error: Failed to clone repository"
    rm -rf "$temp_dir" "$temp_clone_dir"
    exit 1
fi

# Copy template files to the cloned repository
cp -r "$temp_dir"/* "$temp_clone_dir"/

# Commit and push the template files
cd "$temp_clone_dir"
git add .
if git status | grep -q "Changes to be committed"; then
    git commit -m "Initialize repository with template files"
    if ! git push; then
        echo "Error: Failed to push to repository. Check your permissions."
        cd - > /dev/null
        rm -rf "$temp_dir" "$temp_clone_dir"
        exit 1
    fi
else
    echo "No changes to commit. Repository may already be initialized."
fi
cd - > /dev/null

# Now add the initialized repository as a submodule
echo "Adding repository as a submodule..."
if ! git submodule add "$repo_url" "$dest_dir"; then
    echo "Error: Failed to add submodule. Try using --force if appropriate."
    rm -rf "$temp_dir" "$temp_clone_dir"
    exit 1
fi

# Clean up the temp directories
rm -rf "$temp_dir" "$temp_clone_dir"

# Commit the submodule addition
echo "Committing the new submodule to the main repository..."
git add "$dest_dir" .gitmodules
git commit -m "Add $app_name project as a submodule at apps/dash"

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