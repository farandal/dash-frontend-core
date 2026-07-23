#!/bin/bash
# Post-installation script for dash

set -e

# Create symlink for command-line access
ln -sf /opt/dash/dash /usr/bin/dash

# Ensure the desktop file is properly installed
DESKTOP_FILE="/usr/share/applications/dash.desktop"
if [ ! -f "$DESKTOP_FILE" ]; then
    cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Name=KitchenTabs
Comment=KitchenTabs POS Terminal
Exec=/opt/dash/dash --no-sandbox %U
Icon=dash
Type=Application
Categories=Office;Finance;
Keywords=pos;kitchen;restaurant;orders;
StartupWMClass=dash
Terminal=false
MimeType=x-scheme-handler/dash;
EOF
fi

# Copy icon if needed
ICON_DIR="/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$ICON_DIR"
if [ -f "/opt/dash/resources/icons/png/256x256.png" ]; then
    cp "/opt/dash/resources/icons/png/256x256.png" "$ICON_DIR/dash.png"
fi

# Create desktop shortcut for all users
DESKTOP_DIR="/usr/share/desktop-directories"
mkdir -p "$DESKTOP_DIR"

# Create desktop shortcut in common location for LXDE/Raspberry Pi OS
for USER_HOME in /home/*; do
    if [ -d "$USER_HOME/Desktop" ]; then
        DESKTOP_SHORTCUT="$USER_HOME/Desktop/dash.desktop"
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
chmod +x /opt/dash/dash
chmod -R 755 /opt/dash/resources/python-service/ 2>/dev/null || true

echo "KitchenTabs installed successfully!"
echo "Run 'dash' or find it in your applications menu."
echo "A desktop shortcut has been created."
