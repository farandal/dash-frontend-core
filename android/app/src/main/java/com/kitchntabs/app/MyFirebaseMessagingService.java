package com.kitchntabs.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";
    private static final String CHANNEL_ID = "default_channel";
    private static final String ALARM_CHANNEL_ID = "alarm_channel";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        Log.i(TAG, "🔥 FCM MESSAGE RECEIVED 🔥");

        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            Log.i(TAG, "📱 NOTIFICATION: " + title + " | " + body);
            
            // Check if it's an important/alarm notification
            boolean isAlarm = checkIfAlarmNotification(remoteMessage);
            showNotification(title, body, isAlarm);
        }

        // Check if message contains data payload
        if (remoteMessage.getData().size() > 0) {
            Log.i(TAG, "📦 DATA PAYLOAD: " + remoteMessage.getData());
            
            // If no notification payload, create one from data
            if (remoteMessage.getNotification() == null) {
                String title = remoteMessage.getData().get("title");
                String body = remoteMessage.getData().get("body");
                
                if (title != null && body != null) {
                    Log.i(TAG, "📱 CREATING NOTIFICATION FROM DATA: " + title + " | " + body);
                    
                    // Check if it's an important/alarm notification
                    boolean isAlarm = checkIfAlarmNotification(remoteMessage);
                    showNotification(title, body, isAlarm);
                } else {
                    Log.w(TAG, "❌ NO TITLE/BODY IN DATA PAYLOAD");
                }
            }
        }
        
        if (remoteMessage.getNotification() == null && remoteMessage.getData().size() == 0) {
            Log.w(TAG, "❌ EMPTY MESSAGE - NO NOTIFICATION OR DATA");
        }
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.i(TAG, "🔑 NEW FCM TOKEN: " + token.substring(0, 20) + "...");
        
        // Send token to server if needed
        // You can implement this to update the token on your backend
    }

    private boolean checkIfAlarmNotification(RemoteMessage remoteMessage) {
        // Check data payload for alarm indicators
        String type = remoteMessage.getData().get("type");
        String priority = remoteMessage.getData().get("priority");
        String isAlarm = remoteMessage.getData().get("alarm");
        
        // Keywords that indicate urgent/alarm notifications
        String title = remoteMessage.getNotification() != null ? 
            remoteMessage.getNotification().getTitle() : 
            remoteMessage.getData().get("title");
            
        if (title != null) {
            title = title.toLowerCase();
            if (title.contains("urgent") || title.contains("alarm") || 
                title.contains("emergency") || title.contains("critical") ||
                title.contains("alert") || title.contains("warning")) {
                return true;
            }
        }
        
        return "true".equals(isAlarm) || "high".equals(priority) || "alarm".equals(type);
    }

    private void showNotification(String title, String body, boolean isAlarm) {
        Log.i(TAG, "🔔 SHOWING NOTIFICATION: " + title + " | " + body + (isAlarm ? " 🚨 ALARM" : ""));
        
        createNotificationChannels();

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);

        String channelId = isAlarm ? ALARM_CHANNEL_ID : CHANNEL_ID;
        int priority = isAlarm ? NotificationCompat.PRIORITY_MAX : NotificationCompat.PRIORITY_HIGH;

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelId)
                        .setSmallIcon(R.drawable.ic_notification)
                        .setContentTitle(title != null ? title : "New Notification")
                        .setContentText(body != null ? body : "You have a new message")
                        .setAutoCancel(true)
                        .setPriority(priority)
                        .setContentIntent(pendingIntent);

        // Add alarm-specific features
        if (isAlarm) {
            notificationBuilder
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setVibrate(new long[]{0, 1000, 500, 1000, 500, 1000})
                .setLights(0xFFFF0000, 1000, 1000); // Red light
                
            // Use default alarm sound
            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound != null) {
                notificationBuilder.setSound(alarmSound);
                Log.i(TAG, "🔊 USING ALARM SOUND");
            }
        }

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        
        try {
            notificationManager.notify(isAlarm ? 1 : 0, notificationBuilder.build());
            Log.i(TAG, "✅ NOTIFICATION DISPLAYED SUCCESSFULLY" + (isAlarm ? " 🚨 WITH ALARM" : ""));
        } catch (SecurityException e) {
            Log.e(TAG, "❌ PERMISSION DENIED FOR NOTIFICATIONS", e);
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            
            // Create default notification channel
            CharSequence name = getString(R.string.default_notification_channel_name);
            String description = getString(R.string.default_notification_channel_description);
            int importance = NotificationManager.IMPORTANCE_HIGH;
            
            NotificationChannel defaultChannel = new NotificationChannel(CHANNEL_ID, name, importance);
            defaultChannel.setDescription(description);
            defaultChannel.enableLights(true);
            defaultChannel.enableVibration(true);
            
            // Create alarm notification channel
            NotificationChannel alarmChannel = new NotificationChannel(ALARM_CHANNEL_ID, "Urgent Alerts", NotificationManager.IMPORTANCE_MAX);
            alarmChannel.setDescription("Critical notifications with alarm sound");
            alarmChannel.enableLights(true);
            alarmChannel.setLightColor(0xFFFF0000); // Red light
            alarmChannel.enableVibration(true);
            alarmChannel.setVibrationPattern(new long[]{0, 1000, 500, 1000, 500, 1000});
            
            // Set alarm sound for the alarm channel
            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound != null) {
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build();
                alarmChannel.setSound(alarmSound, audioAttributes);
                Log.i(TAG, "🔊 ALARM CHANNEL CONFIGURED");
            }
            
            notificationManager.createNotificationChannel(defaultChannel);
            notificationManager.createNotificationChannel(alarmChannel);
            
            Log.i(TAG, "📺 NOTIFICATION CHANNELS CREATED: " + CHANNEL_ID + " & " + ALARM_CHANNEL_ID);
        }
    }
}
