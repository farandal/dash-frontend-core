/**
 * MallClientWrapper
 * 
 * App-specific wrapper for Mall client (public ordering) functionality.
 * This component handles session validation and tenant data fetching,
 * then renders the private app with mall-client-specific configuration.
 * 
 * ARCHITECTURE NOTE: This component is designed to work as a Higher-Order Component (HoC)
 * that wraps the entire app BEFORE React Router is initialized. Therefore, it cannot use
 * useParams() and must parse the URL directly from window.location.
 * 
 * Expected URL patterns:
 * - /:mallSlug/s/:sessionId/* (e.g., /malltest/s/DFJNL)
 * - Direct session access (e.g., /DFJNL or session hash in path)
 */
import React, { lazy, useEffect, useState, useRef, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
//import { NotFound } from 'dash-components';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';

// Import mall session WebSocket context
import { MallSessionEchoProvider, useMallSessionEcho } from '../../contexts/MallSessionEchoContext';

// Import bridge provider from local kt-mall to pass WebSocket events to components
import { MallEchoBridgeProvider } from '../../kt-mall';

interface ValidationState {
    isValidating: boolean;
    isValid: boolean;
    errorMessage: string;
    errorDetails?: any;
}

interface MallClientWrapperProps extends React.PropsWithChildren<any> {
    appPath?: string;
}

interface ParsedUrlParams {
    mallSlug: string | null;
    sessionId: string | null;
}

// Simple translation helper since we're outside React-Admin context
const getErrorMessage = (key: string, defaultMessage: string) => defaultMessage;

interface ParsedUrlResult extends ParsedUrlParams {
    sessionBasePath: string;
}

/**
 * Parse mall session parameters directly from window.location
 * This is needed because MallClientWrapper runs BEFORE React Router is initialized
 * 
 * Supported URL patterns:
 * - /:mallSlug/s/:sessionId/* (e.g., /malltest/s/DFJNL/orders)
 * - /:sessionId (direct session hash, e.g., /DFJNL) - for backward compatibility
 * 
 * Also calculates the sessionBasePath which is used as React Router basename
 */
const parseUrlParams = (): ParsedUrlResult => {
    const pathname = window.location.pathname;
    
    // Pattern 1: /:mallSlug/s/:sessionId (e.g., /malltest/s/DFJNL)
    // Session IDs are typically 5 uppercase alphanumeric characters
    const mallSessionMatch = pathname.match(/^\/([^/]+)\/s\/([A-Z0-9]{5,})/i);
    if (mallSessionMatch) {
        const sessionBasePath = `/${mallSessionMatch[1]}/s/${mallSessionMatch[2]}`;
        console.log('🔍 MallClientWrapper: Parsed URL (mall/s/session pattern):', {
            mallSlug: mallSessionMatch[1],
            sessionId: mallSessionMatch[2],
            sessionBasePath
        });
        return {
            mallSlug: mallSessionMatch[1],
            sessionId: mallSessionMatch[2],
            sessionBasePath
        };
    }
    
    // Pattern 2: Direct session hash in first segment (e.g., /DFJNL)
    // Only if it looks like a session hash (5+ uppercase alphanumeric)
    const directSessionMatch = pathname.match(/^\/([A-Z0-9]{5,})(?:\/|$)/i);
    if (directSessionMatch) {
        const sessionBasePath = `/${directSessionMatch[1]}`;
        console.log('🔍 MallClientWrapper: Parsed URL (direct session pattern):', {
            sessionId: directSessionMatch[1],
            sessionBasePath
        });
        return {
            mallSlug: null,
            sessionId: directSessionMatch[1],
            sessionBasePath
        };
    }
    
    console.log('🔍 MallClientWrapper: No session pattern found in URL:', pathname);
    return {
        mallSlug: null,
        sessionId: null,
        sessionBasePath: '/'
    };
};

const MallClientWrapper: React.FC<MallClientWrapperProps> = (props) => {
    const { appPath, children } = props;
    
    // Parse URL params directly since we're outside React Router context
    const [urlParams, setUrlParams] = useState<ParsedUrlResult>(() => parseUrlParams());
    const { sessionId, mallSlug, sessionBasePath } = urlParams;
  
    const axios = useAxios();
    
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
            console.log('🔄 MallClientWrapper: Session changed, clearing storage');
            dashStorage.clear();
        }
        
        dashStorage.setItem('mall-session-hash', sessionId);
        
        // IMPORTANT: Set guest as "authenticated" immediately so React Admin 
        // renders private routes. This happens before server validation.
        // If validation fails, we'll clear this and show error state.
        dashStorage.setItem('authenticated', 'true');
        console.log('🔐 MallClientWrapper: Pre-set guest as authenticated for React Admin routing');
        
        if (mallSlug) {
            dashStorage.setItem('mall-slug', mallSlug);
        }
        
        console.log('💾 MallClientWrapper: Stored session data:', { sessionId, mallSlug });
    }, [sessionId, mallSlug]);

    // Server validation effect
    useEffect(() => {
        // Prevent multiple validations
        if (hasValidatedRef.current || validationInProgressRef.current) {
            return;
        }

        const validateSession = async () => {
            if (!sessionId) {
                console.log('⚠️ MallClientWrapper: No sessionId found in URL, skipping validation');
                // Don't show error for missing sessionId - user might be on a non-session route
                setValidationState({
                    isValidating: false,
                    isValid: true, // Allow children to render - they can handle their own routing
                    errorMessage: '',
                    errorDetails: null
                });
                return;
            }

            validationInProgressRef.current = true;
            console.log('🔐 MallClientWrapper: Validating session:', sessionId);

            try {
                const { data } = await axios.get(`/public/mall/${sessionId}/getSessionAuth`);
                setTenantData(data);
                
                // Set guest as "authenticated" so React Admin renders private routes
                // This doesn't mean the user is logged in - it just allows access to mall ordering
                dashStorage.setItem('authenticated', 'true');
                console.log('🔐 MallClientWrapper: Set guest as authenticated for React Admin routing');
                
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

    // Debug logging effect - MUST be before conditional returns to comply with Rules of Hooks
    useEffect(() => {
        console.log('🛒 MallClientWrapper: Rendering Mall Client App with session:', sessionId, 'mall:', mallSlug);
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
                    {/*<NotFound
                        disableCountdown={true}
                        disableGoBack={false}
                        customMessage={validationState.errorMessage}
                    />*/}
                    {validationState.errorMessage}

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
    // Pass sessionBasePath to children as appPath for proper React Router basename
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            // Clone children and pass sessionBasePath as appPath
            return React.cloneElement(child as React.ReactElement<any>, {
                appPath: sessionBasePath,
            });
        }
        return child;
    });

    console.log('🛣️ MallClientWrapper: Setting appPath to sessionBasePath:', sessionBasePath);

    return (
        <MallSessionEchoProvider sessionId={sessionId}>
            <MallEchoBridgeWrapper sessionBasePath={sessionBasePath}>
              {childrenWithProps}
            </MallEchoBridgeWrapper>
        </MallSessionEchoProvider>
    );
};

/**
 * Inner wrapper component that has access to MallSessionEchoContext
 * and bridges events to the kt-mall package via MallEchoBridgeProvider
 */
const MallEchoBridgeWrapper: React.FC<{
    children: React.ReactNode;
    sessionBasePath: string;
}> = ({ children, sessionBasePath }) => {
    // Get all values from MallSessionEchoContext
    const {
        lastEvent,
        events,
        isConnected,
        sessionId,
        tenantStatuses,
        productStatuses,
    } = useMallSessionEcho();

    // Debug log when events are received
    useEffect(() => {
        if (lastEvent) {
            console.log('🌉 MallEchoBridgeWrapper: Bridging event to kt-mall package:', lastEvent);
        }
    }, [lastEvent]);

    return (
        <MallEchoBridgeProvider
            lastEvent={lastEvent}
            events={events}
            isConnected={isConnected}
            sessionId={sessionId}
            tenantStatuses={tenantStatuses}
            productStatuses={productStatuses}
        >
            <React.Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            }>
                {children}
            </React.Suspense>
        </MallEchoBridgeProvider>
    );
};

export default MallClientWrapper;
