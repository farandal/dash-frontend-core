#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

try {
  // Read the build.gradle file
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Find current versionCode
  const versionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);
  
  if (!versionCodeMatch) {
    console.error('❌ Could not find versionCode in build.gradle');
    process.exit(1);
  }
  
  const currentVersionCode = parseInt(versionCodeMatch[1]);
  const newVersionCode = currentVersionCode + 1;
  
  // Increment versionCode
  buildGradle = buildGradle.replace(
    /versionCode\s+\d+/,
    `versionCode ${newVersionCode}`
  );
  
  // Update versionName to match
  buildGradle = buildGradle.replace(
    /versionName\s+"[^"]+"/,
    `versionName "internal-preview-${newVersionCode}"`
  );
  
  // Write back to file
  fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
  
  console.log(`✅ Android version incremented: ${currentVersionCode} → ${newVersionCode}`);
  console.log(`   Version name updated to: internal-preview-${newVersionCode}`);
  
} catch (error) {
  console.error('❌ Error incrementing Android version:', error.message);
  process.exit(1);
}
