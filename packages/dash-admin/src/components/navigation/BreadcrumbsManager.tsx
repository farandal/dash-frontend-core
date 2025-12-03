import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useStore } from 'react-admin';
import { IBreadcrumbItem, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { DASHAdminSystemConstants } from 'dash-constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BreadcrumbsManagerProps {
    /** Custom label map for route segments */
    labelMap?: Record<string, string>;
    /** Whether to include the home item */
    includeHome?: boolean;
    /** Home path */
    homePath?: string;
    /** Home label */
    homeLabel?: string;
    /** Custom breadcrumb generator function */
    customGenerator?: (
        pathname: string, 
        resourceConfig?: IDashAutoAdminResourceConfig,
        record?: any
    ) => IBreadcrumbItem[];
    /** Field to use as record name (default: 'name') */
    recordNameField?: string;
    /** Children components */
    children?: React.ReactNode;
}

// ============================================================================
// DEFAULT LABEL MAPPINGS
// ============================================================================

const defaultLabelMap: Record<string, string> = {
    // Common actions
    'create': 'Crear',
    'edit': 'Editar',
    'show': 'Ver',
    'list': 'Lista',
    'inline': 'Detalle',
    'trash': 'Papelera',
    
    // Common routes
    'admin': 'Admin',
    'system': 'Sistema',
    'settings': 'Configuración',
    'users': 'Usuarios',
    'roles': 'Roles',
    'permissions': 'Permisos',
    'tenants': 'Tenants',
    'profile': 'Perfil',
    'dashboard': 'Dashboard',
    'apps': 'Aplicaciones',
    'client': 'Cliente',
    'mall': 'Mall',
    'public': 'Público',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse a route segment into a readable label
 */
const parseSegmentLabel = (
    segment: string, 
    labelMap: Record<string, string>,
    resourceConfig?: IDashAutoAdminResourceConfig
): string => {
    // Check custom label map first
    if (labelMap[segment]) {
        return labelMap[segment];
    }
    
    // Check default label map
    if (defaultLabelMap[segment]) {
        return defaultLabelMap[segment];
    }
    
    // Check if segment matches resource model
    if (resourceConfig) {
        const modelParts = resourceConfig.model?.split('/') || [];
        if (modelParts.includes(segment)) {
            return resourceConfig.label || segment;
        }
    }
    
    // Convert kebab-case or snake_case to Title Case
    return segment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Check if a segment is an ID (numeric or UUID-like)
 */
const isIdSegment = (segment: string): boolean => {
    // Check for numeric ID
    if (/^\d+$/.test(segment)) {
        return true;
    }
    // Check for UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return true;
    }
    // Check for short hash-like IDs (at least 20 chars alphanumeric)
    if (/^[a-z0-9]{20,}$/i.test(segment)) {
        return true;
    }
    return false;
};

/**
 * Generate breadcrumbs from pathname
 */
const generateBreadcrumbsFromPath = (
    pathname: string,
    labelMap: Record<string, string>,
    resourceConfig?: IDashAutoAdminResourceConfig,
    includeHome?: boolean,
    homePath?: string,
    homeLabel?: string,
    recordName?: string
): IBreadcrumbItem[] => {
    const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX || '';
    
    // Remove URL prefix and clean path
    let cleanPath = pathname;
    if (URL_PREFIX && cleanPath.startsWith(URL_PREFIX)) {
        cleanPath = cleanPath.slice(URL_PREFIX.length);
    }
    
    // Split into segments and filter empty ones
    const segments = cleanPath.split('/').filter(Boolean);
    
    if (segments.length === 0) {
        return [];
    }
    
    const breadcrumbs: IBreadcrumbItem[] = [];
    
    // Add home item if requested
    if (includeHome) {
        breadcrumbs.push({
            label: homeLabel || 'Home',
            path: homePath || '/',
        });
    }
    
    let currentPath = URL_PREFIX;
    
    // Build breadcrumbs for each segment
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        const isId = isIdSegment(segment);
        
        // Handle ID segments
        if (isId) {
            // If we have a record name and this is the last segment or second-to-last, use it
            if (recordName && (isLast || index === segments.length - 2)) {
                breadcrumbs.push({
                    label: recordName,
                    path: isLast ? undefined : currentPath,
                    isActive: isLast,
                    data: { id: segment },
                });
            } else {
                // Use a generic "Record #ID" label (truncated for display)
                const displayId = segment.length > 8 
                    ? `#${segment.substring(0, 8)}...` 
                    : `#${segment}`;
                breadcrumbs.push({
                    label: displayId,
                    path: isLast ? undefined : currentPath,
                    isActive: isLast,
                    data: { id: segment },
                });
            }
            return;
        }
        
        // Get the label for this segment
        const label = parseSegmentLabel(segment, labelMap, resourceConfig);
        
        breadcrumbs.push({
            label,
            path: isLast ? undefined : currentPath,
            isActive: isLast,
        });
    });
    
    return breadcrumbs;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * BreadcrumbsManager
 * 
 * A component that automatically manages breadcrumb state based on the current route.
 * Place this component in your app layout to enable automatic breadcrumb generation.
 * 
 * @example
 * ```tsx
 * // In your app layout
 * <BreadcrumbsManager includeHome homeLabel="Dashboard">
 *     {children}
 * </BreadcrumbsManager>
 * ```
 */
export const BreadcrumbsManager: React.FC<BreadcrumbsManagerProps> = ({
    labelMap = {},
    includeHome = false,
    homePath = '/',
    homeLabel = 'Home',
    customGenerator,
    recordNameField = 'name',
    children,
}) => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    // Get resource config from store
    const [resourceConfig] = useStore<IDashAutoAdminResourceConfig>('resourceConfig');
    
    // Note: We don't use useRecordContext here because it requires RecordContextProvider
    // The record name will be handled by the useBreadcrumbs hook in resource templates instead
    const record: any = null;
    
    // Merge label maps
    const mergedLabelMap = useMemo(() => ({
        ...defaultLabelMap,
        ...labelMap,
    }), [labelMap]);
    
    // Get record name from record context
    const recordName = useMemo(() => {
        if (!record) return undefined;
        
        // Try common name fields
        const nameFields = [recordNameField, 'name', 'title', 'label', 'displayName', 'username'];
        for (const field of nameFields) {
            if (record[field]) {
                return String(record[field]);
            }
        }
        
        // Use recordRepresentation if available
        if (resourceConfig?.recordRepresentation) {
            const repr = resourceConfig.recordRepresentation;
            if (typeof repr === 'string' && record[repr]) {
                return String(record[repr]);
            }
        }
        
        return undefined;
    }, [record, recordNameField, resourceConfig]);
    
    // Generate and dispatch breadcrumbs on route change
    useEffect(() => {
        let breadcrumbs: IBreadcrumbItem[];
        
        if (customGenerator) {
            breadcrumbs = customGenerator(location.pathname, resourceConfig, record);
        } else {
            breadcrumbs = generateBreadcrumbsFromPath(
                location.pathname,
                mergedLabelMap,
                resourceConfig,
                includeHome,
                homePath,
                homeLabel,
                recordName
            );
        }
        
        // Only update if we have breadcrumbs
        if (breadcrumbs.length > 0) {
            dispatch(DASH_REDUX_ACTIONS.updatePage({ breadcrumbs }));
        }
    }, [
        location.pathname,
        mergedLabelMap,
        resourceConfig,
        includeHome,
        homePath,
        homeLabel,
        recordName,
        customGenerator,
        dispatch,
        record,
    ]);
    
    return <>{children}</>;
};

export default BreadcrumbsManager;
