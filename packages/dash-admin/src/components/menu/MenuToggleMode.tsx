import React from 'react';
import { useDispatch, useSelector } from 'react-redux';


import {
	IDASHAppState,
	DASH_REDUX_ACTIONS,
	DASH_THEME_SETTINGS,
} from 'dash-admin-state';
import { Badge } from '@mui/material';

const MenuToggleMode = () => {
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
		<Badge onClick={onClick} badgeContent={4} color='primary'>
			{darkMode ? '*' : ')' }
		</Badge>
	);
};

export default MenuToggleMode;
