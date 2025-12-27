#!/usr/bin/env node

/**
 * Android Resources Generator
 * 
 * This script generates Android icons, splash screens, and configures
 * common Android theme colors (toolbar, status bar, navigation, etc.)
 * 
 * Usage: node scripts/android-resources.js
 * 
 * Configuration can be customized below.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION - Customize these values
// ============================================

const CONFIG = {
  // Icon and splash source images
  iconSource: './assets/logo-circular.png',
  splashSource: './assets/logo-circular.png',
  splashLogoSize: 256, // Size in pixels for the splash logo (smaller = takes less screen space)
  
  // Android color theme
  colors: {
    // Primary brand colors
    colorPrimary: '#C7EA46',           // Lemon green (app bar, buttons)
    colorPrimaryDark: '#A4C639',       // Darker primary (status bar)
    colorPrimaryVariant: '#A4C639',    // Primary variant
    colorOnPrimary: '#000000',         // Text/icons on primary color
    
    // Secondary/Accent colors
    colorSecondary: '#FF9800',         // Orange (FAB, highlights)
    colorSecondaryVariant: '#F57C00',  // Darker secondary
    colorOnSecondary: '#FFFFFF',       // Text/icons on secondary
    colorAccent: '#FF9800',            // Accent color (legacy)
    
    // Background colors
    colorBackground: '#121212',        // App background (dark mode)
    colorOnBackground: '#FFFFFF',      // Text on background
    colorSurface: '#1E1E1E',           // Card/surface background
    colorOnSurface: '#FFFFFF',         // Text on surface
    
    // Splash screen
    splashBackground: '#212121',       // Dark grey splash background
    
    // Status bar and navigation
    statusBarColor: '#1B5E20',         // Status bar color
    navigationBarColor: '#121212',     // Navigation bar color
    
    // Notification
    notificationColor: '#000000',      // FCM notification icon color (light mode)
    notificationColorDark: '#FFFFFF',  // FCM notification icon color (dark mode)
    
    // Error color
    colorError: '#CF6679',             // Error state color
    colorOnError: '#000000',           // Text on error
  }
};

// ============================================
// PATHS
// ============================================

const ANDROID_RES_PATH = './android/app/src/main/res';
const VALUES_PATH = path.join(ANDROID_RES_PATH, 'values');
const VALUES_NIGHT_PATH = path.join(ANDROID_RES_PATH, 'values-night');
const DRAWABLE_PATH = path.join(ANDROID_RES_PATH, 'drawable');

// ============================================
// HELPER FUNCTIONS
// ============================================

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Written: ${filePath}`);
}

// ============================================
// GENERATE colors.xml
// ============================================

function generateColorsXml() {
  const { colors } = CONFIG;
  
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Primary brand colors -->
    <color name="colorPrimary">${colors.colorPrimary}</color>
    <color name="colorPrimaryDark">${colors.colorPrimaryDark}</color>
    <color name="colorPrimaryVariant">${colors.colorPrimaryVariant}</color>
    <color name="colorOnPrimary">${colors.colorOnPrimary}</color>
    
    <!-- Secondary/Accent colors -->
    <color name="colorSecondary">${colors.colorSecondary}</color>
    <color name="colorSecondaryVariant">${colors.colorSecondaryVariant}</color>
    <color name="colorOnSecondary">${colors.colorOnSecondary}</color>
    <color name="colorAccent">${colors.colorAccent}</color>
    
    <!-- Background colors -->
    <color name="colorBackground">${colors.colorBackground}</color>
    <color name="colorOnBackground">${colors.colorOnBackground}</color>
    <color name="colorSurface">${colors.colorSurface}</color>
    <color name="colorOnSurface">${colors.colorOnSurface}</color>
    
    <!-- Splash screen -->
    <color name="splash_background">${colors.splashBackground}</color>
    
    <!-- Status bar and navigation -->
    <color name="statusBarColor">${colors.statusBarColor}</color>
    <color name="navigationBarColor">${colors.navigationBarColor}</color>
    
    <!-- Notification color for FCM (light mode) -->
    <color name="notification_color">${colors.notificationColor}</color>
    
    <!-- Error color -->
    <color name="colorError">${colors.colorError}</color>
    <color name="colorOnError">${colors.colorOnError}</color>
</resources>
`;
  
  ensureDir(VALUES_PATH);
  writeFile(path.join(VALUES_PATH, 'colors.xml'), colorsXml);
}

// ============================================
// GENERATE colors.xml for NIGHT mode
// ============================================

function generateColorsNightXml() {
  const { colors } = CONFIG;
  
  const colorsNightXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Notification color for FCM (dark mode) -->
    <color name="notification_color">${colors.notificationColorDark}</color>
</resources>
`;
  
  ensureDir(VALUES_NIGHT_PATH);
  writeFile(path.join(VALUES_NIGHT_PATH, 'colors.xml'), colorsNightXml);
}

// ============================================
// GENERATE styles.xml
// ============================================

function generateStylesXml() {
  const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Base application theme -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:statusBarColor">@color/statusBarColor</item>
        <item name="android:navigationBarColor">@color/navigationBarColor</item>
    </style>

    <!-- Theme without action bar -->
    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:statusBarColor">@color/statusBarColor</item>
        <item name="android:navigationBarColor">@color/navigationBarColor</item>
    </style>

    <!-- Splash screen theme -->
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>

</resources>
`;
  
  ensureDir(VALUES_PATH);
  writeFile(path.join(VALUES_PATH, 'styles.xml'), stylesXml);
}

// ============================================
// GENERATE splash.xml drawable
// ============================================

function generateSplashDrawable() {
  const splashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Dark grey background -->
    <item android:drawable="@color/splash_background" />
    <!-- Centered circular logo -->
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo" />
    </item>
</layer-list>
`;
  
  ensureDir(DRAWABLE_PATH);
  writeFile(path.join(DRAWABLE_PATH, 'splash.xml'), splashXml);
}

// ============================================
// COPY AND RESIZE SPLASH LOGO
// ============================================

function copySplashLogo() {
  const source = CONFIG.splashSource;
  const dest = path.join(DRAWABLE_PATH, 'splash_logo.png');
  const logoSize = CONFIG.splashLogoSize || 256; // Default to 256px
  
  if (fs.existsSync(source)) {
    // Use sips (macOS) to resize the image
    try {
      execSync(`sips -Z ${logoSize} "${source}" --out "${dest}"`, { stdio: 'pipe' });
      console.log(`✅ Copied and resized splash logo to ${logoSize}px: ${source} → ${dest}`);
    } catch (error) {
      // Fallback: just copy if sips fails (non-macOS)
      fs.copyFileSync(source, dest);
      console.log(`✅ Copied splash logo (no resize): ${source} → ${dest}`);
    }
  } else {
    console.warn(`⚠️  Splash source not found: ${source}`);
  }
}

// ============================================
// RUN capacitor-resources (icons only)
// ============================================

function runCapacitorResources() {
  // Only generate icons, not splash (we handle splash ourselves)
  const cmd = `npx capacitor-resources android --icon ${CONFIG.iconSource}`;
  console.log(`\n🚀 Running: ${cmd}\n`);
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('\n✅ capacitor-resources completed successfully');
  } catch (error) {
    console.error('\n❌ capacitor-resources failed:', error.message);
    process.exit(1);
  }
}

// ============================================
// CLEAN UP splash.png files from all drawable folders
// ============================================

function cleanupSplashPngs() {
  console.log('🧹 Cleaning up splash.png files from drawable folders...');
  
  const drawableFolders = fs.readdirSync(ANDROID_RES_PATH)
    .filter(f => f.startsWith('drawable'))
    .map(f => path.join(ANDROID_RES_PATH, f));
  
  let removed = 0;
  for (const folder of drawableFolders) {
    const splashPng = path.join(folder, 'splash.png');
    if (fs.existsSync(splashPng)) {
      fs.unlinkSync(splashPng);
      console.log(`  🗑️  Removed: ${splashPng}`);
      removed++;
    }
  }
  
  if (removed > 0) {
    console.log(`✅ Removed ${removed} splash.png file(s)`);
  } else {
    console.log('✅ No splash.png files to remove');
  }
}

// ============================================
// MAIN
// ============================================

function main() {
  console.log('🎨 Android Resources Generator');
  console.log('================================\n');
  
  // Step 1: Run capacitor-resources for icons only
  runCapacitorResources();
  
  // Step 2: Clean up any splash.png files (we use splash.xml instead)
  cleanupSplashPngs();
  
  // Step 3: Generate color resources
  console.log('\n📝 Generating Android theme resources...\n');
  generateColorsXml();
  generateColorsNightXml();
  generateStylesXml();
  generateSplashDrawable();
  copySplashLogo();
  
  console.log('\n✨ Android resources generation complete!\n');
  console.log('Summary:');
  console.log('  - Generated app icons');
  console.log('  - Cleaned up old splash.png files');
  console.log('  - Created colors.xml with brand colors');
  console.log('  - Created colors.xml (night) for dark mode');
  console.log('  - Created styles.xml with themes');
  console.log('  - Created splash.xml drawable with centered logo');
  console.log('  - Copied splash logo\n');
}

main();
