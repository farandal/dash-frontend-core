# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Capacitor WebView Bridge
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    public <init>(*);
    public <methods>;
}
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorMethod public <methods>;
}
-keep @com.getcapacitor.PluginMethod public class * {
    public <init>(*);
    public <methods>;
}

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView related classes
-keep class * extends android.webkit.WebViewClient
-keep class * extends android.webkit.WebChromeClient
-keep class android.webkit.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Crashlytics - preserve stack traces
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# Capacitor - Additional rules for permission handling (Xiaomi fix)
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.PermissionState { *; }
-keepclassmembers class com.getcapacitor.Plugin {
    public <methods>;
    protected <methods>;
}
-dontwarn com.getcapacitor.**

# Pusher
-keep class com.pusher.** { *; }
-dontwarn com.pusher.**

# Gson (if used by Firebase or other libraries)
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**
