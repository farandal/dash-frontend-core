import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useStore } from 'react-admin';
import { IBreadcrumbItem, IDASHAppState, DASH_REDUX_ACTIONS, IPageState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { DASHAdminSystemConstants } from 'dash-constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UseBreadcrumbsOptions {
    /** Whether to auto-update breadcrumbs on route change */
    autoUpdate?: boolean;
    /** Custom label map for route segments */
    labelMap?: Record<string, string>;
    /** Whether to include the home item */
    includeHome?: boolean;
    /** Home path */
    homePath?: string;
    /** Home label */
    homeLabel?: string;
    /** Custom breadcrumb generator function */
    customGenerator?: (pathname: string, resourceConfig?: IDashAutoAdminResourceConfig) => IBreadcrumbItem[];
    /** Whether to fetch record name for detail pages */
    fetchRecordName?: boolean;
    /** Field to use as record name (default: 'name') */
    recordNameField?: string;
}

export interface UseBreadcrumbsResult {
    /** Current breadcrumbs */
    breadcrumbs: IBreadcrumbItem[];
    /** Manually set breadcrumbs */
    setBreadcrumbs: (items: IBreadcrumbItem[]) => void;
    /** Add a breadcrumb item */
    addBreadcrumb: (item: IBreadcrumbItem) => void;
    /** Clear all breadcrumbs */
    clearBreadcrumbs: () => void;
    /** Current pathname */
    pathname: string;
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
    if (resourceConfig && resourceConfig.model?.includes(segment)) {
        return resourceConfig.label || segment;
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
    // Check for short hash-like IDs
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
    let lastIdIndex = -1;
    
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        const isId = isIdSegment(segment);
        
        // Skip adding ID segments directly, we'll handle them specially
        if (isId) {
            lastIdIndex = index;
            // If we have a record name and this is related to the last ID, use it
            if (recordName && isLast) {
                breadcrumbs.push({
                    label: recordName,
                    path: isLast ? undefined : currentPath,
                    isActive: isLast,
                });
            } else {
                // Use a generic "Record #ID" label
                breadcrumbs.push({
                    label: `#${segment.substring(0, 8)}${segment.length > 8 ? '...' : ''}`,
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
// HOOK
// ============================================================================

export const useBreadcrumbs = (options: UseBreadcrumbsOptions = {}): UseBreadcrumbsResult => {
    const {
        autoUpdate = true,
        labelMap = {},
        includeHome = false,
        homePath = '/',
        homeLabel = 'Home',
        customGenerator,
        fetchRecordName = true,
        recordNameField = 'name',
    } = options;
    
    const dispatch = useDispatch();
    const location = useLocation();
    const params = useParams();
    
    // Get resource config from store
    const [resourceConfig] = useStore<IDashAutoAdminResourceConfig>('resourceConfig');
    
    // Get current page state including existing breadcrumbs
    const pageState: IPageState = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => state.page
    );
    
    // Note: Record context is not available at the layout level
    // Use the record prop in options if you need to pass record data
    const record: any = null;
    
    // Merge label maps
    const mergedLabelMap = useMemo(() => ({
        ...defaultLabelMap,
        ...labelMap,
    }), [labelMap]);
    
    // Get record name from record context
    const recordName = useMemo(() => {
        if (!fetchRecordName || !record) return undefined;
        
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
    }, [record, fetchRecordName, recordNameField, resourceConfig]);
    
    // Generate breadcrumbs
    const breadcrumbs = useMemo(() => {
        if (customGenerator) {
            return customGenerator(location.pathname, resourceConfig);
        }
        
        return generateBreadcrumbsFromPath(
            location.pathname,
            mergedLabelMap,
            resourceConfig,
            includeHome,
            homePath,
            homeLabel,
            recordName
        );
    }, [
        location.pathname,
        mergedLabelMap,
        resourceConfig,
        includeHome,
        homePath,
        homeLabel,
        recordName,
        customGenerator,
    ]);
    
    // Set breadcrumbs action
    const setBreadcrumbs = useCallback((items: IBreadcrumbItem[]) => {
        dispatch(DASH_REDUX_ACTIONS.updatePage({ breadcrumbs: items }));
    }, [dispatch]);
    
    // Add breadcrumb action
    const addBreadcrumb = useCallback((item: IBreadcrumbItem) => {
        const currentBreadcrumbs = pageState.breadcrumbs || [];
        dispatch(DASH_REDUX_ACTIONS.updatePage({ 
            breadcrumbs: [...currentBreadcrumbs, item] 
        }));
    }, [dispatch, pageState.breadcrumbs]);
    
    // Clear breadcrumbs action
    const clearBreadcrumbs = useCallback(() => {
        dispatch(DASH_REDUX_ACTIONS.updatePage({ breadcrumbs: [] }));
    }, [dispatch]);
    
    // Auto-update breadcrumbs on route change
    useEffect(() => {
        if (autoUpdate && breadcrumbs.length > 0) {
            setBreadcrumbs(breadcrumbs);
        }
    }, [autoUpdate, breadcrumbs, setBreadcrumbs]);
    
    return {
        breadcrumbs: pageState.breadcrumbs || breadcrumbs,
        setBreadcrumbs,
        addBreadcrumb,
        clearBreadcrumbs,
        pathname: location.pathname,
    };
};

export default useBreadcrumbs;
