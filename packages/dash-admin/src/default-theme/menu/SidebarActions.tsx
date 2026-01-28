import * as React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import AvatarComponent from '../../components/user/AvatarComponent';
import BridgedLocalesMenuButton from '../../components/i18n/BridgedLocalesMenuButton';
import DarkToggleMode from '../../components/menu/DarkToggleMode';
import { useAuthContext } from '../../contexts/auth/AuthContext';
import { SidebarPosition } from './AppSidebarMaterial';
import LangSwitcher from '../../components/i18n/LangSwitcher';

export interface SidebarActionsProps {
    sidebarPosition?: SidebarPosition;
    navExpanded?: boolean;
}

/**
 * Reusable component for sidebar actions: Avatar, Locale Selector, Dark Mode Toggle, and HeaderToolBar
 * Renders horizontally for top/bottom sidebar positions, vertically for left/right
 * 
 * When headerToolBarReplace is true in Redux state, ONLY renders the HeaderToolBar component,
 * replacing the default actions (Avatar, Locale, DarkMode toggle).
 */
const SidebarActions: React.FC<SidebarActionsProps> = ({ 
    sidebarPosition = "left", 
    navExpanded = true 
}) => {
    const authContext = useAuthContext();
    const isHorizontal = sidebarPosition === "top" || sidebarPosition === "bottom";

    // Get HeaderToolBar and headerToolBarReplace from Redux
    const HeaderToolBar = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
            state.common.headerToolBar,
    );
    const headerToolBarReplace = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
            state.common.headerToolBarReplace,
    );

    return (
        <Box
            className="sidebar-actions"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                //flexDirection: isHorizontal ? 'row' : (navExpanded ? 'column-reverse' : 'column'),
                
                ...(isHorizontal ? {
                    marginLeft: 'auto',
                    flexShrink: 0,
                    paddingRight: 2,
                    flexDirection: navExpanded ? 'row-reverse' : 'row'
                }:
                {
                   
                    flexShrink: 0,
                    flexDirection: navExpanded ? 'column' : 'column'
                }
                ),
            }}
        >
              {authContext?.authenticated && authContext.user?.id !== 'guest' && (
                        <AvatarComponent sidebarPosition={sidebarPosition} />
                    )}    

            {HeaderToolBar && headerToolBarReplace ? (
                // Replace mode: Only render the custom HeaderToolBar
                <HeaderToolBar />
            ) : (
                // Default mode: Render all actions
                <>            
                    {HeaderToolBar && <HeaderToolBar />}
                    {authContext?.authenticated ? <BridgedLocalesMenuButton /> :  <LangSwitcher />}
                    <DarkToggleMode />
                </>
            )}
        </Box>
    );
};

export default SidebarActions;
