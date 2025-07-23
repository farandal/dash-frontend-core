import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router';
import { Loading, useLogout, useStore } from 'react-admin';
import { ToastContainer } from 'react-toastify';

import useLocalStorage from '../hooks/useLocalStorage';
import { IDASHAppState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { Box, Button } from '@mui/material';
import { AppMenu } from '../components/menu/AppMenu';
import { LaravelEchoProvider } from '../contexts/com/LaravelEchoContext';
//import MenuToggleMode from '../components/menu/DarkToggleMode';

//import GlobalErrorsHandler from '../components/misc/GlobalErrorsHandler';
import { DialogServiceProvider } from 'dash-dialog';

export interface IAppLayout extends React.PropsWithChildren {}

const CustomAppLayout: React.FC<IAppLayout> = (props) => {
	const { children } = props;

	const dispatch = useDispatch();
	const contentRef = useRef(null);

	const [authenticated, setAuthenticated] = useLocalStorage('authenticated');
	const [resourceConfig] = useStore('resourceConfig');
	const navigate = useNavigate();

    /*
	const DASHHeaderActions = () => (
		<div className='dash-header-actions'>
			<Button
				onClick={() => navigate('profile')}
				type='button'
				color='primary'
				className='dash-header-actions-btn hide-sm'
			>
				{'Ver Perfil'}
			</Button>
		</div>
	);
    */

    // @deprecated
    /*
	useEffect(() => {
		dispatch(
			DASH_REDUX_ACTIONS.setHeaderComponents([
				<MenuToggleMode />,
				//<NotificationsWidget key={1} />
				//<DASHUserInfo key={2} />
				//<DASHHeaderActions key={4} />
			]),
		);
	}, []);
    */

	useEffect(() => {
		dispatch(
			DASH_REDUX_ACTIONS.updatePage({
				title: resourceConfig && resourceConfig.label,
				//icon: resourceConfig && resourceConfig.group && GroupIcons[resourceConfig.group],
				subTitle: resourceConfig && resourceConfig.group,
			}),
		);
	}, [resourceConfig]);

	/*const resources:IDashAutoAdminResourceConfig[] = useSelector((state: IDASHAppState) => state.settings.resources);*/

 
	return (
		<>
			<DialogServiceProvider>
				{authenticated ? (
					<LaravelEchoProvider>
						<ToastContainer style={{ width: '520px' }} />
                       
						<Box key={1} ref={contentRef} className={'dash-layout-content'}>
						{children}
						</Box>
						{/*<DASHTheme
							menuComponent={<AppMenu menu={resources} themeType={themeType} />}
							headerToolBar={<></>}
							key={0}
						>
							<Content
								key={1}
								ref={contentRef}
								className={'dash-layout-content dash-app-module'}
							>
								{children}
							</Content>
							<Footer key={2}>
								<div className='dash-layout-footer-content'></div>
							</Footer>
							<GlobalErrorsHandler />
				</DASHTheme>*/}
					</LaravelEchoProvider>
				) : (
					<Box key={1} ref={contentRef} className={'dash-layout-content'}>
						{children}
					</Box>
				)}
			</DialogServiceProvider>
		</>
	);
};

export default CustomAppLayout;
