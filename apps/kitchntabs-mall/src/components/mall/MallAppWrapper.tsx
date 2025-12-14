/**
 * MallAppWrapper
 * 
 * App-specific wrapper for Mall admin functionality.
 * This component handles mall authentication and tenant data fetching,
 * then renders the private app with mall-specific configuration.
 */
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { NotFound } from 'dash-components';
import { useAxios } from 'dash-axios-hook';

// Import mall-specific configs from local dash-extensions
import DASHMallDataProvider from '../../dash-extensions/config/DASHMallDataProvider';
import DASHMallAuthProvider from '../../dash-extensions/config/DASHMallAuthProvider';
import { mallPublicGlobalRoutes, mallPrivateGlobalRoutes } from '../../dash-extensions/config/DASHMallSharedRoutes';
import GlobalTenantWrapper from '../../dash-extensions/core/GlobalTenantWrapper';

// Import mall resources config (lightweight - just config objects, heavy components are lazy inside)
import MallAppResources from 'kt-mall/src/MallAppResources';

// Lazy load heavy components
const MallAppMediator = lazy(() => import('kt-mall/src/components/MallAppMediator'));

// Lazy load the private app
const KitchnTabsPrivateApp = lazy(() => import('../../core/KitchnTabsPrivateApp'));

interface MallAppWrapperProps {
    appPath?: string;
}

interface MallTenantData {
    id: string;
    name: string;
    slug: string;
    [key: string]: any;
}

// Loading states enum for better type safety
enum LoadingState {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}

// Mall app configuration
export const mallAppProps = {
    customResources: MallAppResources,
    useOwnRouter: false,
    customDataProvider: DASHMallDataProvider,
    customAuthProvider: DASHMallAuthProvider,
    customPublicRoutes: mallPublicGlobalRoutes,
    customPrivateRoutes: mallPrivateGlobalRoutes
};

const MallAppWrapper: React.FC<MallAppWrapperProps> = () => {
    const { mallSlug } = useParams<{ mallSlug: string }>();
    const axios = useAxios();
  
    // State management for async data fetching
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    const [tenantData, setTenantData] = useState<MallTenantData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Track fetch attempts to prevent infinite loops
    const fetchAttemptRef = useRef<{
        slug: string | null;
        state: LoadingState;
        attempted: boolean;
    }>({
        slug: null,
        state: LoadingState.IDLE,
        attempted: false
    });

    // Stable fetch function
    const fetchTenantData = useCallback(async (slug: string) => {
        // Prevent re-fetch if we've already attempted this slug
        if (fetchAttemptRef.current.slug === slug && fetchAttemptRef.current.attempted) {
            return;
        }

        // Mark as attempting
        fetchAttemptRef.current = {
            slug,
            state: LoadingState.LOADING,
            attempted: true
        };
        
        setLoadingState(LoadingState.LOADING);
        setError(null);
        setTenantData(null);

        try {
            const { data } = await axios.get(`/public/mall/${slug}/getAuth`);
            
            // SUCCESS: Update state
            fetchAttemptRef.current.state = LoadingState.SUCCESS;
            setTenantData(data);
            setLoadingState(LoadingState.SUCCESS);
        } catch (err: any) {
            console.error('❌ MallAppWrapper: Failed to fetch tenant data for:', slug, err);
            
            // ERROR: Mark as failed and don't retry
            fetchAttemptRef.current.state = LoadingState.ERROR;
            setError(err.message || 'Failed to load mall data');
            setLoadingState(LoadingState.ERROR);
            setTenantData(null);
        }
    }, [axios]);

    // Effect with strict conditions
    useEffect(() => {
        if (!mallSlug) {
            setLoadingState(LoadingState.ERROR);
            setError('Mall slug is required');
            return;
        }

        // Only fetch if we haven't attempted this slug yet
        const shouldFetch = (
            fetchAttemptRef.current.slug !== mallSlug || 
            !fetchAttemptRef.current.attempted
        );

        if (shouldFetch) {
            // Reset state when slug changes
            if (fetchAttemptRef.current.slug !== mallSlug) {
                setTenantData(null);
                setLoadingState(LoadingState.IDLE);
                setError(null);
                fetchAttemptRef.current = {
                    slug: null,
                    state: LoadingState.IDLE,
                    attempted: false
                };
            }
            
            fetchTenantData(mallSlug);
        }
    }, [mallSlug, fetchTenantData]);

    const dynamicAppPath = useMemo(() => `/apps/mall/${mallSlug}`, [mallSlug]);

    // Handle missing mall slug
    if (!mallSlug) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Box sx={{ maxWidth: 400, width: '100%', p: 2 }}>
                    <NotFound
                        disableCountdown={true}
                        disableGoBack={false}
                        customMessage="Mall slug is required"
                    />
                </Box>
            </Box>
        );
    }

    // Handle loading state
    if (loadingState === LoadingState.LOADING) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Box sx={{ 
                    maxWidth: 400, 
                    width: '100%', 
                    p: 2,
                    textAlign: 'center'
                }}>
                    <Box component="div" sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3
                    }}>
                        <CircularProgress size={60} thickness={4} />
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Mall
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                               <strong>{mallSlug}</strong>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    // Handle error state
    if (loadingState === LoadingState.ERROR) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Box sx={{ maxWidth: 500, width: '100%', p: 2 }}>
                    <NotFound
                        disableCountdown={true}
                        disableGoBack={false}
                        customMessage={
                            error === 'Mall slug is required' 
                                ? error
                                : `Mall "${mallSlug}" not found or unavailable`
                        }
                        customButtonText="Go Back"
                    />
                    
                    {/* Debug info - development only */}
                    {import.meta.env.DEV && error && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Debug: {error}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    // Handle success state - render the private app
    if (loadingState === LoadingState.SUCCESS && tenantData) {
        return (
            <Suspense fallback={
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            }>
                {/* KitchnTabsPrivateApp should not be here, it is already in a parent
                Instead, this must inherit and all the logic from this file be merged in the kitchntabs bootrap file */}
            
                <KitchnTabsPrivateApp
                    {...mallAppProps}
                    appPath={dynamicAppPath}
                    GlobalHook={() => (
                        <GlobalTenantWrapper tenantData={tenantData} />
                    )}
                >
                    <Suspense fallback={null}>
                        <MallAppMediator />
                    </Suspense>
                </KitchnTabsPrivateApp>
           

            </Suspense>
        );
    }

    // Fallback
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
    );
};

export default MallAppWrapper;
