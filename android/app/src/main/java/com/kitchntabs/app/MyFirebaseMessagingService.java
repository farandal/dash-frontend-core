package com.kitchntabs.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.Log;
import android.provider.Settings;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";
    private static final String CHANNEL_ID = "default_channel";
    private static final String ALARM_CHANNEL_ID = "alarm_channel";
    private static final String ORDER_CHANNEL_ID = "order_channel";
    
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        Log.i(TAG, "🔥 FCM MESSAGE RECEIVED 🔥");
        
        // Wake up device for important notifications
        acquireWakeLock();

        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            Log.i(TAG, "📱 NOTIFICATION: " + title + " | " + body);
            
            // Check notification type
            NotificationType notificationType = getNotificationType(remoteMessage);
            showNotification(title, body, notificationType, remoteMessage.getData());
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
                    
                    NotificationType notificationType = getNotificationType(remoteMessage);
                    showNotification(title, body, notificationType, remoteMessage.getData());
                } else {
                    Log.w(TAG, "❌ NO TITLE/BODY IN DATA PAYLOAD");
                }
            }
        }
        
        if (remoteMessage.getNotification() == null && remoteMessage.getData().size() == 0) {
            Log.w(TAG, "❌ EMPTY MESSAGE - NO NOTIFICATION OR DATA");
        }
        
        // Release wake lock after a delay
        releaseWakeLockWithDelay();
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.i(TAG, "🔑 NEW FCM TOKEN: " + token.substring(0, 20) + "...");
        
        // Send token to server if needed
        // You can implement this to update the token on your backend
    }

    // Notification type enum
    private enum NotificationType {
        NORMAL,
        ALARM,
        ORDER
    }

    private NotificationType getNotificationType(RemoteMessage remoteMessage) {
        String type = remoteMessage.getData().get("type");
        String priority = remoteMessage.getData().get("priority");
        String isAlarm = remoteMessage.getData().get("alarm");
        String isOrder = remoteMessage.getData().get("order");
        
        // Check for order notification
        if ("true".equals(isOrder) || "order".equals(type) || "tab.status".equals(type) || 
            "print:speech:message".equals(type)) {
            return NotificationType.ORDER;
        }
        
        // Check for alarm notification
        String title = remoteMessage.getNotification() != null ? 
            remoteMessage.getNotification().getTitle() : 
            remoteMessage.getData().get("title");
            
        if (title != null) {
            String lowerTitle = title.toLowerCase();
            if (lowerTitle.contains("urgent") || lowerTitle.contains("alarm") || 
                lowerTitle.contains("emergency") || lowerTitle.contains("critical") ||
                lowerTitle.contains("alert") || lowerTitle.contains("warning")) {
                return NotificationType.ALARM;
            }
        }
        
        if ("true".equals(isAlarm) || "high".equals(priority) || "alarm".equals(type)) {
            return NotificationType.ALARM;
        }
        
        return NotificationType.NORMAL;
    }

    private void acquireWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                    "kitchntabs:fcm_wakelock"
                );
                wakeLock.acquire(60 * 1000L); // 60 seconds max
                Log.i(TAG, "🔓 Wake lock acquired");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error acquiring wake lock", e);
        }
    }

    private void releaseWakeLockWithDelay() {
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
                Log.i(TAG, "🔒 Wake lock released");
            }
        }, 10000); // Release after 10 seconds
    }

    private boolean checkIfAlarmNotification(RemoteMessage remoteMessage) {
        return getNotificationType(remoteMessage) == NotificationType.ALARM;
    }

    private void showNotification(String title, String body, NotificationType notificationType, java.util.Map<String, String> data) {
        Log.i(TAG, "🔔 SHOWING NOTIFICATION: " + title + " | " + body + " | Type: " + notificationType);
        
        createNotificationChannels();

        // Determine channel and importance based on notification type
        String channelId;
        int priority;
        int notificationId;
        
        switch (notificationType) {
            case ALARM:
                channelId = ALARM_CHANNEL_ID;
                priority = NotificationCompat.PRIORITY_MAX;
                notificationId = 1;
                break;
            case ORDER:
                channelId = ORDER_CHANNEL_ID;
                priority = NotificationCompat.PRIORITY_HIGH;
                notificationId = 2;
                break;
            default:
                channelId = CHANNEL_ID;
                priority = NotificationCompat.PRIORITY_HIGH;
                notificationId = 0;
                break;
        }

        // Create intent for when notification is tapped
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        
        // Pass data to the activity
        if (data != null) {
            for (java.util.Map.Entry<String, String> entry : data.entrySet()) {
                intent.putExtra(entry.getKey(), entry.getValue());
            }
        }
        
        PendingIntent pendingIntent = PendingIntent.getActivity(this, notificationId, intent, 
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelId)
                        .setSmallIcon(R.drawable.ic_notification)
                        .setContentTitle(title != null ? title : "New Notification")
                        .setContentText(body != null ? body : "You have a new message")
                        .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                        .setAutoCancel(true)
                        .setPriority(priority)
                        .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                        .setContentIntent(pendingIntent);

        // Handle based on notification type
        if (notificationType == NotificationType.ALARM || notificationType == NotificationType.ORDER) {
            // For alarm and order notifications, play custom sound and vibrate
            notificationBuilder
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setVibrate(new long[]{0, 500, 200, 500, 200, 500})
                .setLights(Color.RED, 1000, 1000);
            
            // Play alarm sound
            playNotificationSound(notificationType);
            
            // Vibrate the device
            vibrateDevice(notificationType);
            
            // For order notifications, add action buttons
            if (notificationType == NotificationType.ORDER) {
                Intent confirmIntent = new Intent(this, MainActivity.class);
                confirmIntent.setAction("ACTION_CONFIRM_ORDER");
                if (data != null && data.get("tab_id") != null) {
                    confirmIntent.putExtra("tab_id", data.get("tab_id"));
                }
                PendingIntent confirmPendingIntent = PendingIntent.getActivity(this, 100, confirmIntent,
                    PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
                
                notificationBuilder.addAction(R.drawable.ic_notification, "View Order", confirmPendingIntent);
            }
            
            // For alarms, add full-screen intent for heads-up display
            if (notificationType == NotificationType.ALARM) {
                Intent fullScreenIntent = new Intent(this, AlarmActivity.class);
                fullScreenIntent.setAction("ACTION_ALARM");
                fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                // Pass notification data to AlarmActivity
                fullScreenIntent.putExtra("title", title);
                fullScreenIntent.putExtra("body", body);
                if (data != null) {
                    for (java.util.Map.Entry<String, String> entry : data.entrySet()) {
                        fullScreenIntent.putExtra(entry.getKey(), entry.getValue());
                    }
                }
                PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(this, 200, fullScreenIntent,
                    PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
                notificationBuilder.setFullScreenIntent(fullScreenPendingIntent, true);
            }
        }

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        
        try {
            notificationManager.notify(notificationId, notificationBuilder.build());
            Log.i(TAG, "✅ NOTIFICATION DISPLAYED SUCCESSFULLY | Type: " + notificationType);
        } catch (SecurityException e) {
            Log.e(TAG, "❌ PERMISSION DENIED FOR NOTIFICATIONS", e);
        }
    }

    private void playNotificationSound(NotificationType notificationType) {
        try {
            // Stop any previously playing sound
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.release();
                mediaPlayer = null;
            }
            
            Uri soundUri;
            if (notificationType == NotificationType.ALARM) {
                soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            } else {
                soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            
            if (soundUri == null) {
                soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            
            mediaPlayer = MediaPlayer.create(this, soundUri);
            if (mediaPlayer != null) {
                // Set audio attributes for alarm
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(notificationType == NotificationType.ALARM ? 
                        AudioAttributes.USAGE_ALARM : AudioAttributes.USAGE_NOTIFICATION)
                    .build();
                mediaPlayer.setAudioAttributes(audioAttributes);
                
                // For alarms, loop the sound
                if (notificationType == NotificationType.ALARM) {
                    mediaPlayer.setLooping(true);
                    // Stop after 30 seconds
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                            mediaPlayer.stop();
                            mediaPlayer.release();
                            mediaPlayer = null;
                            Log.i(TAG, "🔕 Alarm sound stopped after timeout");
                        }
                    }, 30000);
                }
                
                mediaPlayer.start();
                Log.i(TAG, "🔊 Playing notification sound");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error playing notification sound", e);
        }
    }

    private void vibrateDevice(NotificationType notificationType) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vibratorManager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                vibrator = vibratorManager.getDefaultVibrator();
            } else {
                vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            }
            
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern;
                if (notificationType == NotificationType.ALARM) {
                    // More aggressive vibration for alarms
                    pattern = new long[]{0, 1000, 500, 1000, 500, 1000, 500, 1000};
                } else {
                    // Standard vibration for orders
                    pattern = new long[]{0, 500, 200, 500};
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 
                        notificationType == NotificationType.ALARM ? 0 : -1));
                } else {
                    vibrator.vibrate(pattern, notificationType == NotificationType.ALARM ? 0 : -1);
                }
                Log.i(TAG, "📳 Device vibrating");
                
                // Stop vibration after 30 seconds for alarms
                if (notificationType == NotificationType.ALARM) {
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        if (vibrator != null) {
                            vibrator.cancel();
                            Log.i(TAG, "📳 Vibration stopped after timeout");
                        }
                    }, 30000);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error vibrating device", e);
        }
    }

    private void showNotification(String title, String body, boolean isAlarm) {
        // Backward compatibility method
        showNotification(title, body, isAlarm ? NotificationType.ALARM : NotificationType.NORMAL, null);
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
            
            // Create ORDER notification channel - HIGH priority with sound
            NotificationChannel orderChannel = new NotificationChannel(ORDER_CHANNEL_ID, "Order Notifications", NotificationManager.IMPORTANCE_HIGH);
            orderChannel.setDescription("New order notifications from the kitchen");
            orderChannel.enableLights(true);
            orderChannel.setLightColor(Color.GREEN);
            orderChannel.enableVibration(true);
            orderChannel.setVibrationPattern(new long[]{0, 500, 200, 500});
            orderChannel.setBypassDnd(true); // Bypass Do Not Disturb
            
            // Set notification sound for orders
            Uri orderSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            if (orderSound != null) {
                AudioAttributes orderAudioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
                orderChannel.setSound(orderSound, orderAudioAttributes);
            }
            
            // Create ALARM notification channel - MAX importance
            NotificationChannel alarmChannel = new NotificationChannel(ALARM_CHANNEL_ID, "Urgent Alerts", NotificationManager.IMPORTANCE_MAX);
            alarmChannel.setDescription("Critical notifications with alarm sound");
            alarmChannel.enableLights(true);
            alarmChannel.setLightColor(Color.RED);
            alarmChannel.enableVibration(true);
            alarmChannel.setVibrationPattern(new long[]{0, 1000, 500, 1000, 500, 1000});
            alarmChannel.setBypassDnd(true); // Bypass Do Not Disturb
            alarmChannel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            
            // Set alarm sound for the alarm channel
            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound != null) {
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build();
                alarmChannel.setSound(alarmSound, audioAttributes);
                Log.i(TAG, "🔊 ALARM CHANNEL CONFIGURED WITH ALARM SOUND");
            }
            
            notificationManager.createNotificationChannel(defaultChannel);
            notificationManager.createNotificationChannel(orderChannel);
            notificationManager.createNotificationChannel(alarmChannel);
            
            Log.i(TAG, "📺 NOTIFICATION CHANNELS CREATED: " + CHANNEL_ID + ", " + ORDER_CHANNEL_ID + " & " + ALARM_CHANNEL_ID);
        }
    }
}
