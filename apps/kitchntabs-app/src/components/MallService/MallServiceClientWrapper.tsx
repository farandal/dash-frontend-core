/**
 * MallServiceClientWrapper
 * 
 * App-specific wrapper for Mall Service client (public food court ordering) functionality.
 * This component handles session validation and mall tenant data fetching,
 * then renders the private app with mall-service-specific configuration.
 * 
 * ARCHITECTURE NOTE: This component is designed to work as a Higher-Order Component (HoC)
 * that wraps the entire app BEFORE React Router is initialized.
 * 
 * Expected URL patterns:
 * - /mall/:mallSlug/s/:sessionId/* (e.g., /mall/foodcourt/s/DFJNL)
 * - /mall/:sessionId/* (legacy, e.g., /mall/DFJNL)
 */
import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAxios } from 'dash-axios-hook';
import { useDispatch } from 'react-redux';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/redux/reducers/Auth';
import { dashStorage } from 'dash-utils';
import { AuthPersistenceService } from 'dash-auth';
import { MallAppMediator } from '../../kt-kiosk/components';

interface ValidationState {
    isValidating: boolean;
    isValid: boolean;
    errorMessage: string;
    errorDetails?: any;
}

interface MallServiceClientWrapperProps extends React.PropsWithChildren<any> {
    appPath?: string;
}

interface ParsedUrlParams {
    mallSlug: string | null;
    sessionId: string | null;
}

interface ParsedUrlResult extends ParsedUrlParams {
    sessionBasePath: string;
}

/**
 * Parse mall service session parameters directly from window.location
 * 
 * Supported URL patterns:
 * - /mall/:mallSlug/s/:sessionId/* (e.g., /mall/foodcourt/s/DFJNL)
 * - /mall/:sessionId/* (legacy short URL)
 */
const parseUrlParams = (): ParsedUrlResult => {
    const pathname = window.location.pathname;
    
    // Pattern 1: /mall/:mallSlug/s/:sessionId/*
    // Matches /mall/{slug}/s/ followed by 5+ alphanumeric characters
    // Example: /mall/foodcourt/s/ABC12/tab
    const fullUrlMatch = pathname.match(/\/mall\/([^/]+)\/s\/([A-Z0-9]{5,})/i);
    
    if (fullUrlMatch) {
        const mallSlug = fullUrlMatch[1];
        const sessionId = fullUrlMatch[2];
        // Base path ends after the session ID
        const sessionBasePath = `/mall/${mallSlug}/s/${sessionId}`;

        console.log('🔍 MallServiceClientWrapper: Parsed Full URL (mall/slug/s/session):', {
            mallSlug,
            sessionId,
            sessionBasePath
        });

        return {
            mallSlug,
            sessionId,
            sessionBasePath
        };
    }

    // Pattern 2: /mall/:sessionId/* (Short/Legacy)
    // Matches 5+ alphanumeric characters right after /mall/
    const shortUrlMatch = pathname.match(/^\/mall\/([A-Z0-9]{5,})/i);
    if (shortUrlMatch) {
        const sessionId = shortUrlMatch[1];
        const sessionBasePath = `/mall/${sessionId}`;
        console.log('🔍 MallServiceClientWrapper: Parsed Short URL:', {
            sessionId,
            sessionBasePath
        });
        return {
            mallSlug: null, // Resolved from session data later
            sessionId,
            sessionBasePath
        };
    }
    
    console.log('🔍 MallServiceClientWrapper: No mall service pattern found in URL:', pathname);
    return {
        mallSlug: null,
        sessionId: null,
        sessionBasePath: '/'
    };
};

const MallServiceClientWrapper: React.FC<MallServiceClientWrapperProps> = (props) => {
    const { children } = props;
    
    // Parse URL params directly since we're outside React Router context
    const [urlParams, setUrlParams] = useState<ParsedUrlResult>(() => parseUrlParams());
    const { sessionId, mallSlug, sessionBasePath } = urlParams;
  
    const axios = useAxios();
    const dispatch = useDispatch();
    
    // Re-parse URL if pathname changes (for SPA navigation)
    useEffect(() => {
        const handlePopState = () => {
            const newParams = parseUrlParams();
            setUrlParams(newParams);
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    
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

    // SessionId localStorage logic - clear storage if session changes
    useEffect(() => {
        if (!sessionId) return;
        
        const prevSessionId = dashStorage.getItem('mall-session-hash');
        if (prevSessionId && prevSessionId !== sessionId) {
            console.log('🔄 MallServiceClientWrapper: Session changed, clearing storage');
            dashStorage.clear();
        }
        
        dashStorage.setItem('mall-session-hash', sessionId);
        
        // Set guest as "authenticated" immediately so React Admin renders private routes
        dashStorage.setItem('authenticated', 'true');
        console.log('🔐 MallServiceClientWrapper: Pre-set guest as authenticated for React Admin routing');
        
        if (mallSlug) {
            dashStorage.setItem('mall-slug', mallSlug);
        }
        
        console.log('💾 MallServiceClientWrapper: Stored session data:', { sessionId, mallSlug });
    }, [sessionId, mallSlug]);

    // Server validation effect
    useEffect(() => {
        if (hasValidatedRef.current || validationInProgressRef.current) {
            return;
        }

        const validateSession = async () => {
            if (!sessionId) {
                console.log('⚠️ MallServiceClientWrapper: No sessionId found in URL, skipping validation');
                setValidationState({
                    isValidating: false,
                    isValid: true,
                    errorMessage: '',
                    errorDetails: null
                });
                return;
            }

            validationInProgressRef.current = true;
            console.log('🔐 MallServiceClientWrapper: Validating mall session:', sessionId);

            try {
                // Call the mall session auth endpoint
                const { data } = await axios.get(`/public/mall/${sessionId}/getSessionAuth`);
                setTenantData(data);
                
                // Store tenant data for later use
                dashStorage.setItem('mall-tenant-data', JSON.stringify(data.tenant));
                dashStorage.setItem('authenticated', 'true');
                
                // Persist tenant settings and images using AuthPersistenceService
                if (data.auth) {
                    AuthPersistenceService.saveAuth({
                        auth: data.auth,
                        systemValues: data.systemValues || null
                    });
                    
                    console.log('💾 MallServiceClientWrapper: Persisted tenant settings and images to localStorage');
                }
                
                // Store mall-specific data
                if (data.systemValues?.mall) {
                    dashStorage.setItem('mall-info', JSON.stringify(data.systemValues.mall));
                }
                
                // CRITICAL: Update Redux state with guest user AND full auth data for theme/logo loading
                dispatch(
                    DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                        user: {
                            id: 'guest',
                            fullName: 'Guest',
                            email: 'guest@kitchntabs.com',
                            avatar: null,
                            tenant_id: data.tenant?.id, // Add tenant_id for WebSocket
                        },
                        authenticated: true,
                        auth: data.auth || { token: 'guest-token' },
                    })
                );

                // Dispatch theme settings to Redux
                if (data.auth?.tenantSettings) {
                    dispatch(
                        DASH_REDUX_ACTIONS.updateThemeSettings(data.auth.tenantSettings)
                    );
                    console.log('🎨 MallServiceClientWrapper: Dispatched theme settings to Redux');
                }

                // Dispatch panel settings (logos) to Redux
                if (data.auth?.tenantImages) {
                    const logos = {
                        ...(data.auth.tenantImages.horizontal_logo?.original && {
                            horizontalLogo: data.auth.tenantImages.horizontal_logo.original
                        }),
                        ...(data.auth.tenantImages.squared_logo?.original && {
                            squaredLogo: data.auth.tenantImages.squared_logo.original
                        }),
                        ...(data.auth.tenantImages.banner?.original && {
                            loginBackground: data.auth.tenantImages.banner.original
                        })
                    };

                    dispatch(DASH_REDUX_ACTIONS.setPanelSettings(logos));
                    console.log('🖼️ MallServiceClientWrapper: Dispatched panel settings (logos) to Redux');
                }

                // Trigger theme recreation event for DashThemeProvider
                window.dispatchEvent(new Event('DASHTRefreshTheme'));
                console.log('🎨 MallServiceClientWrapper: Triggered theme refresh event');

                console.log('✅ MallServiceClientWrapper: Session validated successfully:', sessionId);
                
                setValidationState({
                    isValidating: false,
                    isValid: true,
                    errorMessage: '',
                    errorDetails: null
                });
                hasValidatedRef.current = true;
            } catch (error: any) {
                setTenantData(null);
                
                const status = error.response?.status;
                const responseData = error.response?.data;
                
                let errorMessage = 'An error occurred while validating the session';
                
                switch (status) {
                    case 410:
                        errorMessage = responseData?.message || 'Session has expired. Sessions are valid for 10 hours from activation.';
                        break;
                    case 404:
                        errorMessage = 'Session not found. Please check the session ID.';
                        break;
                    case 403:
                        errorMessage = 'Access denied to this session.';
                        break;
                    case 500:
                        errorMessage = 'Server error occurred. Please try again later.';
                        break;
                    default:
                        errorMessage = responseData?.message || 'Unable to validate session. Please try again.';
                }

                console.error('❌ MallServiceClientWrapper: Session validation failed:', errorMessage);
                
                // Clear guest authentication on validation failure
                dashStorage.removeItem('authenticated');
                
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

    // Debug logging effect
    useEffect(() => {
        console.log('🛒 MallServiceClientWrapper: Rendering with session:', sessionId, 'mall:', mallSlug);
    }, [sessionId, mallSlug]);

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
                        Validando sesión...
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Handle validation errors
    if (!validationState.isValid) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f5f5">
                <Box sx={{ 
                    maxWidth: 400, 
                    width: '100%', 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 3
                }}>
                    <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
                        Error de Sesión
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {validationState.errorMessage}
                    </Typography>

                    {validationState.errorDetails?.expired_at && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                La sesión expiró el:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {new Date(validationState.errorDetails.expired_at).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                    
                    <Box mt={3}>
                        <Typography variant="caption" color="text.disabled">
                            ID de Sesión: {sessionId}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    // Pass sessionBasePath as appPath to children for React Router basename
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                appPath: sessionBasePath,
            });
        }
        return child;
    });

    console.log('🛣️ MallServiceClientWrapper: Setting appPath to sessionBasePath:', sessionBasePath);

    return (
        <React.Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        }>
            {childrenWithProps}
            <MallAppMediator />
        </React.Suspense>
    );
};

export default MallServiceClientWrapper;
