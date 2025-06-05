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
        {darkMode ? <DarkMode /> : <LightMode />}
      </Avatar>
    </div>
  );
};

export default DarkModeSwitcher;