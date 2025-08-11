import { IDASHAppState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import Logo from '@app/assets/logo-horizontal.png';
import LogoSquared from  '@app/assets/logo-squared.png';
import BackImage from  '@app/assets/login-back.png';
export interface IFullLayoutMarkup<U = any, A = any> extends React.PropsWithChildren {
    logo?: string | React.ReactNode;
    loginBackground?: string | React.ReactNode;
}

const FullLayoutMarkup = <U, A>({
    children,
    className,
    logo = <img alt='logo' className='dash-app-login-logo' src={Logo} />,
    loginBackground = <img alt='' src={BackImage} />,
    ...props
  }: IFullLayoutMarkup<U, A> & { className?: string }): React.JSX.Element => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const isMd = useMediaQuery(theme.breakpoints.only('md'));
    const isLg = useMediaQuery(theme.breakpoints.only('lg'));
    const isXl = useMediaQuery(theme.breakpoints.only('xl'));
/*
      // Mobile and keyboard state
    const [isMobile, setIsMobile] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

     
    // Check if Capacitor Keyboard is available through window
    const isCapacitorKeyboardAvailable = (): boolean => {
        const hasCapacitor = !!(window as any)?.Capacitor?.Plugins?.Keyboard;
        const hasCapacitorKeyboard = !!(window as any)?.CapacitorKeyboard;
        console.log('Checking Capacitor keyboard availability:', { hasCapacitor, hasCapacitorKeyboard });
        return hasCapacitor || hasCapacitorKeyboard;
    };

    // Get Capacitor Keyboard instance from window
    const getCapacitorKeyboard = () => {
        return (window as any)?.Capacitor?.Plugins?.Keyboard || (window as any)?.CapacitorKeyboard;
    };
    
    const checkMobileDevice = () => {
        // Check body classes for mobile devices
        const bodyClasses = document.body.className;
        const hasMobileClass = bodyClasses.includes('webview') || 
                              bodyClasses.includes('android') || 
                              bodyClasses.includes('ios') || 
                              bodyClasses.includes('mobile');
        
        // Check screen width
        const screenWidth = window.innerWidth;
        const isSmallScreen = screenWidth < 700;
        
        // Consider mobile if either condition is true
        return hasMobileClass || isSmallScreen;
    };

    // Keyboard logging functions
    const logKeyboardShow = (height?: number, source: 'capacitor' | 'fallback' = 'capacitor') => {
        console.log(`🔼 KEYBOARD OPENED (${source}):`, {
            height: height || 'unknown',
            timestamp: new Date().toISOString(),
            isMobile,
            screenHeight: window.screen.height,
            viewportHeight: window.visualViewport?.height || window.innerHeight,
            source
        });
    };

    const logKeyboardHide = (source: 'capacitor' | 'fallback' = 'capacitor') => {
        console.log(`🔽 KEYBOARD CLOSED (${source}):`, {
            timestamp: new Date().toISOString(),
            isMobile,
            screenHeight: window.screen.height,
            viewportHeight: window.visualViewport?.height || window.innerHeight,
            source
        });
    };

    // Fallback keyboard detection for web/non-Capacitor environments
    const setupFallbackKeyboardDetection = () => {
        const handleResize = () => {
            const mobile = checkMobileDevice();
            setIsMobile(mobile);
            
            if (mobile) {
                // On mobile, detect keyboard by viewport height change
                const viewportHeight = window.visualViewport?.height || window.innerHeight;
                const screenHeight = window.screen.height;
                
                // If viewport is significantly smaller than screen, keyboard is likely open
                const keyboardThreshold = screenHeight * 0.75;
                const keyboardOpen = viewportHeight < keyboardThreshold;
                
                // Only log if keyboard state actually changed
                if (keyboardOpen !== isKeyboardOpen) {
                    if (keyboardOpen) {
                        const estimatedKeyboardHeight = screenHeight - viewportHeight;
                        logKeyboardShow(estimatedKeyboardHeight, 'fallback');
                        setKeyboardHeight(estimatedKeyboardHeight);
                    } else {
                        logKeyboardHide('fallback');
                        setKeyboardHeight(0);
                    }
                    setIsKeyboardOpen(keyboardOpen);
                }
            }
        };

        // Add resize listeners
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
    };

    // Setup keyboard detection (Capacitor or fallback)
    useEffect(() => {
        // Initial mobile check
        setIsMobile(checkMobileDevice());
        
        if (isCapacitorKeyboardAvailable()) {
            const Keyboard = getCapacitorKeyboard();
            
            if (Keyboard) {
                console.log('🎹 Using Capacitor Keyboard API for keyboard detection');
                
                // Setup Capacitor keyboard listeners
                const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (info: any) => {
                    console.log('📱 Capacitor: keyboard will show with height:', info.keyboardHeight);
                    logKeyboardShow(info.keyboardHeight, 'capacitor');
                    setIsKeyboardOpen(true);
                    setKeyboardHeight(info.keyboardHeight);
                });

                const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (info: any) => {
                    console.log('📱 Capacitor: keyboard did show with height:', info.keyboardHeight);
                    // Don't log again here to avoid duplicate logs, just ensure state is correct
                    setIsKeyboardOpen(true);
                    setKeyboardHeight(info.keyboardHeight);
                });

                const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
                    console.log('📱 Capacitor: keyboard will hide');
                    logKeyboardHide('capacitor');
                    setIsKeyboardOpen(false);
                    setKeyboardHeight(0);
                });

                const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                    console.log('📱 Capacitor: keyboard did hide');
                    // Don't log again here to avoid duplicate logs, just ensure state is correct
                    setIsKeyboardOpen(false);
                    setKeyboardHeight(0);
                });

                // Cleanup function for Capacitor listeners
                return () => {
                    keyboardWillShowListener.then((listener: any) => listener.remove());
                    keyboardDidShowListener.then((listener: any) => listener.remove());
                    keyboardWillHideListener.then((listener: any) => listener.remove());
                    keyboardDidHideListener.then((listener: any) => listener.remove());
                };
            }
        }
        
        // If Capacitor is not available or Keyboard is not found, use fallback
        console.log('🌐 Using fallback keyboard detection (viewport-based)');
        return setupFallbackKeyboardDetection();
    }, []);

    // Configure Capacitor Keyboard on mount (if available)
    useEffect(() => {
        const configureKeyboard = async () => {
            if (isCapacitorKeyboardAvailable()) {
                const Keyboard = getCapacitorKeyboard();
                
                if (Keyboard) {
                    try {
                        console.log('⚙️ Configuring Capacitor Keyboard settings...');
                        
                        // Disable accessory bar for cleaner login UI
                        await Keyboard.setAccessoryBarVisible({ isVisible: false });
                        
                        // Set resize mode to body for better control
                        await Keyboard.setResizeMode({ mode: 'body' });
                        
                        console.log('✅ Capacitor Keyboard configured successfully');
                    } catch (error) {
                        console.log('❌ Error configuring Capacitor Keyboard:', error);
                    }
                }
            }
        };

        configureKeyboard();
    }, []);
    */
    
    const currentSize = isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : isXl ? 'xl' : '';
    
    return (
        <div className={`dash-app-layout ${className || ''}`}>
            <div className='dash-app-login-wrapper'>
                <div className='dash-app-login-content'>
               
                    {children}
                </div>
                <div className='dash-app-login-back'>
                   
                    <div className='dash-app-login-img'>
                       {typeof loginBackground === 'string' ? <img src={loginBackground} alt='' /> : loginBackground}
                    </div>
                     <div className='dash-app-login-logo'>
                     {typeof logo === 'string' ? <img alt='logo' className='dash-app-login-logo' src={logo} /> : <div className='dash-app-login-logo'>{logo}</div>}
                     </div>
                </div>
            </div>
        </div>
    );
};
export default FullLayoutMarkup;