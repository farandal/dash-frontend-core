import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LightMode, DarkMode } from '@mui/icons-material';

import {
  IDASHAppState,
  DASH_REDUX_ACTIONS,
  DASH_THEME_SETTINGS
} from 'dash-admin-state';
import { IconMenuItem } from 'mui-nested-menu';

const DarkToggleMode = () => {
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
    <IconMenuItem 
      onClick={onClick}
      leftIcon={darkMode ? <LightMode /> : <DarkMode />}
      label={darkMode ? 'Light Mode' : 'Dark Mode'}
      className='dash-theme-toggle'
    />
  );
};

export default DarkToggleMode;