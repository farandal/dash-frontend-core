package com.kitchntabs.app;

import android.app.Application;
import android.content.Context;
import android.util.Log;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

/**
 * Custom Application class for KitchnTabs.
 * Handles global initialization and provides defensive programming
 * for device-specific issues (particularly Xiaomi devices with MIUI).
 */
public class KitchnTabsApplication extends Application {
    private static final String TAG = "KitchnTabsApp";
    private static KitchnTabsApplication instance;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        
        Log.d(TAG, "Application onCreate started");
        
        // Initialize Firebase Crashlytics early
        initializeCrashlytics();
        
        // Set up global exception handler for uncaught exceptions
        setupGlobalExceptionHandler();
        
        Log.d(TAG, "Application onCreate completed");
    }

    private void initializeCrashlytics() {
        try {
            FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();
            
            // Log device info for debugging Xiaomi-specific issues
            String manufacturer = android.os.Build.MANUFACTURER;
            String model = android.os.Build.MODEL;
            String device = android.os.Build.DEVICE;
            String brand = android.os.Build.BRAND;
            int sdkInt = android.os.Build.VERSION.SDK_INT;
            
            crashlytics.setCustomKey("device_manufacturer", manufacturer);
            crashlytics.setCustomKey("device_model", model);
            crashlytics.setCustomKey("device_name", device);
            crashlytics.setCustomKey("device_brand", brand);
            crashlytics.setCustomKey("android_sdk", sdkInt);
            
            // Flag Xiaomi devices for easier crash filtering
            boolean isXiaomiDevice = "xiaomi".equalsIgnoreCase(manufacturer) || 
                                    "redmi".equalsIgnoreCase(manufacturer) ||
                                    "poco".equalsIgnoreCase(manufacturer);
            crashlytics.setCustomKey("is_xiaomi_device", isXiaomiDevice);
            
            // Check for MIUI
            String miuiVersion = getSystemProperty("ro.miui.ui.version.name");
            if (miuiVersion != null && !miuiVersion.isEmpty()) {
                crashlytics.setCustomKey("miui_version", miuiVersion);
                crashlytics.setCustomKey("is_miui", true);
            } else {
                crashlytics.setCustomKey("is_miui", false);
            }
            
            Log.d(TAG, "Crashlytics initialized - Manufacturer: " + manufacturer + 
                      ", Model: " + model + ", SDK: " + sdkInt);
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Crashlytics", e);
        }
    }

    /**
     * Get system property (useful for detecting MIUI and other OEM ROMs)
     */
    private String getSystemProperty(String key) {
        try {
            Class<?> systemProperties = Class.forName("android.os.SystemProperties");
            java.lang.reflect.Method get = systemProperties.getMethod("get", String.class);
            return (String) get.invoke(null, key);
        } catch (Exception e) {
            Log.w(TAG, "Could not get system property: " + key);
            return null;
        }
    }

    /**
     * Set up a global exception handler to catch and log uncaught exceptions.
     * This helps capture crashes that occur before normal error handling kicks in.
     */
    private void setupGlobalExceptionHandler() {
        final Thread.UncaughtExceptionHandler defaultHandler = 
            Thread.getDefaultUncaughtExceptionHandler();
            
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                try {
                    // Log to Crashlytics with additional context
                    FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();
                    crashlytics.setCustomKey("crash_thread", thread.getName());
                    crashlytics.setCustomKey("crash_type", throwable.getClass().getSimpleName());
                    
                    // Check if this is the known Capacitor permission issue
                    if (isCapacitorPermissionNPE(throwable)) {
                        crashlytics.setCustomKey("is_capacitor_permission_npe", true);
                        crashlytics.log("Capacitor getPermissionStates NullPointerException detected");
                        Log.e(TAG, "Known Capacitor permission NPE on device: " + 
                              android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL);
                    }
                    
                    crashlytics.recordException(throwable);
                    
                } catch (Exception e) {
                    Log.e(TAG, "Error in exception handler", e);
                }
                
                // Call the default handler
                if (defaultHandler != null) {
                    defaultHandler.uncaughtException(thread, throwable);
                }
            }
        });
    }

    /**
     * Check if the exception is the known Capacitor getPermissionStates NPE
     */
    private boolean isCapacitorPermissionNPE(Throwable throwable) {
        if (throwable == null) return false;
        
        // Check the exception chain
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof NullPointerException) {
                StackTraceElement[] stackTrace = current.getStackTrace();
                if (stackTrace != null) {
                    for (StackTraceElement element : stackTrace) {
                        if (element != null) {
                            String className = element.getClassName();
                            String methodName = element.getMethodName();
                            if (className != null && methodName != null) {
                                if (className.contains("getcapacitor") && 
                                    methodName.contains("getPermissionState")) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            current = current.getCause();
        }
        return false;
    }

    public static KitchnTabsApplication getInstance() {
        return instance;
    }

    public static Context getAppContext() {
        return instance != null ? instance.getApplicationContext() : null;
    }
}
