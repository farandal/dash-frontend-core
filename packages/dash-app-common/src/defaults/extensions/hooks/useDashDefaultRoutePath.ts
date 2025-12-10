/**
 * useDashDefaultRoutePath Hook
 * 
 * Hook to calculate and track route path
 * 
 * @deprecated The currentAppPath storage logic has been removed to fix path duplication issues.
 * This hook now only returns the route path without storing it.
 */
import { useState, useEffect } from 'react';
import { DASHAdminSystemConstants } from 'dash-constants';

export const useDashDefaultRoutePath = (appPath: string | null, commonAppPath?: string) => {
    const [routePath, setRoutePath] = useState<string>('');

    useEffect(() => {
        const path = appPath || (commonAppPath || DASHAdminSystemConstants.system.URL_PREFIX);
        const cleanPath = path.replace(/\/\*$/, '');
        // @deprecated - removed currentAppPath storage that caused path duplication
        // dashStorage.setItem('currentAppPath', cleanPath);
        console.log('ROUTE-BASE-PATH:', cleanPath);
        setRoutePath(path);
    }, [appPath, commonAppPath]);

    return routePath;
};

export default useDashDefaultRoutePath;
