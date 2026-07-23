#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  iconSource: './assets/logo-circular.png',
  splashSource: './assets/splash.png',
  splashLogoSize: 256, 
  colors: {
    colorPrimary: '#C7EA46',           
    colorPrimaryDark: '#A4C639',       
    colorPrimaryVariant: '#A4C639',    
    colorOnPrimary: '#000000',         
    colorSecondary: '#FF9800',         
    colorSecondaryVariant: '#F57C00',  
    colorOnSecondary: '#FFFFFF',       
    colorAccent: '#FF9800',            
    colorBackground: '#121212',        
    colorOnBackground: '#FFFFFF',      
    colorSurface: '#1E1E1E',           
    colorOnSurface: '#FFFFFF',         
    splashBackground: '#212121',       
    statusBarColor: '#1B5E20',         
    navigationBarColor: '#121212',     
    notificationColor: '#000000',      
    notificationColorDark: '#FFFFFF',  
    colorError: '#CF6679',             
    colorOnError: '#000000',           
  }
};

// ============================================
// MONOREPO DYNAMIC PATHS
// ============================================
const APP_BASE_PATH = process.env.APP_PATH || '.';
const ANDROID_RES_PATH = path.join(APP_BASE_PATH, 'android/app/src/main/res');
const VALUES_PATH = path.join(ANDROID_RES_PATH, 'values');
const VALUES_NIGHT_PATH = path.join(ANDROID_RES_PATH, 'values-night');
const DRAWABLE_PATH = path.join(ANDROID_RES_PATH, 'drawable');
const LAYOUT_PATH = path.join(ANDROID_RES_PATH, 'layout');

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

function generateColorsXml() {
  const { colors } = CONFIG;
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${colors.colorPrimary}</color>
    <color name="colorPrimaryDark">${colors.colorPrimaryDark}</color>
    <color name="colorPrimaryVariant">${colors.colorPrimaryVariant}</color>
    <color name="colorOnPrimary">${colors.colorOnPrimary}</color>
    <color name="colorSecondary">${colors.colorSecondary}</color>
    <color name="colorSecondaryVariant">${colors.colorSecondaryVariant}</color>
    <color name="colorOnSecondary">${colors.colorOnSecondary}</color>
    <color name="colorAccent">${colors.colorAccent}</color>
    <color name="colorBackground">${colors.colorBackground}</color>
    <color name="colorOnBackground">${colors.colorOnBackground}</color>
    <color name="colorSurface">${colors.colorSurface}</color>
    <color name="colorOnSurface">${colors.colorOnSurface}</color>
    <color name="splash_background">${colors.splashBackground}</color>
    <color name="statusBarColor">${colors.statusBarColor}</color>
    <color name="navigationBarColor">${colors.navigationBarColor}</color>
    <color name="notification_color">${colors.notificationColor}</color>
    <color name="colorError">${colors.colorError}</color>
    <color name="colorOnError">${colors.colorOnError}</color>
</resources>
`;
  ensureDir(VALUES_PATH);
  writeFile(path.join(VALUES_PATH, 'colors.xml'), colorsXml);
}

function generateColorsNightXml() {
  const { colors } = CONFIG;
  const colorsNightXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="notification_color">${colors.notificationColorDark}</color>
</resources>
`;
  ensureDir(VALUES_NIGHT_PATH);
  writeFile(path.join(VALUES_NIGHT_PATH, 'colors.xml'), colorsNightXml);
}

function generateStylesXml() {
  const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:statusBarColor">@color/statusBarColor</item>
        <item name="android:navigationBarColor">@color/navigationBarColor</item>
    </style>
    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:statusBarColor">@color/statusBarColor</item>
        <item name="android:navigationBarColor">@color/navigationBarColor</item>
    </style>
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

function generateSplashDrawable() {
  const splashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
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

function copySplashLogo() {
  const source = CONFIG.splashSource;
  const dest = path.join(DRAWABLE_PATH, 'splash_logo.png');
  const logoSize = CONFIG.splashLogoSize || 256; 
  
  if (fs.existsSync(source)) {
    try {
      execSync(`sips -Z ${logoSize} "${source}" --out "${dest}"`, { stdio: 'pipe' });
      console.log(`✅ Copied and resized splash logo to ${logoSize}px: ${source} → ${dest}`);
    } catch (error) {
      fs.copyFileSync(source, dest);
      console.log(`✅ Copied splash logo (no resize due to tool fallback): ${source} → ${dest}`);
    }
  } else {
    console.warn(`⚠️  Splash source not found: ${source}`);
  }
}

// ============================================
// PROVISION MISSING WORKSPACE DEPENDENCIES
// ============================================
function verifyAndInjectRequiredAssets() {
  ensureDir(VALUES_PATH);
  ensureDir(LAYOUT_PATH);

  // 1. Safe layout file recovery for custom AlarmActivity
  const alarmLayoutFile = path.join(LAYOUT_PATH, 'activity_alarm.xml');
  if (!fs.existsSync(alarmLayoutFile)) {
    const alarmXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp">
    <TextView android:id="@+id/alarm_title" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="24sp" android:textStyle="bold" />
    <TextView android:id="@+id/alarm_body" android:layout_width="wrap_content" android:layout_height="wrap_content" android:layout_marginTop="12dp" android:textSize="16sp" />
    <Button android:id="@+id/open_app_button" android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginTop="32dp" android:text="Open App" />
    <Button android:id="@+id/dismiss_button" android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginTop="12dp" android:text="Dismiss" />
</LinearLayout>`;
    writeFile(alarmLayoutFile, alarmXml);
  }

  // 2. Safe string configuration recovery for custom Notification Channels
  const stringsFile = path.join(VALUES_PATH, 'strings.xml');
  let stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">DashAdmin</string>
    <string name="title_activity_main">MainActivity</string>
    <string name="package_name">com.dash.app</string>
    <string name="default_notification_channel_id">default_channel_id</string>
    <string name="default_notification_channel_name">App Notifications</string>
    <string name="default_notification_channel_description">General application alerts</string>
</resources>`;

  if (fs.existsSync(stringsFile)) {
    let currentContent = fs.readFileSync(stringsFile, 'utf8');
    if (!currentContent.includes('default_notification_channel_name')) {
      currentContent = currentContent.replace('</resources>', `    <string name="default_notification_channel_name">App Notifications</string>\n    <string name="default_notification_channel_description">General application alerts</string>\n</resources>`);
      writeFile(stringsFile, currentContent);
    }
  } else {
    writeFile(stringsFile, stringsXml);
  }

  // 3. Fallback tracking asset sync for Notification Icons
  const trackingIcon = path.join(DRAWABLE_PATH, 'ic_notification.png');
  if (!fs.existsSync(trackingIcon) && fs.existsSync(CONFIG.iconSource)) {
    fs.copyFileSync(CONFIG.iconSource, trackingIcon);
    console.log(`✅ Synchronized tracking notification asset placeholder.`);
  }
}

function runCapacitorResources() {
  ensureDir('./resources');
  if (fs.existsSync(CONFIG.splashSource)) {
    try {
      execSync(`sips -z 2732 2732 "${CONFIG.splashSource}" --out "./resources/splash.png"`, { stdio: 'ignore' });
    } catch (e) {
      fs.copyFileSync(CONFIG.splashSource, './resources/splash.png');
    }
  } else if (fs.existsSync(CONFIG.iconSource)) {
    try {
      execSync(`sips -z 2732 2732 "${CONFIG.iconSource}" --out "./resources/splash.png"`, { stdio: 'ignore' });
      fs.copyFileSync('./resources/splash.png', CONFIG.splashSource);
    } catch (e) {
      fs.copyFileSync(CONFIG.iconSource, './resources/splash.png');
      fs.copyFileSync(CONFIG.iconSource, CONFIG.splashSource);
    }
    console.log(`💡 Created safe splash assets automatically from ${CONFIG.iconSource}`);
  }

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

function cleanupSplashPngs() {
  if (!fs.existsSync(ANDROID_RES_PATH)) {
    console.log(`⚠️  Resource directory path missing at ${ANDROID_RES_PATH}. Skipping splash cleanup.`);
    return;
  }

  console.log('🧹 Cleaning up density-specific splash.png files...');
  const drawableFolders = fs.readdirSync(ANDROID_RES_PATH)
    // Match the base 'drawable' folder as well as density variants like
    // 'drawable-port-hdpi'. The base folder also needs cleanup because
    // capacitor-resources drops a generic splash.png there, which collides
    // with the splash.xml layer-list generateSplashDrawable() writes next
    // (both compile to the same `drawable/splash` resource name).
    .filter(f => f === 'drawable' || f.startsWith('drawable-'))
    .map(f => path.join(ANDROID_RES_PATH, f));

  let removed = 0;
  for (const folder of drawableFolders) {
    const splashPng = path.join(folder, 'splash.png');
    if (fs.existsSync(splashPng)) {
      fs.unlinkSync(splashPng);
      console.log(`  🗑️ Removed: ${splashPng}`);
      removed++;
    }
  }
  console.log(`✅ Removed ${removed} splash.png file(s). drawable/splash.xml will provide the splash resource instead.`);
}


function main() {
  console.log('🎨 Android Resources Generator');
  console.log('================================\n');
  runCapacitorResources();
  cleanupSplashPngs();
  if (fs.existsSync(ANDROID_RES_PATH)) {
    console.log('\n📝 Generating Android theme resources...\n');
    generateColorsXml();
    generateColorsNightXml();
    generateStylesXml();
    generateSplashDrawable();
    copySplashLogo();
    console.log('🔍 Checking workspace custom dependencies...');
    verifyAndInjectRequiredAssets();
    console.log('\n✨ Android resources generation complete!\n');
  } else {
    console.log(`\n❌ Android resources path missing. Was the workspace platform generated yet?`);
  }
}

main();