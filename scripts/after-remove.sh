#!/bin/bash
# Post-removal script for kitchntabs

# Remove symlink
rm -f /usr/bin/kitchntabs

# Remove desktop file
rm -f /usr/share/applications/kitchntabs.desktop

# Remove icon
rm -f /usr/share/icons/hicolor/256x256/apps/kitchntabs.png

# Remove desktop shortcuts
for USER_HOME in /home/*; do
    rm -f "$USER_HOME/Desktop/kitchntabs.desktop" 2>/dev/null || true
done

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
fi

echo "KitchenTabs removed."
