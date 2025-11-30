#!/bin/bash
# Post-installation script for kitchntabs

set -e

# Create symlink for command-line access
ln -sf /opt/kitchntabs/kitchntabs /usr/bin/kitchntabs

# Ensure the desktop file is properly installed
DESKTOP_FILE="/usr/share/applications/kitchntabs.desktop"
if [ ! -f "$DESKTOP_FILE" ]; then
    cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Name=KitchenTabs
Comment=KitchenTabs POS Terminal
Exec=/opt/kitchntabs/kitchntabs --no-sandbox %U
Icon=kitchntabs
Type=Application
Categories=Office;Finance;
Keywords=pos;kitchen;restaurant;orders;
StartupWMClass=kitchntabs
Terminal=false
MimeType=x-scheme-handler/kitchntabs;
EOF
fi

# Copy icon if needed
ICON_DIR="/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$ICON_DIR"
if [ -f "/opt/kitchntabs/resources/icons/png/256x256.png" ]; then
    cp "/opt/kitchntabs/resources/icons/png/256x256.png" "$ICON_DIR/kitchntabs.png"
fi

# Create desktop shortcut for all users
DESKTOP_DIR="/usr/share/desktop-directories"
mkdir -p "$DESKTOP_DIR"

# Create desktop shortcut in common location for LXDE/Raspberry Pi OS
for USER_HOME in /home/*; do
    if [ -d "$USER_HOME/Desktop" ]; then
        DESKTOP_SHORTCUT="$USER_HOME/Desktop/kitchntabs.desktop"
        cp "$DESKTOP_FILE" "$DESKTOP_SHORTCUT"
        chmod +x "$DESKTOP_SHORTCUT"
        # Set ownership to the user
        USER_NAME=$(basename "$USER_HOME")
        chown "$USER_NAME:$USER_NAME" "$DESKTOP_SHORTCUT" 2>/dev/null || true
    fi
done

# Update desktop database for app menu
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
fi

# Set correct permissions for the application
chmod +x /opt/kitchntabs/kitchntabs
chmod -R 755 /opt/kitchntabs/resources/python-service/ 2>/dev/null || true

echo "KitchenTabs installed successfully!"
echo "Run 'kitchntabs' or find it in your applications menu."
echo "A desktop shortcut has been created."
