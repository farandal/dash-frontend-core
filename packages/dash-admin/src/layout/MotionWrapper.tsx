import { motion } from "framer-motion";
import { Outlet } from "react-router";
import React, { useEffect, useState } from 'react';

export interface IMotionWrapper {
    pageTransition?: boolean,
    loadingSpinner?: boolean,
    transitionDuration?: number
    maxTimeOut?: number
    initialShow?: boolean
}

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
    >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        {/*<div className="lds-ripple"><div></div><div></div></div>*/}
    </motion.div>
}

export const MotionWrapperBackground: React.FC<{ transitionDuration: number, show: boolean }> = ({ transitionDuration, show }) => {

    return <motion.div layout
        className={'motion-wrapper-background'}
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
    >
    </motion.div>
}

const MotionWrapper: React.FC<IMotionWrapper> = (props) => {
    const { 
        pageTransition = true, 
        loadingSpinner = true, 
        transitionDuration = 0.5, 
        maxTimeOut = 1000, 
        initialShow = false 
    } = props;
    
    const [show, setShow] = useState(initialShow);
    const [isAnimating, setIsAnimating] = useState(false);

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

    return <>
        {loadingSpinner && <SpinnerComponent transitionDuration={transitionDuration} show={show} />}
        {pageTransition && <MotionWrapperBackground transitionDuration={transitionDuration} show={show} />}
        <Outlet />
    </>;
}

export default MotionWrapper;