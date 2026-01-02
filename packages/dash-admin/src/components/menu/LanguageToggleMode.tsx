import React, { useEffect, useState } from 'react';
import { useSetLocale, useLocaleState } from 'react-admin';
import { Language } from '@mui/icons-material';
import { dashStorage } from 'dash-utils';
import { Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { DashThemeHelperProvider } from '../../default-theme';

interface LocaleOption {
  locale: string;
  languageId: string;
  name: string;
  icon: string;
}

const LanguageToggleMode = () => {
  const locale = useLocaleState();
  const setLocale = useSetLocale();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Available locales from main.tsx configuration
  const availableLocales: LocaleOption[] = [
    {
      locale: 'en',
      languageId: 'english',
      name: 'English',
      icon: '🇺🇸',
    },
    {
      locale: 'es',
      languageId: 'spanish',
      name: 'Español',
      icon: '🇪🇸',
    },
  ];

  const currentLocale = availableLocales.find(l => l.locale === locale) || availableLocales[1]; // Default to Spanish

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocaleChange = (newLocale: string) => {
    // Update react-admin locale
    setLocale(newLocale);
    
    // Store in dashStorage for persistence
    dashStorage.setItem('locale', newLocale);
    
    // Close menu
    handleClose();
    
    console.log('Language changed to:', newLocale);
  };

  // Sync on initial mount if stored locale exists
  useEffect(() => {
    const storedLocale = dashStorage.getItem('locale');
    if (storedLocale && storedLocale !== locale) {
      setLocale(storedLocale);
    }
  }, []);

  return (
    <>
      <div className='dash-language-avatar' onClick={handleClick}>
        <DashThemeHelperProvider>
          <Avatar 
            sizes='small'
            sx={{ fontSize: '1rem', cursor: 'pointer' }}
            style={{
              width: '30px',
              height: '30px',
              minHeight: '30px'
            }}
            className='dash-language-avatar-icon'
          >
            <span style={{ fontSize: '1.2rem' }}>{currentLocale.icon}</span>
          </Avatar>
        </DashThemeHelperProvider>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {availableLocales.map((localeOption) => (
          <MenuItem
            key={localeOption.locale}
            onClick={() => handleLocaleChange(localeOption.locale)}
            selected={localeOption.locale === locale}
          >
            <ListItemIcon>
              <span style={{ fontSize: '1.5rem' }}>{localeOption.icon}</span>
            </ListItemIcon>
            <ListItemText>{localeOption.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageToggleMode;
