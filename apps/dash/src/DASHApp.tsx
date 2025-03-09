import React, { lazy, PropsWithChildren, useEffect } from 'react';
import {
	BrowserRouter,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';

//const DASHAdmin = lazy(() => import('dash-admin').then(module => ({ default: module.DASHAdmin })));
//const MotionWrapper = lazy(() => import('dash-admin').then(module => ({ default: module.MotionWrapper })));

import {DASHAdmin,DASHAdminSystemConstants,MotionWrapper } from 'dash-admin';

import {
	ICommonState,
	ISettingsState,
	IDASHAppState,
    defaultAuth,
    defaultCommon,
    defaultPageSettings,
    defaultFormState,
    defaultSettings
} from 'dash-admin-state';

import { AnimatePresence } from 'framer-motion';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

import { Notification } from 'react-admin';

import { dashTheme, dashThemeConfig } from 'dash-styles';
import { ThemeProvider } from '@mui/material';
/* MUI Theme to extend react-admin */


/* custom App Layout, the wrapper for all resources */
import { DomainAppLayout } from 'dash-default-theme';

/* Logo */
import LogoSmall from './assets/logo-small.png';
import Logo from './assets/logo.png';
import LoginBackground from './assets/login-back.png';

import initialResources from './DASHResources';

import { QueryClient } from '@tanstack/react-query';
import DASHDataProvider from './DASHDataProvider';
import DASHAuthProvider from './DASHAuthProvider';

import DASHLayoutSettings from './DASHLayoutSettings';

import DASHAppConstants, { IDASHAppConstants } from 'dash-constants';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DASHResources from './DASHResources';
import { AuthContextProvider } from 'dash-admin/src/contexts/auth';

import configureStore from 'dash-admin-state/src/redux/store';

// Custom APP
import DASHGroupIcons from './DASHGroupIcons';
import DASHHeaderActions from './components/DashHeaderActions';

export interface IDomainUser {}
export interface IDomainAuth {}

const SystemConstants = {
    ...DASHAdminSystemConstants,
    system: {
        ...DASHAdminSystemConstants.system,
        PAGE_TRANSITIONS: true,
    }
}

/** Default App state settings. */
const defaultAppSettings = (): ISettingsState => ({
    ...defaultSettings,
	loading: false,
	navStyle: DASHLayoutSettings.NAV_STYLE_FIXED,
	layoutType: DASHLayoutSettings.LAYOUT_TYPE_FULL,
	themeType: DASHLayoutSettings.THEME_TYPE_LITE,
    layoutSettings: DASHLayoutSettings,
    groupIcons: DASHGroupIcons,
    themeColor: '',
	isDirectionRTL: false,
	locale: {
		languageId: 'spanish',
		locale: 'es',
		name: 'Español',
		icon: 'es',
	},
	sidebarExpandedWidth: 240,
	sidebarCollapsedWidth: 80,
});

const CustomLogin = lazy(() => import('./pages/Account/CustomLogin'));
const CustomRecoverPassword = lazy(() => import('./pages/Account/CustomRecoverPassword'));
const CustomChangePassword = lazy(() => import('./pages/Account/CustomChangePassword'));
const Register = lazy(() => import('./pages/Account/Register'));
const Legal = lazy(() => import('./pages/Static/Legal'));


// This is a special hack component, to calculate to which page the user has to redirect, according to his main role. 
const CalculateRedirect = lazy(() => import('./DASHRoleRedirect'));

//import { NotFound } from 'dash-components';
const NotFound = lazy(() => import('dash-components').then(module => ({ default: module.NotFound })));

/** Default common state for redux store. */
const LogoComponent = () => <img alt={'logo'} src={Logo} />;
const LogoSmallComponent = () => <img alt={'logo'} src={LogoSmall} />;
const LoginBackgroundComponent = () => <img alt={'logo'} src={LoginBackground} />;

const getDefaultAppCommon = (): ICommonState => ({
    ...defaultCommon,
    navExpanded: true,
    width: window.innerWidth,
    height: window.innerHeight,
    headerComponents: [<DASHHeaderActions key={4} />],
    panelSettings: {
        logo: <LogoComponent />,
        logoSmall:  <LogoSmallComponent />,
        loginBackground: <LoginBackgroundComponent />,
    },
});

const INITIAL_APP_STATE: IDASHAppState<
	IDomainUser,
	IDomainAuth,
	IDashAutoAdminResourceConfig
> = {
    settings: defaultAppSettings(),
    common: getDefaultAppCommon(),
	page: defaultPageSettings,
	auth: defaultAuth,
	resources: {items: DASHResources},
    formData: defaultFormState
};

function RoutesWrapper({ children }) {
	const location = useLocation();
    
    let method = SystemConstants.system.PAGE_TRANSITIONS ? "wait" : "sync";
    let transitionEnabled = SystemConstants.system.PAGE_TRANSITIONS;
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(parseInt(lastPart))) { method = 'sync'; }
    // WORK IN PROGRESS, It works, but when editing forms is can be annoying for the user moving around tabs.
	return transitionEnabled ? <AnimatePresence 
    
    mode={method as "wait" | "sync" | "popLayout"}
    onExitComplete={() => {
        // This ensures animations complete properly
    }}
    
    >
			<Routes location={location} key={location.pathname}>
				<Route
					element={
						<MotionWrapper 
                        pageTransition={true} 
                        loadingSpinner={true}  
                        transitionDuration={0.5}
                         />
					}
				>
					{/*children && React.cloneElement(children, { key: location.pathname })*/}
					{children}
				</Route>
			</Routes>
		</AnimatePresence> : <Routes location={location} key={location.pathname}>{children}</Routes>;
}

/**
 * Wrapper
 * @param props extends PropsWithChildren.
 * @description the App/Wrapper is the main application Wrapper
 * Wraps the application components within a few contexts, and most importantly the React Browser Router (v6)
 * Contexts: 
 * - AuthContextProvider
 * - ThemeProvider
 * - LocalizationProvider / Material Date Picker
 * More contexts could be eventually added here. 
 * @returns JSX.Element
 */
const Wrapper: React.FC<PropsWithChildren> = (props) => {
	const { children } = props;
    
	return (
		<AuthContextProvider>
			<ThemeProvider theme={dashTheme}>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
			
					<BrowserRouter>
						<RoutesWrapper>{children}</RoutesWrapper>
					</BrowserRouter>
					
				</LocalizationProvider>
			</ThemeProvider>
		</AuthContextProvider>
	);
};

// Function to get CSS variables
const getCSSVar = (name: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};



const App: React.FC<any> = () => {

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false, // default: true
			},
		},
		// TODO: Migrate react-query to 4.x at least.
		// @ts-ignore: required to avoid error during development.
		logger: {
			log: (...args) => {
				console.log(args);
			},
			warn: (...args) => {
				console.warn(args);
			},
			error: (...args) => {
				console.error(args);
			},
		},
	});

	const CustomNotification = () => {
		return (
			<Notification
				className='dash-notification'
				autoHideDuration={8000}
				multiLine={true}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			/>
		);
	};

	useEffect(() => {
		localStorage.setItem('socketConnectionState', 'false');
	}, []);

    const store = configureStore(INITIAL_APP_STATE);

	return (
		<Wrapper>
			<Route
				path='/*'
				element={
					<DASHAdmin<IDomainUser, IDomainAuth, IDashAutoAdminResourceConfig, IDASHAppConstants, IDASHAppState<IDomainUser,IDomainAuth,IDashAutoAdminResourceConfig>>
						customDict={DASHAppConstants.dict}
						customReplacements={DASHAppConstants.replacements}
						initialAppConstants={DASHAppConstants}
                        /* @ts-ignore */
						dashAdminState={store}
						customDataProvider={DASHDataProvider}
						customAuthProvider={DASHAuthProvider}
						customQueryClient={queryClient}
						customResources={initialResources} // partial custom resources, appended to the core resources.
						useCoreResources={false} // When true, it will use the default system resources provided by dash-auto-admin to handle user, roles and permissions, if false, the resources are required to be provided in initialResources
						customLayout={DomainAppLayout} // layout component for any resource, Initializes, Dialog Service Provider. Toast Provider, LaravelEchoProvider, Global error handler.
						customLoginPage={CustomLogin} // login comoponent
						customRecoverPassword={<CustomRecoverPassword />} // recover password  comoponent
						customChangePassword={<CustomChangePassword />} // change password  comoponent
						customProfilePage={false} // profile deprecated
						//customProfilePage={<CustomProfile />} // profile comoponent, false to disable.
						customErrorPage={NotFound} // error comoponent
						//customI18nProvider={i18nProvider} // Reemplaza i18nProvider
						/* customThemeConfig específica el tema de material ui */
						customThemeConfig={dashThemeConfig} // custom mui theme config para react-admin
						customNotification={CustomNotification}
						/* Rrutas autenticadas adicionales */
						customAuthRoutes={[
							<Route key={'/'} path='/' element={<CalculateRedirect />} />,
						]}
						/* Rutas adicionales */
						customRoutes={[
							<Route
								key={'/registrarse'}
								path='/registrarse'
								element={<Register />}
							/>,
							<Route key={'/legal'} path='/legal' element={<Legal />} />,
						]}
					/>
				}
			/>
		</Wrapper>
	);
};

export default App;