import { JSX, PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import AppSidebarMaterial from './menu/AppSidebarMaterial';
import React from 'react';

export interface IDomainTheme<U = any, A = any> extends PropsWithChildren {
    menuComponent?: JSX.Element;
    headerToolBar?: JSX.Element;
    footerComponent?: JSX.Element;
}


// Memoized content wrapper to prevent children re-renders
const MemoizedContent = ({ children }: { children: React.ReactNode }) => (
    <Box className="dash-layout-content">
        {children}
    </Box>
);

// Memoized footer wrapper
const MemoizedFooter = React.memo(({ footerComponent }: { footerComponent?: JSX.Element }) => {
    if (!footerComponent) return null;
    
    return (
        <Box className="dash-app-layout-footer">
            {footerComponent}
        </Box>
    );
});

const DomainTheme = <U, A>({
    children,
    menuComponent,
    headerToolBar,
    footerComponent,
    ...props
}: IDomainTheme<U, A>): JSX.Element => {

    return (
        <div id={'dash-app-layout'} className={'dash-app-layout'}>
            {menuComponent === undefined ? (
                <AppSidebarMaterial 
                    className={'dash-app-layout-sidebar'}
                />
            ) : menuComponent}
            <Box
                className={'dash-app-layout-content'}
            >
                {headerToolBar}
                <MemoizedContent>
                    {children}
                </MemoizedContent>
                {footerComponent && <MemoizedFooter footerComponent={footerComponent} />}
            </Box>
        </div>
    );
};

export default DomainTheme;
