#!/bin/bash
# Post-removal script for kitchntabs

# Remove symlink
rm -f /usr/bin/kitchntabs

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

echo "KitchenTabs removed."
