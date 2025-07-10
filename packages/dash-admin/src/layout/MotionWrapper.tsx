import { motion } from "framer-motion";
import { Outlet } from "react-router";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface IMotionWrapper {
    pageTransition?: boolean,
    loadingSpinner?: boolean,
    transitionDuration?: number
    maxTimeOut?: number
    initialShow?: boolean
    usePortalForBackground?: boolean // Control portal usage for background
    usePortalForSpinner?: boolean // Control portal usage for spinner
    portalTarget?: string | HTMLElement // Target element for portal
    spinnerPortalTarget?: string | HTMLElement // Separate target for spinner portal
}

/*

// Both background and spinner in portals (same target)
<MotionWrapper 
    usePortalForBackground={true}
    usePortalForSpinner={true}
    initialShow={true}
/>

// Both in portals with different targets
<MotionWrapper 
    usePortalForBackground={true}
    usePortalForSpinner={true}
    portalTarget="#app-background"
    spinnerPortalTarget="#app-spinner"
    initialShow={true}
/>

// Only spinner in portal
<MotionWrapper 
    usePortalForSpinner={true}
    spinnerPortalTarget="body"
    initialShow={true}
/>

// Normal rendering (default behavior)
<MotionWrapper initialShow={true} />
*/

export const SpinnerComponent: React.FC<{ transitionDuration: number, show: boolean }> = ({ transitionDuration, show }) => {
    return <motion.div layout
        className={`${show ? 'slide-in' : 'slide-out'} lds-ring`}
        initial={{ scaleY: 1, scaleX: 1 }}
        animate={{ scaleY: 0, scaleX: 0 }}
        exit={{ scaleY: 1, scaleX: 1 }}
        transition={{ duration: transitionDuration, ease: [0.33, 1, 0.33, 1] }}
        variants={{
            initial: {
                opacity: 1,
                transition: { duration: transitionDuration },
            },
            in: {
                opacity: 0,
                transition: { duration: transitionDuration },
            },
            out: {
                opacity: 1,
                transition: { duration: transitionDuration },
            },
        }}
        style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000, // Higher than background
            pointerEvents: 'none'
        }}
    >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </motion.div>
}

export const MotionWrapperBackground: React.FC<{ transitionDuration: number, show: boolean }> = ({ transitionDuration, show }) => {
    return <motion.div layout
        className={'motion-wrapper-bg'}
        initial={{ scaleY: 1, scaleX: 1 }}
        animate={{ scaleY: 0, scaleX: 0 }}
        exit={{ scaleY: 1, scaleX: 1 }}
        transition={{ duration: transitionDuration, ease: [0.33, 1, 0.33, 1] }}
        variants={{
            initial: {
                opacity: 1,
                transition: { duration: transitionDuration },
            },
            in: {
                opacity: 0,
                transition: { duration: transitionDuration },
            },
            out: {
                opacity: 1,
                transition: { duration: transitionDuration },
            },
        }}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999, // High z-index for portal usage
            pointerEvents: 'none' // Allow clicks to pass through
        }}
    />
}

const MotionWrapper: React.FC<IMotionWrapper> = (props) => {
    const { 
        pageTransition = true, 
        loadingSpinner = true, 
        transitionDuration = 0.5, 
        maxTimeOut = 1000, 
        initialShow = false,
        usePortalForBackground = false,
        usePortalForSpinner = false,
        portalTarget = 'body',
        spinnerPortalTarget = 'body'
    } = props;
    
    const [show, setShow] = useState(initialShow);
    const [isAnimating, setIsAnimating] = useState(false);
    const [backgroundPortalContainer, setBackgroundPortalContainer] = useState<HTMLElement | null>(null);
    const [spinnerPortalContainer, setSpinnerPortalContainer] = useState<HTMLElement | null>(null);

    // Set up portal containers
    useEffect(() => {
        // Background portal container
        if (usePortalForBackground) {
            let container: HTMLElement;
            
            if (typeof portalTarget === 'string') {
                container = document.querySelector(portalTarget) as HTMLElement;
                if (!container) {
                    container = document.body; // Fallback to body
                }
            } else {
                container = portalTarget;
            }
            
            setBackgroundPortalContainer(container);
        }

        // Spinner portal container
        if (usePortalForSpinner) {
            let container: HTMLElement;
            
            if (typeof spinnerPortalTarget === 'string') {
                container = document.querySelector(spinnerPortalTarget) as HTMLElement;
                if (!container) {
                    container = document.body; // Fallback to body
                }
            } else {
                container = spinnerPortalTarget;
            }
            
            setSpinnerPortalContainer(container);
        }
    }, [usePortalForBackground, usePortalForSpinner, portalTarget, spinnerPortalTarget]);

    // Update local state when initialShow prop changes
    useEffect(() => {
        if (initialShow && !isAnimating) {
            setIsAnimating(true);
            setShow(true);
            
            // Set up timeout to hide elements after maxTimeOut
            const timer = setTimeout(() => {
                setShow(false);
                // Add a small delay before marking animation as complete
                setTimeout(() => {
                    setIsAnimating(false);
                }, transitionDuration * 1000);
            }, maxTimeOut);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [initialShow, maxTimeOut, transitionDuration, isAnimating]);

    const renderBackground = () => {
        if (!pageTransition) return null;
        
        const backgroundComponent = (
            <MotionWrapperBackground 
                transitionDuration={transitionDuration} 
                show={show} 
            />
        );

        // Render in portal if enabled and container is available
        if (usePortalForBackground && backgroundPortalContainer) {
            return createPortal(backgroundComponent, backgroundPortalContainer);
        }

        // Render normally
        return backgroundComponent;
    };

    const renderSpinner = () => {
        if (!loadingSpinner) return null;
        
        const spinnerComponent = (
            <SpinnerComponent 
                transitionDuration={transitionDuration} 
                show={show} 
            />
        );

        // Render in portal if enabled and container is available
        if (usePortalForSpinner && spinnerPortalContainer) {
            return createPortal(spinnerComponent, spinnerPortalContainer);
        }

        // Render normally
        return spinnerComponent;
    };

    return <>
        {renderSpinner()}
        {renderBackground()}
        <Outlet />
    </>;
}

export default MotionWrapper;
