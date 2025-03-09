import { motion } from "framer-motion";
import { Outlet } from "react-router";
import React from 'react';

export interface IMotionWrapper {
    pageTransition?: boolean,
    loadingSpinner?: boolean,
    transitionDuration?: number
}
const MotionWrapper: React.FC<IMotionWrapper> = (props) => {
    const [firstLoad, setFirstLoad] = React.useState(true);
    const { pageTransition = true, loadingSpinner = true, transitionDuration = 0.5 } = props;
    //return <Outlet />;

    if (firstLoad) {
        setFirstLoad(false);
        return <Outlet />;
    }

    return <>

        {loadingSpinner && <motion.div
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

        {loadingSpinner && <motion.div
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


        {pageTransition && <motion.div
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

        {pageTransition && <motion.div
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