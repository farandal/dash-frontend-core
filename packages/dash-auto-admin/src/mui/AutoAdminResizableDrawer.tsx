import { Drawer, DrawerProps } from '@mui/material';
import React from 'react';

export interface IResizableDrawer extends DrawerProps {
	defaultWidth: number;
}

export const AutoAdminResizableDrawerContext = React.createContext(400);

/* TODO: W.I.P Resizable Drawer is a Work in Progress */
export const AutoAdminResizableDrawer: React.FC<IResizableDrawer> = ({
	children,
	defaultWidth,
	...props
}) => {
	//const classes = useStyles();
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
	const [drawerWidth, setDrawerWidth] = React.useState(defaultWidth);

	/*

	const handleMouseMove = useCallback((e) => {
		console.log('Mouse move');
		//const newWidth = e.clientX - (window.innerWidth - document.body.offsetLeft - document.body.offsetWidth  );
		//const newWidth = e.clientX + (window.innerWidth - document.body.offsetLeft - document.body.offsetWidth  );
		const newWidth = window.innerWidth - e.clientX;
		//if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
		setDrawerWidth(newWidth);
		//}
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
		e.cancelBubble = true;
		e.returnValue = false;
	}, []);

	const handleMouseUp = () => {
		console.log('Mouse up');
		document.removeEventListener('mouseup', handleMouseUp, true);
		document.removeEventListener('mousemove', handleMouseMove, true);
	};
	
	const handleMouseDown = (e) => {
		console.log('Mouse down');
		document.addEventListener('mouseup', handleMouseUp, true);
		document.addEventListener('mousemove', handleMouseMove, true);
	};
 	*/

	const Dragger = () => {
		// TODO:
		// 	<div onMouseDown={(e) => handleMouseDown(e) }  />
		return <></>;
	};

	return (
		<Drawer
			/*className={classes.drawer}*/
			PaperProps={{ style: { width: drawerWidth } }}
			//sx={{ zIndex: 100, width: drawerWidth }}
			{...props}
		>
			<AutoAdminResizableDrawerContext.Provider value={drawerWidth}>
				<Dragger />

				{children}
			</AutoAdminResizableDrawerContext.Provider>
		</Drawer>
	);
};
