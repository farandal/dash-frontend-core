import { PropsWithChildren } from "react";
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

    //let method = DASHAdminSystemConstants.system.PAGE_TRANSITIONS ? "wait" : "sync";
    //let transitionEnabled = DASHAdminSystemConstants.system.PAGE_TRANSITIONS;
    let method = "wait";
    let transitionEnabled = true;
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(parseInt(lastPart))) { method = 'sync'; }
    // WORK IN PROGRESS, It works, but when editing forms is can be annoying for the user moving around tabs.
    return transitionEnabled ? <AnimatePresence

        mode={method as "wait" | "sync" | "popLayout"}
        onExitComplete={() => {
            // This ensures animations complete properly
        }}

    >
        <Routes location={location} key={location.pathname}>
            <Route
                element={
                    <MotionWrapper
                        pageTransition={false}
                        loadingSpinner={true}
                        transitionDuration={0.5}
                    />
                }
            >
                {children}
            </Route>
        </Routes>
    </AnimatePresence> : <Routes location={location} key={location.pathname}>{children}</Routes>;
}
export default RoutingWrapper;