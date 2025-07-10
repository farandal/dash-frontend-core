package cl.pinoywok.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.pusher.pushnotifications.PushNotifications;

// Add this import for VoiceRecorder
import com.tchvu3.capacitorvoicerecorder.VoiceRecorder;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "PusherNotifications";
    private static final String AUDIO_TAG = "AudioPermissions";
    private static final int PERMISSION_REQUEST_CODE = 1001;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the VoiceRecorder plugin
        registerPlugin(VoiceRecorder.class);
        
        // Initialize Pusher Push Notifications
        try {
            Log.d(TAG, "Initializing Pusher Push Notifications");
            //PushNotifications.start(getApplicationContext(), "8e70908f-1020-47ed-b3bd-57d4c177f1f1");
            Log.d(TAG, "Pusher Push Notifications initialized successfully");
            
            // Subscribe to the "hello" interest
            //PushNotifications.addDeviceInterest("hello");
            Log.d(TAG, "Subscribed to 'hello' interest");
            
            // You can log the device ID if needed
            //String deviceId = PushNotifications.getDeviceId();
            //Log.d(TAG, "Pusher Device ID: " + deviceId);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Pusher Push Notifications", e);
        }
        
        // Request microphone permission at startup
        requestMicrophonePermission();
        
        // Configure WebView for media capture
        configureWebViewForMediaCapture();
    }
    
    private void requestMicrophonePermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) 
            != PackageManager.PERMISSION_GRANTED) {
            
            Log.d(AUDIO_TAG, "Requesting microphone permission");
            ActivityCompat.requestPermissions(this, 
                new String[]{
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.MODIFY_AUDIO_SETTINGS
                }, 
                PERMISSION_REQUEST_CODE);
        } else {
            Log.d(AUDIO_TAG, "Microphone permission already granted");
        }
    }
    
    private void configureWebViewForMediaCapture() {
        // Configure the bridge's WebView to handle media permissions
        this.bridge.getWebView().setWebChromeClient(new com.getcapacitor.BridgeWebChromeClient(this.bridge) {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                Log.d(AUDIO_TAG, "WebView permission request: " + java.util.Arrays.toString(request.getResources()));
                
                // Check if the request includes audio capture
                for (String resource : request.getResources()) {
                    if (resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        // Check if we have the Android permission
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) 
                            == PackageManager.PERMISSION_GRANTED) {
                            Log.d(AUDIO_TAG, "Granting WebView audio permission");
                            request.grant(request.getResources());
                            return;
                        } else {
                            Log.d(AUDIO_TAG, "Android audio permission not granted, requesting...");
                            requestMicrophonePermission();
                            request.deny();
                            return;
                        }
                    }
                }
                
                // For other permissions, use default behavior
                super.onPermissionRequest(request);
            }
        });
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(AUDIO_TAG, "Microphone permission granted by user");
            } else {
                Log.d(AUDIO_TAG, "Microphone permission denied by user");
            }
        }
    }
}
