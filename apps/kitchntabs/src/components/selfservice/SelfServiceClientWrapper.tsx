/**
 * SelfServiceClientWrapper
 * 
 * App-specific wrapper for Self-Service Kiosk client (public ordering) functionality.
 * This component handles session validation and tenant data fetching,
 * then renders the private app with self-service-specific configuration.
 * 
 * ARCHITECTURE NOTE: This component is designed to work as a Higher-Order Component (HoC)
 * that wraps the entire app BEFORE React Router is initialized.
 * 
 * Expected URL patterns:
 * - /selfservice/:tenantSlug/s/:sessionId/* (e.g., /selfservice/myrestaurant/s/DFJNL)
 */
import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAxios } from 'dash-axios-hook';
import { useDispatch } from 'react-redux';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import { dashStorage } from 'dash-utils';
import { MallAppMediator } from '../../kt-kiosk/components';
import { SelfServiceEchoProvider } from '../../kt-selfservice/contexts/SelfServiceEchoContext';

interface ValidationState {
    isValidating: boolean;
    isValid: boolean;
    errorMessage: string;
    errorDetails?: any;
}

interface SelfServiceClientWrapperProps extends React.PropsWithChildren<any> {
    appPath?: string;
}

interface ParsedUrlParams {
    tenantSlug: string | null;
    sessionId: string | null;
}

interface ParsedUrlResult extends ParsedUrlParams {
    sessionBasePath: string;
}

/**
 * Parse self-service session parameters directly from window.location
 * 
 * Supported URL patterns:
 * - /selfservice/:sessionId/* (e.g., /selfservice/DFJNL)
 */
const parseUrlParams = (): ParsedUrlResult => {
    const pathname = window.location.pathname;
    
    // Pattern: /selfservice/:sessionId
    // Matches 5+ alphanumeric characters (hash) right after /selfservice/
    const selfServiceMatch = pathname.match(/^\/selfservice\/([A-Z0-9]{5,})/i);
    if (selfServiceMatch) {
        const sessionBasePath = `/selfservice/${selfServiceMatch[1]}`;
        console.log('🔍 SelfServiceClientWrapper: Parsed URL:', {
            sessionId: selfServiceMatch[1],
            sessionBasePath
        });
        return {
            tenantSlug: null, // Resolved from session data later
            sessionId: selfServiceMatch[1],
            sessionBasePath
        };
    }
    
    console.log('🔍 SelfServiceClientWrapper: No self-service pattern found in URL:', pathname);
    return {
        tenantSlug: null,
        sessionId: null,
        sessionBasePath: '/'
    };
};

const SelfServiceClientWrapper: React.FC<SelfServiceClientWrapperProps> = (props) => {
    const { children } = props;
    
    // Parse URL params directly since we're outside React Router context
    const [urlParams, setUrlParams] = useState<ParsedUrlResult>(() => parseUrlParams());
    const { sessionId, tenantSlug, sessionBasePath } = urlParams;
  
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
        
        const prevSessionId = dashStorage.getItem('selfservice-session-hash');
        if (prevSessionId && prevSessionId !== sessionId) {
            console.log('🔄 SelfServiceClientWrapper: Session changed, clearing storage');
            dashStorage.clear();
        }
        
        dashStorage.setItem('selfservice-session-hash', sessionId);
        
        // Set guest as "authenticated" immediately so React Admin renders private routes
        dashStorage.setItem('authenticated', 'true');
        console.log('🔐 SelfServiceClientWrapper: Pre-set guest as authenticated for React Admin routing');
        
        if (tenantSlug) {
            dashStorage.setItem('selfservice-tenant-slug', tenantSlug);
        }
        
        console.log('💾 SelfServiceClientWrapper: Stored session data:', { sessionId, tenantSlug });
    }, [sessionId, tenantSlug]);

    // Server validation effect
    useEffect(() => {
        if (hasValidatedRef.current || validationInProgressRef.current) {
            return;
        }

        const validateSession = async () => {
            if (!sessionId) {
                console.log('⚠️ SelfServiceClientWrapper: No sessionId found in URL, skipping validation');
                setValidationState({
                    isValidating: false,
                    isValid: true,
                    errorMessage: '',
                    errorDetails: null
                });
                return;
            }

            validationInProgressRef.current = true;
            console.log('🔐 SelfServiceClientWrapper: Validating session:', sessionId);

            try {
                const { data } = await axios.get(`/public/selfservice/${sessionId}/getSessionAuth`);
                setTenantData(data);
                
                // Store tenant data for later use
                dashStorage.setItem('selfservice-tenant-data', JSON.stringify(data.tenant));
                dashStorage.setItem('authenticated', 'true');
                
                // CRITICAL: Update Redux state with guest user for WebSocket initialization
                dispatch(
                    DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                        user: {
                            id: 'guest',
                            fullName: 'Guest',
                            email: 'guest@kitchntabs.com',
                            avatar: null,
                        },
                        authenticated: true,
                        auth: { token: 'guest-token' }, // Dummy token to satisfy types
                    })
                );

                console.log('✅ SelfServiceClientWrapper: Session validated successfully:', sessionId);
                
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

                console.error('❌ SelfServiceClientWrapper: Session validation failed:', errorMessage);
                
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
        console.log('🛒 SelfServiceClientWrapper: Rendering with session:', sessionId, 'tenant:', tenantSlug);
    }, [sessionId, tenantSlug]);

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

    console.log('🛣️ SelfServiceClientWrapper: Setting appPath to sessionBasePath:', sessionBasePath);

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

export default SelfServiceClientWrapper;
