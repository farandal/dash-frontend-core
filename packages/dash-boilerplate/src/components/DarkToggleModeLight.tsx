/**
 * DarkToggleModeLight
 *
 * Light/dark mode toggle for apps using DashThemeProviderLight (the
 * lightweight, non-react-admin theme context — see theme/DashThemeProviderLight.tsx).
 * Drives the toggle directly off useDashThemeContextLight()'s setMode(), which
 * actually updates data-theme/localStorage/CSS vars in this context.
 *
 * Consolidated 2026-08-03 from four byte-identical app-level copies
 * (kitchntabs-app, kitchntabs-web, vanexa-app, vanexa-web — the "Cluster A"
 * pattern). Two other apps (kitchntabs-system, vanexa-system) had a second,
 * different copy that instead mirrored dash-admin's DarkToggleMode
 * (MUI's useColorScheme()) — that hook is a no-op in this theme context (it
 * lacks colorSchemes), so that version only worked via a redundant manual
 * data-theme attribute set in the same click handler. This version is the
 * one to use for any app on DashThemeProviderLight; dash-admin's
 * DarkToggleMode remains correct for its own context (the full admin
 * appTheme(), which does have real colorSchemes).
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { LightMode, DarkMode } from '@mui/icons-material';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { Avatar } from '@mui/material';
import { useDashThemeContextLight } from '../theme/DashThemeProviderLight';

export const DarkToggleModeLight: React.FC = () => {
    const { currentMode, setMode } = useDashThemeContextLight();
    const dispatch = useDispatch();

    const darkMode = currentMode === 'dark';

    const onClick = () => {
        const newMode = darkMode ? 'light' : 'dark';

        // Update theme provider state (handles storage and data-theme attr)
        setMode(newMode);

        // Sync with Redux state
        dispatch(DASH_REDUX_ACTIONS.toggleThemeType(newMode));
    };

    return (
        <div onClick={onClick}>
            <Avatar
                sizes='small'
                sx={{ fontSize: '1rem' }}
                style={{
                    width: '30px',
                    height: '30px',
                    minHeight: '30px',
                    cursor: 'pointer'
                }}
                className='dash-icon-button-color dash-icon-button-bg'
            >
                {darkMode ? <LightMode /> : <DarkMode />}
            </Avatar>
        </div>
    );
};

export default DarkToggleModeLight;
