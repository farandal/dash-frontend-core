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
import DashInfo from "dash-info";
import { dashStorage } from 'dash-utils';
import { AuthPersistenceService } from 'dash-auth';
import { MallAppMediator } from '../../kt-kiosk/components';
//import { SelfServiceEchoProvider } from '../../kt-selfservice/contexts/SelfServiceEchoContext';

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

    // Pattern 1: /selfservice/:tenantSlug/s/:sessionId/*
    // Matches /s/ followed by 5+ alphanumeric characters
    // Example: /selfservice/my-restaurant/s/ABC12/tab
    const fullUrlMatch = pathname.match(/\/selfservice\/[^/]+\/s\/([A-Z0-9]{5,})/i);

    if (fullUrlMatch) {
        // Extract tenant slug
        const slugMatch = pathname.match(/\/selfservice\/([^/]+)\/s\//i);
        const tenantSlug = slugMatch ? slugMatch[1] : null;

        const sessionId = fullUrlMatch[1];
        // Base path ends after the session ID
        const sessionBasePath = pathname.split(sessionId)[0] + sessionId;

        console.log('🔍 SelfServiceClientWrapper: Parsed Full URL:', {
            tenantSlug,
            sessionId,
            sessionBasePath
        });

        return {
            tenantSlug, // Resolved from URL
            sessionId,
            sessionBasePath
        };
    }

    // Pattern 2: /selfservice/:sessionId/* (Short/Legacy)
    // Matches 5+ alphanumeric characters right after /selfservice/
    const shortUrlMatch = pathname.match(/^\/selfservice\/([A-Z0-9]{5,})/i);
    if (shortUrlMatch) {
        const sessionId = shortUrlMatch[1];
        const sessionBasePath = `/selfservice/${sessionId}`;
        console.log('🔍 SelfServiceClientWrapper: Parsed Short URL:', {
            sessionId,
            sessionBasePath
        });
        return {
            tenantSlug: null, // Resolved from session data later
            sessionId,
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

                // ✅ FIX: Persist tenant settings and images using AuthPersistenceService
                // This ensures theme colors and logos are available for DashThemeProvider
                if (data.auth) {
                    AuthPersistenceService.saveAuth({
                        auth: data.auth,
                        systemValues: data.systemValues || null
                    });

                    console.log('💾 SelfServiceClientWrapper: Persisted tenant settings and images to localStorage');
                }

                // CRITICAL: Update Redux state with guest user AND full auth data for theme/logo loading
                dispatch(
                    DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                        user: {
                            id: 'guest',
                            fullName: 'Guest',
                            email: 'guest@dash.com',
                            avatar: null,
                            tenant_id: data.tenant?.id, // Add tenant_id for WebSocket
                        },
                        authenticated: true,
                        auth: data.auth || { token: 'guest-token' }, // ✅ Include full auth with tenantSettings & tenantImages
                    })
                );

                // ✅ FIX: Dispatch theme settings to Redux
                if (data.auth?.tenantSettings) {
                    dispatch(
                        DASH_REDUX_ACTIONS.updateThemeSettings(data.auth.tenantSettings)
                    );
                    console.log('🎨 SelfServiceClientWrapper: Dispatched theme settings to Redux');
                }

                // ✅ FIX: Dispatch panel settings (logos) to Redux
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
                    console.log('🖼️ SelfServiceClientWrapper: Dispatched panel settings (logos) to Redux');
                }

                // ✅ FIX: Trigger theme recreation event for DashThemeProvider
                window.dispatchEvent(new Event('DASHTRefreshTheme'));
                console.log('🎨 SelfServiceClientWrapper: Triggered theme refresh event');

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
        return (<>

            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" >

                <DashInfo
                   
                    variant={"danger"}
                    title={"Error de Sesión / Session Error"}
                    content={<><Typography variant="body1" color="text.secondary">
                        {validationState.errorMessage}
                    </Typography>

                        {validationState.errorDetails?.expired_at && (
                            <Box sx={{ mt: 2, p: 2, borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                   expired / expiración:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {new Date(validationState.errorDetails.expired_at).toLocaleString()}
                                </Typography>
                            </Box>
                        )}

                        <Box mt={3}>
                            <Typography variant="caption" color="text.disabled">
                                ID: {sessionId}
                            </Typography>
                        </Box></>} />


            </Box>
        </>
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
