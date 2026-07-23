package com.dash.app;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.os.PowerManager;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Full-screen activity that displays when an alarm/urgent notification is received.
 * Shows over the lock screen with sound and vibration.
 */
public class AlarmActivity extends AppCompatActivity {
    private static final String TAG = "AlarmActivity";
    
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable autoStopRunnable;
    
    // Auto-stop after 60 seconds
    private static final long AUTO_STOP_DELAY = 60000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.i(TAG, "🚨 AlarmActivity created");
        
        // Show over lock screen
        setupWindowFlags();
        
        // Acquire wake lock to keep screen on
        acquireWakeLock();
        
        // Set the content view
        setContentView(R.layout.activity_alarm);
        
        // Get data from intent
        Intent intent = getIntent();
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        String type = intent.getStringExtra("type");
        
        // Set up UI
        setupUI(title, body);
        
        // Start alarm sound and vibration
        startAlarm();
        
        // Auto-stop after timeout
        scheduleAutoStop();
    }

    private void setupWindowFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (keyguardManager != null) {
                keyguardManager.requestDismissKeyguard(this, null);
            }
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
            );
        }
        
        // Keep screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    private void acquireWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK | 
                    PowerManager.ACQUIRE_CAUSES_WAKEUP | 
                    PowerManager.ON_AFTER_RELEASE,
                    "dash:alarm_wakelock"
                );
                wakeLock.acquire(AUTO_STOP_DELAY + 5000); // Slightly longer than auto-stop
                Log.i(TAG, "🔓 Wake lock acquired for alarm");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error acquiring wake lock", e);
        }
    }

    private void setupUI(String title, String body) {
        // Find UI elements
        TextView titleTextView = findViewById(R.id.alarm_title);
        TextView bodyTextView = findViewById(R.id.alarm_body);
        Button dismissButton = findViewById(R.id.dismiss_button);
        Button openAppButton = findViewById(R.id.open_app_button);
        
        // Set text
        if (titleTextView != null) {
            titleTextView.setText(title != null ? title : "New Alert");
        }
        if (bodyTextView != null) {
            bodyTextView.setText(body != null ? body : "You have a new notification");
        }
        
        // Set up dismiss button
        if (dismissButton != null) {
            dismissButton.setOnClickListener(v -> {
                Log.i(TAG, "🔕 Dismiss button clicked");
                stopAlarm();
                finish();
            });
        }
        
        // Set up open app button
        if (openAppButton != null) {
            openAppButton.setOnClickListener(v -> {
                Log.i(TAG, "📱 Open app button clicked");
                stopAlarm();
                openMainActivity();
            });
        }
    }

    private void startAlarm() {
        Log.i(TAG, "🔊 Starting alarm sound and vibration");
        playAlarmSound();
        startVibration();
    }

    private void playAlarmSound() {
        try {
            // Stop any existing player
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.release();
                mediaPlayer = null;
            }
            
            // Get alarm sound
            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound == null) {
                alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            
            mediaPlayer = MediaPlayer.create(this, alarmSound);
            if (mediaPlayer != null) {
                // Set audio attributes
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build();
                mediaPlayer.setAudioAttributes(audioAttributes);
                
                // Maximize volume
                AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
                if (audioManager != null) {
                    int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                    audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
                }
                
                // Loop the alarm
                mediaPlayer.setLooping(true);
                mediaPlayer.start();
                
                Log.i(TAG, "🔊 Alarm sound playing");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error playing alarm sound", e);
        }
    }

    private void startVibration() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vibratorManager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                vibrator = vibratorManager.getDefaultVibrator();
            } else {
                vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            }
            
            if (vibrator != null && vibrator.hasVibrator()) {
                // Pattern: wait, vibrate, pause, repeat
                long[] pattern = new long[]{0, 1000, 500, 1000, 500, 1000, 500};
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0)); // 0 = repeat from start
                } else {
                    vibrator.vibrate(pattern, 0);
                }
                
                Log.i(TAG, "📳 Vibration started");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error starting vibration", e);
        }
    }

    private void stopAlarm() {
        Log.i(TAG, "🔕 Stopping alarm");
        
        // Stop sound
        if (mediaPlayer != null) {
            try {
                mediaPlayer.stop();
                mediaPlayer.release();
            } catch (Exception e) {
                Log.e(TAG, "Error stopping media player", e);
            }
            mediaPlayer = null;
        }
        
        // Stop vibration
        if (vibrator != null) {
            try {
                vibrator.cancel();
            } catch (Exception e) {
                Log.e(TAG, "Error stopping vibrator", e);
            }
            vibrator = null;
        }
        
        // Release wake lock
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception e) {
                Log.e(TAG, "Error releasing wake lock", e);
            }
            wakeLock = null;
        }
        
        // Cancel auto-stop
        if (autoStopRunnable != null) {
            handler.removeCallbacks(autoStopRunnable);
        }
    }

    private void scheduleAutoStop() {
        autoStopRunnable = () -> {
            Log.i(TAG, "⏱️ Auto-stopping alarm after timeout");
            stopAlarm();
            finish();
        };
        handler.postDelayed(autoStopRunnable, AUTO_STOP_DELAY);
    }

    private void openMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        
        // Pass through any extras from the original notification
        Intent originalIntent = getIntent();
        if (originalIntent != null && originalIntent.getExtras() != null) {
            intent.putExtras(originalIntent.getExtras());
        }
        
        startActivity(intent);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarm();
        Log.i(TAG, "🚨 AlarmActivity destroyed");
    }

    @Override
    public void onBackPressed() {
        // Dismiss the alarm on back press
        stopAlarm();
        super.onBackPressed();
    }
}
