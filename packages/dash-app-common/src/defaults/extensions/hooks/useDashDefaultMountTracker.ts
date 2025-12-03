/**
 * useDashDefaultMountTracker Hook
 * 
 * Hook to track mount count for workaround with re-render issues
 */
import { useState, useEffect } from 'react';
import { dashStorage } from 'dash-utils';

export const useDashDefaultMountTracker = (expectedMounts: number | null) => {
    const [fullyLoaded, setFullyLoaded] = useState<boolean>(false);

    useEffect(() => {
        const currentValue = parseInt(dashStorage.getItem("tmp"), 10) || 0;
        dashStorage.setItem("tmp", String(currentValue + 1));
    }, []);

    useEffect(() => {
        if (!expectedMounts) {
            setFullyLoaded(true);
        } else if (parseInt(dashStorage.getItem("tmp"), 10) >= expectedMounts) {
            setFullyLoaded(true);
        }
    }, [expectedMounts]);

    return fullyLoaded;
};

export default useDashDefaultMountTracker;
