import React from 'react';
import { useDispatch } from 'react-redux';
import { LightMode, DarkMode } from '@mui/icons-material';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { Avatar } from '@mui/material';
import { useDashThemeContextLight } from '../../dash-extensions/components/DashThemeProviderLight';

const DarkToggleMode = () => {
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

export default DarkToggleMode;