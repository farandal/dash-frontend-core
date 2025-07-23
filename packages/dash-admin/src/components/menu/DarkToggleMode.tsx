import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LightMode, DarkMode } from '@mui/icons-material';

import {
  IDASHAppState,
  DASH_REDUX_ACTIONS,
  DASH_THEME_SETTINGS
} from 'dash-admin-state';
import { IconMenuItem } from 'mui-nested-menu';
import { Avatar, useColorScheme } from '@mui/material';
import { DashThemeHelperProvider } from 'dash-default-theme';

const DarkToggleMode = () => {

  const { mode, setMode } = useColorScheme();

  /*const dashMode: "light" | "dark" = useSelector((state: IDASHAppState<any, any, any>) =>
    state.settings.themeType
  );*/
  const darkMode = mode === "dark";
  const dispatch = useDispatch();
  
  const onClick = () => {
  const newMode = mode === "dark" 
          ? "light" 
          : "dark";

    dispatch(
      DASH_REDUX_ACTIONS.toggleThemeType(newMode),
    );

    setMode(newMode);
  };
  
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