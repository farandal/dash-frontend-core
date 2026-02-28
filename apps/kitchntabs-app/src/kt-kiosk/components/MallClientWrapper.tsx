import React, { lazy, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import MallClientAppResources from '../MallClientAppResources';
//import mallDataProvider from '../../dash/config/DASHMallClientDataProvider';
//import mallClientAuthProvider from '../../dash/config/DASHMallClientAuthProvider';
//import mallClientGlobalRoutes, { mallClientPublicRoutes } from '@app/mallClientGlobalRoutes';
import { NotFound } from 'dash-components';
//import { MallAppMediator } from './MallAppMediator';
//import GlobalTenantWrapper from '@app/dash/core/GlobalTenantWrapper';
//import { DashPrivateApp } from 'dash-app-common';
import { useAxios } from 'dash-axios-hook';
import { useTranslate } from 'react-admin';
//import DASHWSSessionMessagesManager from '@app/dash/managers/DASHWSSessionMessagesManager';
import { dashStorage } from 'dash-utils';
interface ValidationState {
    isValidating: boolean;
    isValid: boolean;
    errorMessage: string;
    errorDetails?: any;
}

interface MallAppWrapperProps {
    appPath?: string;
}

//const DashLazyPublicAdminApp = lazy(() => import('../../DASHLazyAdminApp'));


const MallAppWrapper: React.FC<MallAppWrapperProps> = ({}) => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const axios = useAxios();
    const translate = useTranslate();
    
    const [validationState, setValidationState] = useState<ValidationState>({
        isValidating: true,
        isValid: false,
        errorMessage: '',
        errorDetails: null
    });
    const [tenantData, setTenantData] = useState<any>(null);

    const dynamicAppPath = `/apps/client/${sessionId}`;

    // SessionId localStorage logic
    useEffect(() => {
        if (!sessionId) return;
        const prevSessionId = dashStorage.getItem('mall-session-hash');
        if (prevSessionId !== sessionId) {
            dashStorage.clear();
        }
        dashStorage.setItem('mall-session-hash', sessionId);
    }, [sessionId]);

    // Server validation effect
    useEffect(() => {
        const validateSession = async () => {
            if (!sessionId) {
                setValidationState({
                    isValidating: false,
                    isValid: false,
                    errorMessage: translate('mall.errors.sessionIdRequired', { _: 'Mall sessionId is required' }),
                    errorDetails: null
                });
                return;
            }

            setValidationState(prev => ({ ...prev, isValidating: true }));

            try {
                const { data } = await axios.get(`/public/mall/${sessionId}/getSessionAuth`);
                setTenantData(data);
                setValidationState({
                    isValidating: false,
                    isValid: true,
                    errorMessage: '',
                    errorDetails: null
                });
            } catch (error: any) {
                setTenantData(null);
                
                const status = error.response?.status;
                const responseData = error.response?.data;
                
                let errorMessage = translate('mall.errors.validationDefault', { _: 'An error occurred while validating the session' });
                
                switch (status) {
                    case 410:
                        errorMessage = responseData?.message || translate('mall.errors.sessionExpired', { _: 'Session has expired. Sessions are valid for 10 hours from activation.' });
                        break;
                    case 404:
                        errorMessage = translate('mall.errors.sessionNotFound', { _: 'Session not found. Please check the session ID.' });
                        break;
                    case 403:
                        errorMessage = translate('mall.errors.accessDenied', { _: 'Access denied to this session.' });
                        break;
                    case 500:
                        errorMessage = translate('mall.errors.serverError', { _: 'Server error occurred. Please try again later.' });
                        break;
                    default:
                        errorMessage = responseData?.message || translate('mall.errors.unableToValidate', { _: 'Unable to validate session. Please try again.' });
                }

                setValidationState({
                    isValidating: false,
                    isValid: false,
                    errorMessage,
                    errorDetails: responseData
                });
            }
        };

        validateSession();
    }, [sessionId]);

    // Show loading state during validation
    if (validationState.isValidating) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Handle validation errors
    if (!validationState.isValid) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Box sx={{ maxWidth: 400, width: '100%', p: 2 }}>
                    <NotFound
                        disableCountdown={true}
                        disableGoBack={false}
                        customMessage={validationState.errorMessage}
                    />
                </Box>
            </Box>
        );
    }

    // Render the main app, all tenant data logic is handled by GlobalTenantWrapper
   return <>TODO: Check refactoring</>
   /* return (
        <DashPrivateApp
            resources={MallClientAppResources}
            appPath={dynamicAppPath}
            useOwnRouter={false}
            customDataProvider={mallDataProvider}
            customAuthProvider={mallClientAuthProvider}
            customPublicRoutes={mallClientPublicRoutes}
            GlobalHook={() => <GlobalTenantWrapper tenantData={tenantData} />}
            wsMessagesManager={DASHWSSessionMessagesManager}
        >
            <MallAppMediator />
        </DashPrivateApp>
    );*/
};



export default MallAppWrapper;
