package cl.pinoywok.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.pusher.pushnotifications.PushNotifications;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "PusherNotifications";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
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
    }
}