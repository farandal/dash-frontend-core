import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kitchntabs.app',
  appName: 'KitchnTabs',
  webDir: 'apps/dash/dist',

  server: {
    androidScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      androidStatusBarColor: "#4caf50",
      androidStatusBarStyle: "dark",
      androidScaleType: "CENTER",
      androidIcons: {
        mdpi: "resources/android/icon/drawable-mdpi-icon.png",
        hdpi: "resources/android/icon/drawable-hdpi-icon.png",
        xhdpi: "resources/android/icon/drawable-xhdpi-icon.png",
        xxhdpi: "resources/android/icon/drawable-xxhdpi-icon.png",
        xxxhdpi: "resources/android/icon/drawable-xxxhdpi-icon.png"
      }
    },
    WebView: {
      allowFileAccess: true,
      allowMixedContent: true,
      // Add these for media capture
      allowFileAccessFromFileURLs: true,
      allowUniversalAccessFromFileURLs: true,
      webViewEngineSettings: {
        setDomStorageEnabled: true,
        setJavaScriptEnabled: true,
        setDatabaseEnabled: true,
        setAllowFileAccess: true,
        setAllowContentAccess: true,
        setGeolocationEnabled: true,
        setBuiltInZoomControls: true,
        setLoadWithOverviewMode: true,
        setUseWideViewPort: true,
        setMixedContentMode: 0,
        setMediaPlaybackRequiresUserGesture: false
      }
    },

    VoiceRecorder: {
      enabled: true
    },
    Keyboard: {
      enabled: true
    },
    Camera: {
      // Enable camera and photo library access
      presentationStyle: 'fullscreen',
      // iOS specific settings
      saveToGallery: false
    }
  }
};

export default config;
