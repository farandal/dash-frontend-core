/**
 * Dash Default Notifications Processor
 * 
 * Dash default notification processing utilities.
 */

// Audio context for better browser compatibility
let audioContext: AudioContext | null = null;

// Re-export from dash-utils for backward compatibility
export { requestNotificationPermission as requestDashDefaultNotificationPermission } from 'dash-utils';

// Digital watch alarm configuration
const ALARM_DURATION_SECONDS = 10;
const ALARM_FREQUENCY_HIGH = 4000; // High frequency like digital watch
const ALARM_FREQUENCY_LOW = 2500;  // Alternating low frequency
const BEEP_DURATION_MS = 100;      // Short beeps
const BEEP_GAP_MS = 50;            // Gap between beeps
const BEEP_PATTERN_GAP_MS = 300;   // Gap between beep patterns

const initializeAudio = async (): Promise<boolean> => {
    try {
        // Initialize AudioContext if not already done
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Resume audio context if suspended (required by some browsers)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
        return false;
    }
};

/**
 * Play a single beep at specified frequency using oscillator (more reliable than buffer)
 */
const playOscillatorBeep = (frequency: number, durationMs: number): Promise<void> => {
    return new Promise((resolve) => {
        if (!audioContext) {
            resolve();
            return;
        }

        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'square'; // Square wave for that classic digital watch sound
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

            // Quick attack, sustain, quick release for sharp beep
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.4, now + 0.005); // 5ms attack
            gainNode.gain.setValueAtTime(0.4, now + (durationMs / 1000) - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, now + (durationMs / 1000)); // 10ms release

            oscillator.start(now);
            oscillator.stop(now + (durationMs / 1000));

            oscillator.onended = () => resolve();
        } catch (error) {
            console.error('Failed to play oscillator beep:', error);
            resolve();
        }
    });
};

/**
 * Play a digital watch alarm pattern: beep-beep-beep (pause) beep-beep-beep
 * Alternates between high and low frequencies
 */
const playAlarmPattern = async (useHighFreq: boolean): Promise<void> => {
    const freq = useHighFreq ? ALARM_FREQUENCY_HIGH : ALARM_FREQUENCY_LOW;
    
    // Play 3 quick beeps
    for (let i = 0; i < 3; i++) {
        await playOscillatorBeep(freq, BEEP_DURATION_MS);
        if (i < 2) {
            await new Promise(r => setTimeout(r, BEEP_GAP_MS));
        }
    }
};

/**
 * Play the full digital watch alarm sequence for specified duration
 * Returns a Promise that resolves when alarm completes
 * @param durationSeconds - Duration in seconds (default: 10)
 * @param settings - Optional alarm settings to override defaults
 */
export interface AlarmSettings {
    alarmDurationSeconds?: number;
    alarmFrequencyHigh?: number;
    alarmFrequencyLow?: number;
    beepDurationMs?: number;
    beepGapMs?: number;
    beepPatternGapMs?: number;
}

export const playDashDefaultDigitalWatchAlarm = async (
    durationSeconds?: number,
    settings?: AlarmSettings
): Promise<void> => {
    // Use provided settings or defaults
    const duration = durationSeconds ?? settings?.alarmDurationSeconds ?? ALARM_DURATION_SECONDS;
    const frequencyHigh = settings?.alarmFrequencyHigh ?? ALARM_FREQUENCY_HIGH;
    const frequencyLow = settings?.alarmFrequencyLow ?? ALARM_FREQUENCY_LOW;
    const beepDuration = settings?.beepDurationMs ?? BEEP_DURATION_MS;
    const beepGap = settings?.beepGapMs ?? BEEP_GAP_MS;
    const patternGap = settings?.beepPatternGapMs ?? BEEP_PATTERN_GAP_MS;
    
    console.log(`🔔 Starting digital watch alarm for ${duration} seconds...`);
    
    const initialized = await initializeAudio();
    if (!initialized) {
        console.error('Failed to initialize audio for alarm');
        return;
    }

    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    let patternCount = 0;

    // Custom playAlarmPattern that uses provided settings
    const playPatternWithSettings = async (useHighFreq: boolean): Promise<void> => {
        const freq = useHighFreq ? frequencyHigh : frequencyLow;
        
        // Play 3 quick beeps
        for (let i = 0; i < 3; i++) {
            await playOscillatorBeep(freq, beepDuration);
            if (i < 2 && beepGap > 0) {
                await new Promise(r => setTimeout(r, beepGap));
            }
        }
    };

    while (Date.now() < endTime) {
        // Alternate between high and low frequency patterns
        const useHighFreq = patternCount % 2 === 0;
        await playPatternWithSettings(useHighFreq);
        
        patternCount++;
        
        // Check if we still have time for another pattern
        if (Date.now() < endTime && patternGap > 0) {
            await new Promise(r => setTimeout(r, patternGap));
        }
    }

    console.log(`🔔 Digital watch alarm completed (${patternCount} patterns played)`);
};

/**
 * Legacy single beep for backwards compatibility
 */
export const playDashDefaultNotificationSound = async (): Promise<void> => {
    await playOscillatorBeep(ALARM_FREQUENCY_HIGH, BEEP_DURATION_MS);
};

export const processDashDefaultNotification = async (notification: any): Promise<{ alarmCompleted: boolean }> => {

    let marketplace = notification?.data?.marketplace?.system_marketplace?.name || "STORE" ;
    const isConfirmedStatus = notification?.data?.new === "CONFIRMED";
    let play = false;

    // Play alarm sound, if notification is assistance request or order is confirmed. 

    if (notification?.notificationPayload?.class === "MallStoreAssistanceNotification") {
        play = true;
      
    }

    if (isConfirmedStatus) {
        play = true;
    }

    if (play) {
      
        console.log("🚨 Playing digital watch alarm for new order...");
        
        // Play the digital watch alarm for 10 seconds
        // This returns a Promise that resolves when alarm is complete
        await playDashDefaultDigitalWatchAlarm(ALARM_DURATION_SECONDS);
        
        console.log("✅ Alarm sequence completed - TTS can now play");
      
        // Also show a browser notification if permissions allow
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Nueva Orden de ${marketplace}`, {
                body: notification?.data?.message || 'Nueva orden recibida',
                icon: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a8.png', // Alarm icon emoji
            });
        }
        
        return { alarmCompleted: true };
    }
    
    return { alarmCompleted: false };
};
