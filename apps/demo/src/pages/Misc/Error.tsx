import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import ErrorIcon from '@mui/icons-material/Report';
import History from '@mui/icons-material/History';
import { Title } from 'react-admin';
import { useLocation } from 'react-router-dom';

export const MyError = (props) => {

	const {
		error,
		resetErrorBoundary,
	} = props;

	const { pathname } = useLocation();
	const originalPathname = React.useRef(pathname);

	// Effect that resets the error state whenever the location changes
	useEffect(() => {
		if (pathname !== originalPathname.current) {
			resetErrorBoundary();
		}
	}, [pathname, resetErrorBoundary]);

	return (
		<div>
			<Title title="Error" />
			<h1><ErrorIcon /> Ha ocurrido un error </h1>
			<div>No se ha podido completar su solcitud.</div>
			{JSON.stringify(error)}
			<div>
				<Button
					variant="contained"
					startIcon={<History />}
					onClick={() => history.go(-1)}
				>
                    Back
				</Button>
			</div>
		</div>
	);
};