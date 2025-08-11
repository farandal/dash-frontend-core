import { PropsWithChildren, useEffect, useState, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import { AnimatePresence } from "framer-motion";
import MotionWrapper from "./layout/MotionWrapper";

/**
 * Interface for the DASH Routing Wrapper component
 * @interface IDASHRoutingWrapper
 * @extends {PropsWithChildren}
 * @property {any} [Wrapper] - Optional wrapper component to wrap around children
 * @property {any} [BrowserRouterComponent] - Optional custom router component to replace default BrowserRouter
 * @property {any} [LayoutComponent] - Optional layout component to wrap around the routing system
 * @property {boolean} [wrapLayout] - Whether to wrap the layout around the entire routing system
 */
export interface IDASHRoutingWrapper extends PropsWithChildren{
   Wrapper?:any
   BrowserRouterComponent?:any
   LayoutComponent?:any
   wrapLayout?: boolean
}

/**
 * A wrapper component that provides routing functionality
 * @param {IDASHRoutingWrapper['Wrapper']} Wrapper - Custom Wrapper component to wrap around routes
 * @param {IDASHRoutingWrapper['BrowserRouterComponent']} BrowserRouterComponent - Browser Router Component, such as BrowserRouter.
 * @param {IDASHRoutingWrapper['LayoutComponent']} LayoutComponent - Layout component to wrap around routing system
 * @returns {JSX.Element} Rendered component
 */
const RoutingWrapper: React.FC<IDASHRoutingWrapper> = ({
    Wrapper,
    BrowserRouterComponent, 
    LayoutComponent,
    children 
}) => {

    const RouterComponent = BrowserRouterComponent ? BrowserRouterComponent : BrowserRouter;

    // If wrapLayout is true, wrap the layout around the entire routing system
    if (LayoutComponent) {
        return (
            <RouterComponent>
                
                <LayoutComponent>
                    {Wrapper ? (
                        <Wrapper>
                            {children}
                        </Wrapper>
                    ) : (
                        children
                    )}
                </LayoutComponent>
            </RouterComponent>
        );
    }

    // Default behavior - layout is handled by react-admin
    return (
        <RouterComponent>
            
            {Wrapper ? (
                <Wrapper>
                    {children}
                </Wrapper>
            ) : (
                children
            )}
        </RouterComponent>
    );
};

export const AnimatedRoutesWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    let method = "wait";
    let transitionEnabled = true;
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const [show, setShow] = useState(true); // Initialize as true
    const isMountedRef = useRef(true);

    if (!isNaN(parseInt(lastPart))) { method = 'sync'; }

    useEffect(() => {
        // Only update if component is still mounted
        if (isMountedRef.current) {
            setShow(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        // Set mounted ref to true on mount
        isMountedRef.current = true;
        
        // Cleanup only on actual unmount
        return () => {
            isMountedRef.current = false;
        };
    }, []); // Empty dependency array - only runs on mount/unmount

    return transitionEnabled ? (
        <AnimatePresence
            mode={method as "wait" | "sync" | "popLayout"}
            
            onExitComplete={() => {
              
            
                
                // Only set show to false if component is still mounted
                if (isMountedRef.current) {
                    setShow(false);
                }
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
                            usePortalForBackground={true}
                            portalTarget={".dash-app-layout-content"}
                            usePortalForSpinner={true}
                           spinnerPortalTarget={"body"}
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
