/**
 * BridgedLocalesMenuButton
 * 
 * A custom locale menu button that uses the bridged i18nProvider
 * instead of React Admin's context-based provider.
 * 
 * This is necessary because AppMaterialMenu renders outside AdminContext,
 * so it can't access the custom i18nProvider with getLocales().
 */
import React, { useState, useCallback } from 'react';
import { Menu, MenuItem, Button, Tooltip, IconButton } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import LanguageIcon from '@mui/icons-material/Language';
import { useI18nBridge, useBridgedLocales } from '../../contexts/I18nBridgeContext';
import { useLocaleState } from 'react-admin';
import { useDispatch } from 'react-redux';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';

interface BridgedLocalesMenuButtonProps {
    /** Show icon only (compact mode) */
    iconOnly?: boolean;
    /** Custom icon */
    icon?: React.ReactNode;
}

const BridgedLocalesMenuButton: React.FC<BridgedLocalesMenuButtonProps> = ({ 
    iconOnly = true,
    icon = <LanguageIcon />
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const locales = useBridgedLocales();
    const { i18nProvider, locale: currentLocale, setLocale: setBridgedLocale } = useI18nBridge();
    // We still use RA's useLocaleState but only to SET it if needed, 
    // though we should really just use the bridge
    const [, setRALocale] = useLocaleState();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const dispatch = useDispatch(); // Add dispatch
    
    const handleLocaleChange = useCallback(async (locale: string) => {
        console.log('🌐 BridgedLocalesMenuButton: Changing locale to:', locale);
        
        // Use bridged provider to change locale (async)
        // This updates the actual translation provider logic/internal state
        if (i18nProvider?.changeLocale) {
            console.log('🌐 BridgedLocalesMenuButton: Awaiting changeLocale...');
            try {
                await i18nProvider.changeLocale(locale);
                console.log('🌐 BridgedLocalesMenuButton: changeLocale complete.');
            } catch (error) {
                console.error('🌐 BridgedLocalesMenuButton: changeLocale failed:', error);
            }
        }
        
        // Persist locale to localStorage for persistence across page reloads
        try {
            localStorage.setItem('dash-user-locale', locale);
            console.log('🌐 BridgedLocalesMenuButton: Persisted locale to localStorage:', locale);
        } catch (e) {
            console.warn('🌐 BridgedLocalesMenuButton: Failed to persist locale to localStorage:', e);
        }
        
        // UPDATE STATE LAST (after provider is ready)
        // This triggers re-render. Since provider is ready, translations will be correct.
        console.log('🌐 BridgedLocalesMenuButton: Updating state...');
        
        // 1. Update Redux state (Critical for DASHAdmin and ResourceTemplate propagation)
        // We pass the full object if needed, but the reducer seems to handle the payload directly or we might need to check if it expects a string or object.
        // Looking at SettingsReducer: locale: action.payload.
        // Looking at SettingsReducer initial state: locale is an object { languageId, locale, name, icon }.
        // But switchLanguage action just takes 'locale'.
        // If the reducer replaces the WHOLE state.locale object with a string, it might break other things IF they expect an object.
        // Let's check Settting.tsx: dispatch({ type: SWITCH_LANGUAGE, payload: locale });
        // Let's check SettingsReducer: return { ...state, locale: action.payload };
        // If action.payload is a string 'en', then state.settings.locale becomes 'en'.
        // DASHAdmin selectLocale returns state.settings.locale.
        // AsyncResources expects locale (any).
        // It seems DASHAdmin handles it being a string.
        dispatch(DASH_REDUX_ACTIONS.switchLanguage(locale) as any);

        // 2. Update Bridged Context
        setBridgedLocale(locale);
        
        // 3. Update React Admin State
        setRALocale(locale);
        
        handleClose();
    }, [i18nProvider, setBridgedLocale, setRALocale, handleClose, dispatch]);

    // Don't render if no locales available
    if (!locales || locales.length <= 1) {
        console.log('🌐 BridgedLocalesMenuButton: Not rendering - locales:', locales);
        return null;
    }

    console.log('🌐 BridgedLocalesMenuButton: Rendering with locales:', locales, 'current:', currentLocale);

    const open = Boolean(anchorEl);
    const currentLocaleName = locales.find(l => l.locale === currentLocale)?.name || currentLocale;

    return (
        <>
            {iconOnly ? (
                <Tooltip title={`Language: ${currentLocaleName}`}>
                    <IconButton
                        onClick={handleClick}
                        className="dash-icon-button-color dash-icon-button-bg"
                        aria-label="change language"
                        aria-controls={open ? 'locale-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        {icon}
                    </IconButton>
                </Tooltip>
            ) : (
                <Button
                    onClick={handleClick}
                    color="inherit"
                    startIcon={icon}
                    aria-controls={open ? 'locale-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    {currentLocaleName}
                </Button>
            )}
            <Menu
                id="locale-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'locale-button',
                    }
                }}
            >
                {locales.map((localeOption) => (
                    <MenuItem
                        key={localeOption.locale}
                        selected={localeOption.locale === currentLocale}
                        onClick={() => handleLocaleChange(localeOption.locale)}
                    >
                        {localeOption.name || localeOption.locale}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default BridgedLocalesMenuButton;
