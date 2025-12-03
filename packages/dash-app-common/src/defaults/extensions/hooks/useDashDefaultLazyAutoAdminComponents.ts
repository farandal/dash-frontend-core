/**
 * useDashDefaultLazyAutoAdminComponents Hook
 * 
 * Hook to load dash default auto admin components asynchronously
 */
import { useState, useEffect } from 'react';
import loadDashDefaultAutoAdminComponents from '../components/dashDefaultAutoAdminComponents';


export const useDashDefaultLazyAutoAdminComponents = () => {
    const [components, setComponents] = useState<Record<string, React.ComponentType<any>> | null>(null);

    useEffect(() => {
        loadDashDefaultAutoAdminComponents()
            .then(setComponents)
            .catch((error) => {
                console.error('Failed to load dash default auto admin components:', error);
                setComponents({});
            });
    }, []);

    return components;
};

export default useDashDefaultLazyAutoAdminComponents;
