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
    const { i18nProvider } = useI18nBridge();
    const [currentLocale, setLocale] = useLocaleState();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLocaleChange = useCallback(async (locale: string) => {
        console.log('🌐 BridgedLocalesMenuButton: Changing locale to:', locale);
        
        // Persist locale to localStorage for persistence across page reloads
        try {
            localStorage.setItem('dash-user-locale', locale);
            console.log('🌐 BridgedLocalesMenuButton: Persisted locale to localStorage:', locale);
        } catch (e) {
            console.warn('🌐 BridgedLocalesMenuButton: Failed to persist locale to localStorage:', e);
        }
        
        // Use bridged provider to change locale
        if (i18nProvider?.changeLocale) {
            await i18nProvider.changeLocale(locale);
        }
        
        // Also update React Admin's locale state
        setLocale(locale);
        
        handleClose();
    }, [i18nProvider, setLocale, handleClose]);

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
                        color="inherit"
                        size="small"
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
                MenuListProps={{
                    'aria-labelledby': 'locale-button',
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
