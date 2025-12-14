/**
 * MallPublicWrapper
 * 
 * Lightweight wrapper for public (unauthenticated) mall access.
 * This component handles tenant data fetching and renders mall public pages
 * WITHOUT creating a full React-Admin instance.
 * 
 * For authenticated admin access, use MallAppWrapper instead.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { NotFound } from 'dash-components';
import { useAxios } from 'dash-axios-hook';

// Direct import from specific file (avoid barrel exports for tree-shaking)
import MallLanding from '../../kt-mall/components/MallLanding';

interface MallPublicWrapperProps {
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

/**
 * MallPublicWrapper renders a lightweight public view for mall pages.
 * It does NOT create a React-Admin instance - just fetches tenant data
 * and renders the public mall landing or navigation.
 */
const MallPublicWrapper: React.FC<MallPublicWrapperProps> = () => {
    const { mallSlug } = useParams<{ mallSlug: string }>();
    const navigate = useNavigate();
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
            console.log('🔄 MallPublicWrapper: Skipping fetch - already attempted for:', slug);
            return;
        }

        console.log('🚀 MallPublicWrapper: Starting fetch for mall:', slug);
        
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
            console.log('✅ MallPublicWrapper: Tenant data loaded successfully for:', slug);
            
        } catch (err: any) {
            console.error('❌ MallPublicWrapper: Failed to fetch tenant data for:', slug, err);
            
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

    // Handle success state - render public mall content
    if (loadingState === LoadingState.SUCCESS && tenantData) {
        console.log('🎉 MallPublicWrapper: Rendering public mall landing:', {
            mallSlug,
            tenantDataName: tenantData.name || tenantData.slug
        });

        // Render the public mall landing page
        // This is a lightweight component, no React-Admin instance
        return (
            <Box 
                display="flex" 
                flexDirection="column" 
                minHeight="100vh"
                sx={{ backgroundColor: 'var(--body-bg, #121212)' }}
            >
                {/* You can customize this to show mall info, login prompt, etc. */}
                <MallLanding />
                
                {/* Optional: Show admin login button */}
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    p={2}
                    sx={{ mt: 'auto' }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/login')}
                        sx={{ opacity: 0.6 }}
                    >
                        Admin Login
                    </Button>
                </Box>
            </Box>
        );
    }

    // Fallback
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
    );
};

export default MallPublicWrapper;
