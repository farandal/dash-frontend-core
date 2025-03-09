import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router';
import { useStore } from 'react-admin';
import { ToastContainer } from 'react-toastify';

import { Box } from '@mui/material';

import useLocalStorage from 'dash-admin/src/hooks/useLocalStorage';
import { IAppLayout } from 'dash-admin/src/layout/AppLayout';
import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import GlobalErrorsHandler from 'dash-admin/src/components/misc/GlobalErrorsHandler';

import DASHAppConstants from 'dash-constants';

import DomainTheme from './DomainTheme';
import DomainHeader from './DomainHeader';

import { CacheInvalidatorContextProvider } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, Redirect, WSMessagesManager } from 'dash-admin';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

export interface IDomainAppLayout<U = any, A = any> extends IAppLayout {
    themeComponent?: React.JSX.Element;
}

const DomainAppLayout = <U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {

    const { themeComponent, children } = props;
    
	const dispatch = useDispatch();
	const contentRef = useRef(null);
	const [authenticated, _] = useLocalStorage('authenticated');
	const [resourceConfig] = useStore('resourceConfig');
	const navigate = useNavigate();

    const groupIcons = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.settings.groupIcons,
    );

	useEffect(() => {
		dispatch(
			DASH_REDUX_ACTIONS.updatePage({
				title: resourceConfig && resourceConfig.label,
				icon:
					resourceConfig &&
					resourceConfig.group &&
					groupIcons[resourceConfig.group],
				subTitle: resourceConfig && resourceConfig.group,
			}),
		);
	}, [resourceConfig]);

	return authenticated ? (	
	
		<DialogServiceProvider
			component={DASHModal}
			componentProps={{ sound: DASHAppConstants.system.UI_SOUNDS }}
		>
			<LaravelEchoProvider manager={WSMessagesManager}>
			<CacheInvalidatorContextProvider>
				<CacheInvalidatorListenerComponent/>
				<ToastContainer style={{ width: '520px' }} />

				{themeComponent ? (
					themeComponent
				) : (
					<DomainTheme
						headerComponent={
							<DomainHeader/>
						}
						key={0}
					>
						<Box key={1} ref={contentRef} className={'dash-layout-content'}>
							{children}
						</Box>
						<Box key={2} sx={{ mb: 3 }}>
							<div className='dash-layout-footer-content'></div>
						</Box>
						<GlobalErrorsHandler />
					</DomainTheme>
				)}
				</CacheInvalidatorContextProvider>
			</LaravelEchoProvider>
		</DialogServiceProvider>
	
	) : (
		<DialogServiceProvider component={DASHModal}>
			<Box key={1} ref={contentRef} className={'dash-layout-content'}>
				<Redirect path={'/login'} timer={10} />
				{children}
			</Box>
		</DialogServiceProvider>
	);
};

export default DomainAppLayout;