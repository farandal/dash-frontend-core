/**
 * Menu State Initialization Hook
 *
 * Hook to initialize menu/navigation state from localStorage
 * and sync it with Redux store.
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { dashStorage } from '../utils/dashDtorage';

/**
 * Options for the useMenuStateInit hook
 */
export interface UseMenuStateInitOptions {
    /** Storage key for nav expanded state */
    navExpandedKey?: string;
    /** Storage key for nav size */
    navSizeKey?: string;
    /** Redux action creator for setting nav expanded */
    setNavExpandedAction?: (isExpanded: boolean) => any;
    /** Redux action creator for setting nav size */
    setNavSizeAction?: (size: string) => any;
}

/**
 * Default options
 */
const defaultOptions: UseMenuStateInitOptions = {
    navExpandedKey: 'dashNavExpanded',
    navSizeKey: 'dashNavSize',
};

/**
 * Hook to initialize menu state from localStorage
 * Reads persisted navigation state and dispatches Redux actions
 */
export const useMenuStateInit = (options: UseMenuStateInitOptions = {}) => {
    const dispatch = useDispatch();
    const {
        navExpandedKey = defaultOptions.navExpandedKey!,
        setNavExpandedAction
    } = options;

    useEffect(() => {
        if (!setNavExpandedAction) return;

        try {
            const savedNavState = dashStorage.getItem(navExpandedKey);
            if (savedNavState !== null) {
                const isExpanded = savedNavState === 'true';
                dispatch(setNavExpandedAction(isExpanded));
            }
        } catch (e) {
            console.error('Error accessing localStorage:', e);
        }
    }, [dispatch, navExpandedKey, setNavExpandedAction]);
};

/**
 * Initialize menu state without Redux (returns state)
 * Useful for initial state setup
 */
export const getInitialMenuState = (navExpandedKey: string = 'dashNavExpanded') => {
    try {
        const savedNavState = dashStorage.getItem(navExpandedKey);
        return savedNavState !== null ? savedNavState === 'true' : true;
    } catch (e) {
        console.error('Error accessing localStorage:', e);
        return true;
    }
};

/**
 * Get initial nav size from localStorage
 */
export const getInitialNavSize = (navSizeKey: string = 'dashNavSize') => {
    try {
        return dashStorage.getItem(navSizeKey) || 'small';
    } catch (e) {
        console.error('Error accessing localStorage:', e);
        return 'small';
    }
};

export default useMenuStateInit;
