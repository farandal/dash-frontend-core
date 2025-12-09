/**
 * MallClientWrapper
 * 
 * App-specific wrapper for Mall client (public ordering) functionality.
 * This component handles session validation and tenant data fetching,
 * then renders the private app with mall-client-specific configuration.
 */
import React, { lazy, useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { NotFound } from 'dash-components';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';

// Import mall-client-specific configs from local dash-extensions
import DASHMallClientDataProvider from '../../dash-extensions/config/DASHMallClientDataProvider';
import DASHMallClientAuthProvider from '../../dash-extensions/config/DASHMallClientAuthProvider';
import GlobalTenantWrapper from '../../dash-extensions/core/GlobalTenantWrapper';

// Import mall session WebSocket context
import { MallSessionEchoProvider } from '../../contexts/MallSessionEchoContext';

// Import mall resources from kt-mall
import { MallClientAppResources, MallAppMediator } from 'kt-mall';

// Lazy load the private app
const KitchnTabsPrivateApp = lazy(() => import('../../core/KitchnTabsPrivateApp'));

interface ValidationState {
    isValidating: boolean;
    isValid: boolean;
    errorMessage: string;
    errorDetails?: any;
}

interface MallClientWrapperProps {
    appPath?: string;
}

// Mall client app routes (for public ordering)
const mallClientPublicRoutes = () => [];

// Simple translation helper since we're outside React-Admin context
const getErrorMessage = (key: string, defaultMessage: string) => defaultMessage;

const MallClientWrapper: React.FC<MallClientWrapperProps> = () => {
    const { sessionId, mallSlug } = useParams<{ sessionId: string; mallSlug: string }>();
    const location = useLocation();
    const axios = useAxios();
    
    // Use ref to prevent re-validation on axios instance change
    const hasValidatedRef = useRef(false);
    const validationInProgressRef = useRef(false);
    
    const [validationState, setValidationState] = useState<ValidationState>({
        isValidating: true,
        isValid: false,
        errorMessage: '',
        errorDetails: null
    });
    const [tenantData, setTenantData] = useState<any>(null);

    // Calculate the app path based on the actual URL structure
    // This ensures React-Admin's basename matches the actual URL
    const dynamicAppPath = useMemo(() => {
        // Use the actual path up to and including the sessionId
        // e.g., /malltest/s/GWN4F -> /malltest/s/GWN4F
        if (mallSlug && sessionId) {
            return `/${mallSlug}/s/${sessionId}`;
        }
        // Fallback to parsing from location
        const pathMatch = location.pathname.match(/^\/([^/]+)\/s\/([^/]+)/);
        if (pathMatch) {
            return `/${pathMatch[1]}/s/${pathMatch[2]}`;
        }
        return `/s/${sessionId}`;
    }, [mallSlug, sessionId, location.pathname]);

    // SessionId localStorage logic - clear storage if session changes
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
        // Prevent multiple validations
        if (hasValidatedRef.current || validationInProgressRef.current) {
            return;
        }

        const validateSession = async () => {
            if (!sessionId) {
                setValidationState({
                    isValidating: false,
                    isValid: false,
                    errorMessage: getErrorMessage('mall.errors.sessionIdRequired', 'Mall sessionId is required'),
                    errorDetails: null
                });
                return;
            }

            validationInProgressRef.current = true;

            try {
                const { data } = await axios.get(`/public/mall/${sessionId}/getSessionAuth`);
                setTenantData(data);
                setValidationState({
                    isValidating: false,
                    isValid: true,
                    errorMessage: '',
                    errorDetails: null
                });
                hasValidatedRef.current = true;
                console.log('✅ MallClientWrapper: Session validated successfully:', sessionId);
            } catch (error: any) {
                setTenantData(null);
                
                const status = error.response?.status;
                const responseData = error.response?.data;
                
                let errorMessage = getErrorMessage('mall.errors.validationDefault', 'An error occurred while validating the session');
                
                switch (status) {
                    case 410:
                        errorMessage = responseData?.message || getErrorMessage('mall.errors.sessionExpired', 'Session has expired. Sessions are valid for 10 hours from activation.');
                        break;
                    case 404:
                        errorMessage = getErrorMessage('mall.errors.sessionNotFound', 'Session not found. Please check the session ID.');
                        break;
                    case 403:
                        errorMessage = getErrorMessage('mall.errors.accessDenied', 'Access denied to this session.');
                        break;
                    case 500:
                        errorMessage = getErrorMessage('mall.errors.serverError', 'Server error occurred. Please try again later.');
                        break;
                    default:
                        errorMessage = responseData?.message || getErrorMessage('mall.errors.unableToValidate', 'Unable to validate session. Please try again.');
                }

                console.error('❌ MallClientWrapper: Session validation failed:', errorMessage);
                setValidationState({
                    isValidating: false,
                    isValid: false,
                    errorMessage,
                    errorDetails: responseData
                });
                hasValidatedRef.current = true;
            } finally {
                validationInProgressRef.current = false;
            }
        };

        validateSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Show loading state during validation
    if (validationState.isValidating) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Box sx={{ 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <CircularProgress size={50} />
                    <Typography variant="body2" color="text.secondary">
                        Validating session...
                    </Typography>
                </Box>
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
                    
                    {/* Show expiration details if available */}
                    {validationState.errorDetails?.expired_at && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Session expired at: {new Date(validationState.errorDetails.expired_at).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    // Render the main app - all tenant data logic is handled by GlobalTenantWrapper
    // Wrap with MallSessionEchoProvider for WebSocket notifications
    return (
        <MallSessionEchoProvider sessionId={sessionId}>
            <React.Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            }>
                <KitchnTabsPrivateApp
                    customResources={MallClientAppResources}
                    appPath={dynamicAppPath}
                    useOwnRouter={false}
                    customDataProvider={DASHMallClientDataProvider}
                    customAuthProvider={DASHMallClientAuthProvider}
                    customPublicRoutes={mallClientPublicRoutes}
                    GlobalHook={() => <GlobalTenantWrapper tenantData={tenantData} />}
                >
                    <MallAppMediator />
                </KitchnTabsPrivateApp>
            </React.Suspense>
        </MallSessionEchoProvider>
    );
};

export default MallClientWrapper;
