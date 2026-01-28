import React from 'react';
import { useColorScheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { DASH_REDUX_ACTIONS, DASH_THEME_SETTINGS, IDASHAppState } from 'dash-admin-state';
import {DashThemeHelperProvider} from '../../default-theme';
const DarkModeSwitcher = () => {

const dashThemeType = useSelector((state: IDASHAppState<any, any, any>) =>
        state.settings.themeType
    );

  const { mode, setMode } = useColorScheme();
  const dispatch = useDispatch();
  // Handle the case where mode might be 'system'
  const isDark = mode === 'dark';

  const onClick = () => {
    debugger;
    const newMode = isDark ? 'light' : 'dark';
    setMode(newMode);
    
   /* dispatch(DASH_REDUX_ACTIONS.toggleThemeType(
        isDark
          ? DASH_THEME_SETTINGS.THEME_TYPE_LIGHT
          : DASH_THEME_SETTINGS.THEME_TYPE_DARK,
    ));*/
    

  };

  // Don't render until mode is determined
  if (!mode) {
    return null;
  }

  return (
    <div  onClick={onClick}>
   
     <DashThemeHelperProvider>
      <Avatar 
        sizes='small'
        sx={{ fontSize: '1rem' }}
        style={{
          width: '30px',
          height: '30px',
          minHeight: '30px'
        }}
       className='dash-icon-button-color dash-icon-button-bg'
      >
        {isDark ? <LightMode /> : <DarkMode />}
      </Avatar>
      </DashThemeHelperProvider>
    </div>
  );
};

export default DarkModeSwitcher;


/*
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LightMode, DarkMode } from '@mui/icons-material';
import { Avatar } from '@mui/material';

import {
  IDASHAppState,
  DASH_REDUX_ACTIONS,
  DASH_THEME_SETTINGS
} from 'dash-admin-state';

const DarkModeSwitcher = () => {
  const darkMode: boolean = useSelector((state: IDASHAppState<any, any, any>) =>
    state.settings.themeType === DASH_THEME_SETTINGS.THEME_TYPE_DARK
      ? true
      : false,
  );
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(
      DASH_REDUX_ACTIONS.toggleThemeType(
        darkMode
          ? DASH_THEME_SETTINGS.THEME_TYPE_LIGHT
          : DASH_THEME_SETTINGS.THEME_TYPE_DARK,
      ),
    );
  };

  return (
    <div className='dash-theme-avatar' onClick={onClick}>
     
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
        {darkMode ?  <LightMode />:  <DarkMode /> }
      </Avatar>
    </div>
  );
};

export default DarkModeSwitcher;
*/
