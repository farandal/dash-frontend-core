import { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Card, Typography, CircularProgress, Alert } from '@mui/material';
import DASHAuthenticationService from 'dash-admin/contexts/auth/DASHAuthenticationService';
import LaravelEchoContext from 'dash-admin/contexts/com/LaravelEchoContext';
import type { ILaravelEchoContext } from 'dash-admin/contexts/com/LaravelEchoContext';
import { DASHAdminSystemConstants } from 'dash-constants';
import { useAxios } from "dash-axios-hook";
import { AuthPersistenceService } from 'dash-auth';

interface MallQRGeneratorProps {
}

interface SessionResponse {
    data: {
        hash: string;
        mall_id: number;
        status: string;
        meta: any;
    };
    message?: string;
}

const MallQRGenerator: FC<MallQRGeneratorProps> = (props) => {
    const axios = useAxios();
    // Get mallSlug from route params (works with /:mallSlug/* pattern) - fallback option
    const { mallSlug: routeMallSlug } = useParams<{ mallSlug: string }>();
    
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [mallSlugState, setMallSlugState] = useState<string | null>(null);

    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);

    // Get mall slug from authenticated user's managed_mall (stored in user object or systemValues)
    const getMallSlugFromAuth = (): string | null => {
        // First check user object for managed_mall
        const user = AuthPersistenceService.getUser();
        if (user?.managed_mall?.slug) {
            return user.managed_mall.slug;
        }
        
        // Then check systemValues (where backend stores managed_mall info)
        const systemValues = AuthPersistenceService.getSystemValues();
        if (systemValues?.managed_mall?.slug) {
            return systemValues.managed_mall.slug;
        }
        
        return null;
    };

    const retrieveNewSession = async () => {

        const mallSlug = getMallSlug();

        if (!mallSlug) {
            setError('Mall not found. Your account may not be associated with a mall.');
            setLoading(false);
            return;
        }

        const hash = await retrieveSession(mallSlug);
        if (hash) {
            setSessionId(hash);
        }

    }



    useEffect(() => {
      
       
        if (lastEvent) {

            switch (lastEvent.model) {
                case "Domain\\App\\Models\\Mall\\MallSession":

                    retrieveNewSession();
                    break;
            }
        }

    }, [lastEvent]);

    // Get the frontend URL from environment or fallback to current browser URL
    const getFrontendUrl = (): string => {
        const envUrl = DASHAdminSystemConstants.system.FRONTEND_URL;

        if (envUrl) {
            return envUrl;
        }

        // Fallback to current browser URL (origin)
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }

        return '';
    };

    // Get mall slug - prioritize auth user's managed_mall, then route params, then URL parsing
    const getMallSlug = (): string | null => {
        // 1. First priority: Get from authenticated user's managed_mall
        const authMallSlug = getMallSlugFromAuth();
        if (authMallSlug) {
            return authMallSlug;
        }
        
        // 2. Second priority: Use route params if available (from /:mallSlug/* pattern)
        if (routeMallSlug) {
            return routeMallSlug;
        }
        
        // 3. Fallback to URL parsing for backwards compatibility (apps/dash)
        if (typeof window !== 'undefined') {
            // Exclude known non-mall routes and resource routes
            const excludedRoutes = ['login', 'signup', 'register', 'registrarse', 'legal', 'verify', 'reset-password', 'change-password', 'oauth', 'apps', 'qr', 'admin'];
            
            // Try old pattern: /apps/mall/:mallSlug
            const oldMatch = window.location.pathname.match(/^\/apps\/mall\/([^/]+)/);
            if (oldMatch?.[1]) {
                return oldMatch[1];
            }
            
            // Try new pattern: /:mallSlug (first segment that's not excluded)
            const newMatch = window.location.pathname.match(/^\/([^/]+)/);
            if (newMatch?.[1] && !excludedRoutes.includes(newMatch[1])) {
                return newMatch[1];
            }
        }
        
        return null;
    };

    // Retrieve session from backend
    const retrieveSession = async (mallSlug: string): Promise<string | null> => {
        
        try {
            setLoading(true);
            setError(null);

            const endpoint = `/mall/client_session/${mallSlug}`;
            const response = await axios.post<SessionResponse>(endpoint);
            if (response.data?.data.hash) {
                return response.data.data.hash;
            } else {
                throw new Error('Invalid response format: missing hash');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create session';
            setError(errorMessage);
            console.error('Error retrieving session:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Construct the full URL for QR code
    const constructQRUrl = (hash: string): string => {
        const baseUrl = getFrontendUrl();
        const mallSlug = getMallSlug();
        // New URL pattern: /:mallSlug/s/:hash
        const endpoint = mallSlug ? `/${mallSlug}/s/${hash}` : `/s/${hash}`;

        // Ensure proper URL construction with forward slashes
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

        return `${cleanBaseUrl}${cleanEndpoint}`;
    };

    // Initialize session on component mount
    useEffect(() => {
        const initializeSession = async () => {
            const mallSlug = getMallSlug();

            if (!mallSlug) {
                setError('Mall slug not found in URL');
                setLoading(false);
                return;
            }

            const hash = await retrieveSession(mallSlug);
            if (hash) {
                setSessionId(hash);
            }
        };

        initializeSession();
    }, []);

    const size = 360;

    // Show loading state
    if (loading) {
        return (
            <Card sx={{
                mr: 2,
                ml: 2,
                justifyContent: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
                borderRadius: 10,
                backgroundColor: 'white',
                boxShadow: 3,
                minHeight: size + 32 // Account for padding
            }}>
                <CircularProgress size={200} sx={{ color: 'black' }} />
            </Card>
        );
    }

    // Show error state
    if (error) {
        return (
            <Card sx={{
                mt:2,
                mr: 2,
                ml: 2,
                p: 4,
                borderRadius: 10,
                backgroundColor: 'white',
                boxShadow: 3
            }}>
                <Alert severity="error">
                    <Typography variant="body2">
                        Error - {error}
                    </Typography>
                </Alert>
            </Card>
        );
    }

    // Show QR code if session is available
    if (sessionId) {
        const qrUrl = constructQRUrl(sessionId);

        return (
            <Card sx={{
                mt:2,
                mr: 2,
                ml: 2,
                justifyContent: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
                borderRadius: 10,
                backgroundColor: 'white',
                boxShadow: 3
            }}>
                <QRCodeSVG
                    value={qrUrl}
                    size={size}
                    level="H"
                />
                {qrUrl}
            </Card>
        );
    }

    // Fallback state (shouldn't reach here normally)
    return (
        <Card sx={{
            mr: 2,
            ml: 2,
            p: 4,
            borderRadius: 10,
            backgroundColor: 'white',
            boxShadow: 3
        }}>
            <Alert severity="warning">
                <Typography variant="body2">
                    Unable to generate QR Code
                </Typography>
            </Alert>
        </Card>
    );
};


export default MallQRGenerator;