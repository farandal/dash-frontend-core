#!/bin/bash
# Post-installation script for kitchntabs

# Create symlink for command-line access
ln -sf /opt/kitchntabs/kitchntabs /usr/bin/kitchntabs

# Update desktop database for app menu
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
fi

echo "KitchenTabs installed successfully!"
echo "Run 'kitchntabs' or find it in your applications menu."
