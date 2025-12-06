import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { LightMode, DarkMode } from '@mui/icons-material';
import { dashStorage } from 'dash-utils';

import {
  DASH_REDUX_ACTIONS,
} from 'dash-admin-state';
import { Avatar, useColorScheme } from '@mui/material';
import { DashThemeHelperProvider } from '../../default-theme';

const DarkToggleMode = () => {
  const { mode, setMode } = useColorScheme();
  const dispatch = useDispatch();

  // Determine display mode - fallback to stored theme or 'dark' if MUI returns undefined/system
  const effectiveMode = (mode === 'light' || mode === 'dark') ? mode : (dashStorage.getItem('theme') || 'dark');
  const darkMode = effectiveMode === 'dark';
  
  const onClick = () => {
    const newMode = effectiveMode === 'dark' ? 'light' : 'dark';

    // Update all systems: MUI, Redux, and dashStorage
    setMode(newMode);
    dashStorage.setItem('theme', newMode);
    document.documentElement.setAttribute('data-theme', newMode);
    
    dispatch(DASH_REDUX_ACTIONS.toggleThemeType(newMode));
  };

  // Sync on initial mount if MUI mode doesn't match stored theme
  useEffect(() => {
    const storedTheme = dashStorage.getItem('theme');
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark') && mode !== storedTheme) {
      setMode(storedTheme as 'light' | 'dark');
    }
  }, []);
  
  return (
    <>
     <div className='dash-theme-avatar' onClick={onClick}>
   
     <DashThemeHelperProvider>
      <Avatar 
        sizes='small'
        sx={{ fontSize: '1rem' }}
        style={{
          width: '30px',
          height: '30px',
          minHeight: '30px'
        }}
        className='dash-theme-avatar-icon'
      >
        {darkMode ? <LightMode /> : <DarkMode />}
      </Avatar>
      
      </DashThemeHelperProvider>
    </div>

    
    </>
  );
};

export default DarkToggleMode;