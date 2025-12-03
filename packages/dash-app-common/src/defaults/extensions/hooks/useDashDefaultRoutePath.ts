/**
 * useDashDefaultRoutePath Hook
 * 
 * Hook to calculate and track route path
 */
import { useState, useEffect } from 'react';
import { dashStorage } from 'dash-utils';
import { DASHAdminSystemConstants } from 'dash-constants';

export const useDashDefaultRoutePath = (appPath: string | null, commonAppPath?: string) => {
    const [routePath, setRoutePath] = useState<string>('');

    useEffect(() => {
        const path = appPath || (commonAppPath || DASHAdminSystemConstants.system.URL_PREFIX);
        const cleanPath = path.replace(/\/\*$/, '');
        dashStorage.setItem('currentAppPath', cleanPath);
        console.log('ROUTE-BASE-PATH:', cleanPath);
        setRoutePath(path);
    }, [appPath, commonAppPath]);

    return routePath;
};

export default useDashDefaultRoutePath;
