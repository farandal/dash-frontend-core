import { useContext, useEffect } from 'react';
import { useGetIdentity, useResourceDefinitions } from 'react-admin';
import { useAuthContext } from '../contexts/auth';
import { useDialog } from 'dash-dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { dashStorage } from 'dash-utils';
declare global {
    interface Window {
        __DASH_DEBUG__: any;
    }
}

// Debugging logic moved to a custom hook
function useRADashDebug({
    location,
    resourceDefinitions,
    reduxState,
    authContext,
    identity,
    identityLoading,
    dialog,
    navigate,
}) {
    useEffect(() => {
        // Enhanced route debugging
        const debugInfo = {
            timestamp: new Date().toISOString(),
            location: {
                pathname: location.pathname,
                search: location.search,
                hash: location.hash,
                state: location.state,
                key: location.key
            },
            reactAdminResources: Object.keys(resourceDefinitions || {}),
            resourceDefinitionsDetails: resourceDefinitions,
            reduxResources: reduxState.resources.map(r => ({
                model: r.model,
                label: r.label,
                roles: r.roles,
                group: r.group
            })),
            authContext: {
                authenticated: authContext.authenticated,
                user: authContext.user ? {
                    id: authContext.user.id,
                    roles: authContext.user.roles,
                    tenant_id: authContext.user.tenant_id
                } : null
            },
            localStorage: {
                currentAppPath: dashStorage.getItem('currentAppPath'),
                currentMallSlug: dashStorage.getItem('currentMallSlug'),
                currentMallPath: dashStorage.getItem('currentMallPath'),
                tenant_id: dashStorage.getItem('tenant_id'),
                userData: dashStorage.getItem('userData')
            },
            windowLocation: {
                href: window.location.href,
                origin: window.location.origin,
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash
            }
        };

        console.group('🔍 RADashComponent Route Debug');
        console.log('📍 Current Location:', debugInfo.location);
        console.log('🌐 Window Location:', debugInfo.windowLocation);
        console.log('📦 React Admin Resources:', debugInfo.reactAdminResources);
        console.log('📋 Resource Definitions:', debugInfo.resourceDefinitionsDetails);
        console.log('🏪 Redux Resources:', debugInfo.reduxResources);
        console.log('🔐 Auth Context:', debugInfo.authContext);
        console.log('💾 Local Storage:', debugInfo.localStorage);
        
        // Check for route matches
        const currentPath = location.pathname;
        const matchingResources = reduxState.resources.filter(resource => {
            const resourcePath = resource.model;
            const matches = currentPath.includes(resourcePath) || resourcePath === '/' && currentPath === '/';
            return matches;
        });
        
        console.log('🎯 Matching Resources for current path:', matchingResources);
        
        // Check if current path should match any resource
        const pathSegments = currentPath.split('/').filter(Boolean);
        console.log('📂 Path Segments:', pathSegments);
        
        // Analyze potential routing issues
        const routingIssues = [];
        
        if (reduxState.resources.length === 0) {
            routingIssues.push('No resources loaded in Redux state');
        }
        
        if (Object.keys(resourceDefinitions || {}).length === 0) {
            routingIssues.push('No React Admin resource definitions found');
        }
        
        if (matchingResources.length === 0 && currentPath !== '/') {
            routingIssues.push(`No resources match current path: ${currentPath}`);
        }
        
        if (!authContext.authenticated && reduxState.resources.some(r => !r.roles?.includes('Public'))) {
            routingIssues.push('User not authenticated but trying to access protected resources');
        }
        
        if (routingIssues.length > 0) {
            console.warn('⚠️ Potential Routing Issues:', routingIssues);
        }
        
        console.groupEnd();
        
        // Store debug info globally for inspection
        window.__DASH_DEBUG__ = {
            ...window.__DASH_DEBUG__,
            lastRouteDebug: debugInfo,
            routingIssues
        };
        
    }, [location, resourceDefinitions, reduxState, authContext]);

    useEffect(() => {
        // Debug resource changes
        console.group('📦 Resource Definitions Changed');
        console.log('Available Resources:', Object.keys(resourceDefinitions || {}));
        console.log('Resource Details:', resourceDefinitions);
        console.groupEnd();
    }, [resourceDefinitions]);

    useEffect(() => {
        // Debug auth changes
        console.group('🔐 Auth Context Changed');
        console.log('Authenticated:', authContext.authenticated);
        console.log('User:', authContext.user);
        console.log('Identity Loading:', identityLoading);
        console.log('Identity:', identity);
        console.groupEnd();
    }, [authContext.authenticated, authContext.user, identityLoading, identity]);

    useEffect(() => {
        // Global axios error handler
        const handleGlobalAxiosError = (event) => {
            console.error('🚨 Global Axios Error:', event.data);
            dialog({
                variant: 'danger',
                title: event.data?.name || "Error",
                content: event.data?.message || "Error desconocido",
                confirmText: 'Volver',
                closeText: 'Cerrar',
                onConfirm: () => {},
                onClose: () => {},
            });
        };

        window.addEventListener('global-axios-error', handleGlobalAxiosError);
        return () => {
            window.removeEventListener('global-axios-error', handleGlobalAxiosError);
        };
    }, [dialog]);    

    useEffect(() => {
        // Debug React Admin routing errors
        const handleReactAdminError = (error) => {
            console.error('🚨 React Admin Error:', error);
            // Check if it's a routing error
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                console.group('🔍 Route Not Found Debug');
                console.log('Current path:', location.pathname);
                console.log('Available resources:', Object.keys(resourceDefinitions || {}));
                console.log('Redux resources:', reduxState.resources.map(r => r.model));
                console.log('Suggested fixes:');
                console.log('1. Check if resource model matches the URL path');
                console.log('2. Verify resource permissions/roles');
                console.log('3. Ensure resource is properly registered');
                console.groupEnd();
            }
        };

        window.addEventListener('error', handleReactAdminError);
        window.addEventListener('unhandledrejection', (event) => {
            handleReactAdminError(event.reason);
        });

        return () => {
            window.removeEventListener('error', handleReactAdminError);
            window.removeEventListener('unhandledrejection', handleReactAdminError);
        };
    }, [location.pathname, resourceDefinitions, reduxState.resources]);

    useEffect(() => {
        // Add a helper function to manually trigger route analysis
        window.__DASH_DEBUG__ = {
            ...window.__DASH_DEBUG__,
            analyzeCurrentRoute: () => {
                console.group('🔍 Manual Route Analysis');
                console.log('Current pathname:', location.pathname);
                console.log('React Admin resources:', Object.keys(resourceDefinitions || {}));
                console.log('Redux resources:', reduxState.resources);
                
                // Try to find why route is not matching
                const pathWithoutLeadingSlash = location.pathname.replace(/^\//, '');
                const pathSegments = pathWithoutLeadingSlash.split('/').filter(Boolean);
                
                console.log('Path segments:', pathSegments);
                
                // Check each resource for potential matches
                reduxState.resources.forEach(resource => {
                    const resourceModel = resource.model.replace(/^\//, '');
                    const matches = pathSegments[0] === resourceModel || 
                                  (resource.model === '/' && location.pathname === '/');
                    
                    console.log(`Resource "${resource.model}" matches:`, matches, {
                        resourceModel,
                        firstPathSegment: pathSegments[0],
                        roles: resource.roles,
                        authenticated: authContext.authenticated
                    });
                });
                
                console.groupEnd();
            },
            navigateToResource: (resourceName) => {
                console.log(`Navigating to resource: ${resourceName}`);
                navigate(`/${resourceName}`);
            }
        };
    }, [location, resourceDefinitions, reduxState, authContext, navigate]);
}

const RADashComponent = () => {
  
   
 
    return null;
};

export default RADashComponent;
