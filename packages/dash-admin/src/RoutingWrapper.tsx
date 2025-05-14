import { PropsWithChildren, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import DASHAdminSystemConstants from "./config/DASHAdminSystemConstants";
import { AnimatePresence } from "framer-motion";
import MotionWrapper from "./layout/MotionWrapper";

/**
 * Interface for the DASH Routing Wrapper component
 * @interface IDASHRoutingWrapper
 * @extends {PropsWithChildren}
 * @property {any} [Wrapper] - Optional wrapper component to wrap around children
 * @property {any} [BrowserRouterComponent] - Optional custom router component to replace default BrowserRouter
 */
export interface IDASHRoutingWrapper extends PropsWithChildren{
   Wrapper?:any
   BrowserRouterComponent?:any
}

/**
 * A wrapper component that provides routing functionality
 * @param {IDASHRoutingWrapper['Wrapper']} Wrapper - Custom Wrapper component to wrap around routes
 * @param {IDASHRoutingWrapper['BrowserRouterComponent']} BrowserRouterComponent - Browser Router Component, such as BrowserRouter.
 * @returns {JSX.Element} Rendered component
 */
const RoutingWrapper: React.FC<IDASHRoutingWrapper> = ({Wrapper,BrowserRouterComponent, children }) => {

    const RouterComponent = BrowserRouterComponent ? BrowserRouterComponent : BrowserRouter;

    return <RouterComponent>
        {Wrapper ? <Wrapper>
            {children}
        </Wrapper>: children}
        </RouterComponent>
};

export const AnimatedRoutesWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    let method = "wait";
    let transitionEnabled = true;
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const [show, setShow] = useState(false);

    if (!isNaN(parseInt(lastPart))) { method = 'sync'; }

    useEffect(() => {
        // Set show to true when location changes
        setShow(true);
        
        // Clean up animation when component unmounts
        return () => {
            setShow(false);
        };
    }, [location.pathname]);

    return transitionEnabled ? (
        <AnimatePresence
            mode={method as "wait" | "sync" | "popLayout"}
            onExitComplete={() => {
                console.log('AnimatedRoutesWrapper onExitComplete');
                // Don't set show to false immediately - let MotionWrapper handle this
            }}
        >
            <Routes location={location} key={location.pathname}>
                <Route
                    element={
                        <MotionWrapper
                            pageTransition={true}
                            loadingSpinner={true}
                            transitionDuration={0.5}
                            initialShow={show}
                            maxTimeOut={8000} // Match this with your animation needs
                        />
                    }
                >
                    {children}
                </Route>
            </Routes>
        </AnimatePresence>
    ) : (
        <Routes location={location} key={location.pathname}>{children}</Routes>
    );
}

export default RoutingWrapper;