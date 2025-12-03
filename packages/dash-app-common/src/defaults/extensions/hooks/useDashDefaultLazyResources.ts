/**
 * useDashDefaultLazyResources Hook
 * 
 * Hook to lazy load resources
 */
import { useState, useEffect } from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { getDASHResources } from 'dash-admin';

export const useDashDefaultLazyResources = (customResources: IDashAutoAdminResourceConfig[] | null) => {
    const [loadedResources, setLoadedResources] = useState<IDashAutoAdminResourceConfig[] | null>(null);

    useEffect(() => {
        // Only load default resources if no custom resources are provided
        if (!customResources) {
            getDASHResources()
                .then(setLoadedResources)
                .catch((error) => {
                    console.error('Failed to load DASHResources:', error);
                    setLoadedResources([]);
                });
        }
    }, [customResources]);

    // Return custom resources if provided, otherwise loaded resources
    return customResources || loadedResources;
};

export default useDashDefaultLazyResources;
