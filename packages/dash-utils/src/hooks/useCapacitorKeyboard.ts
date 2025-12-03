import { useEffect, useState, useCallback } from 'react';

export interface KeyboardState {
    isKeyboardOpen: boolean;
    keyboardHeight: number;
}

export interface UseCapacitorKeyboardOptions {
    /** Disable accessory bar for cleaner UI */
    disableAccessoryBar?: boolean;
    /** Resize mode: 'body', 'ionic', 'native', 'none' */
    resizeMode?: 'body' | 'ionic' | 'native' | 'none';
    /** Enable debug logging */
    debug?: boolean;
}

/**
 * Check if Capacitor Keyboard plugin is available
 */
export const isCapacitorKeyboardAvailable = (): boolean => {
    const hasCapacitor = !!(window as any)?.Capacitor?.Plugins?.Keyboard;
    const hasCapacitorKeyboard = !!(window as any)?.CapacitorKeyboard;
    return hasCapacitor || hasCapacitorKeyboard;
};

/**
 * Get Capacitor Keyboard instance from window
 */
export const getCapacitorKeyboard = () => {
    return (window as any)?.Capacitor?.Plugins?.Keyboard || (window as any)?.CapacitorKeyboard;
};

/**
 * Hook for Capacitor keyboard detection and management
 * Handles both Capacitor native keyboard and fallback viewport-based detection
 *
 * @param options - Configuration options
 * @returns Keyboard state and utility functions
 */
export const useCapacitorKeyboard = (options: UseCapacitorKeyboardOptions = {}) => {
    const {
        disableAccessoryBar = true,
        resizeMode = 'body',
        debug = false
    } = options;

    const [keyboardState, setKeyboardState] = useState<KeyboardState>({
        isKeyboardOpen: false,
        keyboardHeight: 0,
    });

    const log = useCallback((message: string, data?: any) => {
        if (debug) {
            console.log(`[useCapacitorKeyboard] ${message}`, data || '');
        }
    }, [debug]);

    // Hide keyboard programmatically
    const hideKeyboard = useCallback(async () => {
        if (isCapacitorKeyboardAvailable()) {
            const Keyboard = getCapacitorKeyboard();
            if (Keyboard?.hide) {
                try {
                    log('Hiding keyboard...');
                    await Keyboard.hide();
                } catch (error) {
                    log('Error hiding keyboard:', error);
                }
            }
        }
    }, [log]);

    // Show keyboard programmatically
    const showKeyboard = useCallback(async () => {
        if (isCapacitorKeyboardAvailable()) {
            const Keyboard = getCapacitorKeyboard();
            if (Keyboard?.show) {
                try {
                    log('Showing keyboard...');
                    await Keyboard.show();
                } catch (error) {
                    log('Error showing keyboard:', error);
                }
            }
        }
    }, [log]);

    // Configure Capacitor Keyboard
    useEffect(() => {
        const configureKeyboard = async () => {
            if (isCapacitorKeyboardAvailable()) {
                const Keyboard = getCapacitorKeyboard();
                if (Keyboard) {
                    try {
                        log('Configuring Capacitor Keyboard...');

                        if (Keyboard.setAccessoryBarVisible) {
                            await Keyboard.setAccessoryBarVisible({ isVisible: !disableAccessoryBar });
                        }

                        if (Keyboard.setResizeMode) {
                            await Keyboard.setResizeMode({ mode: resizeMode });
                        }

                        log('Capacitor Keyboard configured successfully');
                    } catch (error) {
                        log('Error configuring Capacitor Keyboard:', error);
                    }
                }
            }
        };

        configureKeyboard();
    }, [disableAccessoryBar, resizeMode, log]);

    // Setup keyboard listeners
    useEffect(() => {
        if (isCapacitorKeyboardAvailable()) {
            const Keyboard = getCapacitorKeyboard();

            if (Keyboard) {
                log('Using Capacitor Keyboard API');

                const handleKeyboardWillShow = (info: any) => {
                    log('Keyboard will show', { height: info.keyboardHeight });
                    setKeyboardState({
                        isKeyboardOpen: true,
                        keyboardHeight: info.keyboardHeight,
                    });
                };

                const handleKeyboardDidShow = (info: any) => {
                    setKeyboardState({
                        isKeyboardOpen: true,
                        keyboardHeight: info.keyboardHeight,
                    });
                };

                const handleKeyboardWillHide = () => {
                    log('Keyboard will hide');
                    setKeyboardState({
                        isKeyboardOpen: false,
                        keyboardHeight: 0,
                    });
                };

                const handleKeyboardDidHide = () => {
                    setKeyboardState({
                        isKeyboardOpen: false,
                        keyboardHeight: 0,
                    });
                };

                Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow);
                Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
                Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide);
                Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

                return () => {
                    Keyboard.removeAllListeners?.();
                };
            }
        }

        // Fallback: viewport-based detection for web
        log('Using fallback viewport-based keyboard detection');

        let previousViewportHeight = window.visualViewport?.height || window.innerHeight;

        const handleResize = () => {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            const screenHeight = window.screen.height;

            // If viewport is significantly smaller than screen, keyboard is likely open
            const keyboardThreshold = screenHeight * 0.75;
            const keyboardOpen = viewportHeight < keyboardThreshold;

            if (keyboardOpen !== keyboardState.isKeyboardOpen) {
                const estimatedKeyboardHeight = keyboardOpen ? screenHeight - viewportHeight : 0;
                log(keyboardOpen ? 'Keyboard opened (fallback)' : 'Keyboard closed (fallback)', {
                    height: estimatedKeyboardHeight
                });
                setKeyboardState({
                    isKeyboardOpen: keyboardOpen,
                    keyboardHeight: estimatedKeyboardHeight,
                });
            }

            previousViewportHeight = viewportHeight;
        };

        window.addEventListener('resize', handleResize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, [log, keyboardState.isKeyboardOpen]);

    return {
        ...keyboardState,
        hideKeyboard,
        showKeyboard,
        isCapacitorAvailable: isCapacitorKeyboardAvailable(),
    };
};

export default useCapacitorKeyboard;
