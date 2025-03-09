import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import { IDASHAppState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch, useSelector } from 'react-redux';

import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

import { useState } from 'react';

import { useWindowSize } from 'dash-admin';
import AppMaterialMenu from './AppMaterialMenu';


const drawerWidth = 256;
const drawerWidthMobile = 60;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: 'hidden',
	width: drawerWidthMobile,
	[theme.breakpoints.up('sm')]: {
		width: drawerWidthMobile,
	},
});

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
	width: drawerWidth,
	...(open && {
		...openedMixin(theme),
		'& .MuiDrawer-paper': openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		'& .MuiDrawer-paper': closedMixin(theme),
	}),
}));

const AppSidebarMaterial = (props) => {

    const { logo, logoSmall } = props;

	const { navExpanded } = useSelector(
		(state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
			state.common,	);

	const dispatch = useDispatch();


	const windowSize = useWindowSize();


	const toggleDrawer = () => {
		//setShowDrawer(value => !value);
		dispatch(DASH_REDUX_ACTIONS.toggleExpandedSideNav(!navExpanded));
	};

	const [navSize,setNavSize] = useState<"large" | "small">(windowSize.width < 769 ? "small" : "large");
	React.useEffect(() => {
		setNavSize(windowSize.width < 769 ? "small" : "large");
		if(windowSize.width < 769) {
			dispatch(DASH_REDUX_ACTIONS.toggleExpandedSideNav(false));
		
		}
		if(windowSize.width > 1024) {
			dispatch(DASH_REDUX_ACTIONS.toggleExpandedSideNav(true));
		}
       

	},[windowSize])



	return (
		<Box sx={{ display: 'flex' }}>
		
			<Drawer
				variant='permanent'
				open={navExpanded}
				className={'sidebar-drawer ' + (navExpanded ? 'expanded' : 'collapsed')+ ' '+(navSize)}
			>
				<div className='sidebar-header'>
		
					<div className={'sidebar-logo'}>
						{navExpanded && navSize === "large" ? 
							logo
						 : 
							logoSmall
						}
					</div>
					<IconButton onClick={toggleDrawer} >
						{navExpanded ? (
							<KeyboardDoubleArrowLeftIcon />
						) : (
							<KeyboardDoubleArrowRightIcon />
						)}
					</IconButton>
				</div>
				<AppMaterialMenu navSize={navSize} />
			</Drawer>
		</Box>
	);
};


export default React.memo(
	AppSidebarMaterial,
	(props, nextProps) =>
		props === nextProps
) as typeof AppSidebarMaterial;

//export default AppSidebarMaterial;
