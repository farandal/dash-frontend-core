import { motion } from "framer-motion";
import { Outlet } from "react-router";
import React, { useEffect, useState } from 'react';

export interface IMotionWrapper {
    pageTransition?: boolean,
    loadingSpinner?: boolean,
    transitionDuration?: number
    maxTimeOut?: number
}
const MotionWrapper: React.FC<IMotionWrapper> = (props) => {
    const { pageTransition = true, loadingSpinner = true, transitionDuration = 0.5, maxTimeOut = 8000 } = props;
    //return <Outlet />;
    const [show, setShow] = useState(true);
    useEffect(() => {
        console.log("MotionWrapper Loaded/updated");

        setShow(true);

        const timer = setTimeout(() => {
            setShow(false);
        }, maxTimeOut);

        return () => {
            console.log("MotionWrapper Unmounted");
            clearTimeout(timer);
        }
    }, [maxTimeOut]);

    return <>

        {show && loadingSpinner && <motion.div
            className={'slide-in lds-ring'}
            initial={{ scaleY: 0, scaleX: 0 }}
            animate={{ scaleY: 1, scaleX: 0 }}
            exit={{ scaleY: 1, scaleX: 1 }}
            transition={{ duration: transitionDuration, ease: [0.33, 1, 0.33, 1] }}
            variants={{
                initial: {
                    opacity: 0,
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
        </motion.div>}

        {show && loadingSpinner && <motion.div
            className={'slide-out lds-ring'}
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: 0, scaleX: 0 }}
            exit={{ scaleY: 0, scaleX: 0 }}
            transition={{ duration: transitionDuration, ease: [0.33, 1, 0.33, 1] }}
            variants={{
                initial: {
                    opacity: 1,
                    transition: { duration: transitionDuration },
                },
                in: {
                    opacity: 1,
                    transition: { duration: transitionDuration },
                },
                out: {
                    opacity: 0,
                    transition: { duration: transitionDuration },
                },
            }}
        >

            <div></div>
            <div></div>
            <div></div>
            <div></div>

            {/*<div className="lds-ripple"><div></div><div></div></div>*/}
        </motion.div>}


        {show && pageTransition && <motion.div
            className={'motion-wrapper-background'}
            initial={{ scaleY: 0, scaleX: 0 }}
            animate={{ scaleY: 1, scaleX: 0 }}
            exit={{ scaleY: 1, scaleX: 1 }}
            transition={{ duration: transitionDuration, ease: [0.33, 1, 0.33, 1] }}
            variants={{
                initial: {
                    opacity: 0,
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


        </motion.div>}

        {show && pageTransition && <motion.div
            className={'motion-wrapper-background'}
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: 0, scaleX: 0 }}
            exit={{ scaleY: 0, scaleX: 0 }}
            transition={{ duration: transitionDuration, ease: [0.33, 1, 0.33, 1] }}
            variants={{
                initial: {
                    opacity: 1,
                    transition: { duration: transitionDuration },
                },
                in: {
                    opacity: 1,
                    transition: { duration: transitionDuration },
                },
                out: {
                    opacity: 0,
                    transition: { duration: transitionDuration },
                },
            }}
        >

        </motion.div>}
        <Outlet />
    </>

}

export default MotionWrapper;