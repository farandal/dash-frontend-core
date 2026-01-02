/**
 * useAutoAdminTranslate Hook
 * 
 * Provides translation functionality for dash-auto-admin components.
 * Uses react-admin's useTranslate hook internally.
 * 
 * This hook handles:
 * - Translating labels that are translation keys
 * - Fallback to original label if no translation found
 * - Checking if a string looks like a translation key (contains dots)
 */

import { useTranslate } from 'react-admin';
import { useCallback, useMemo } from 'react';

/**
 * Check if a string looks like a translation key (contains dots like 'tab.resource.tabs')
 */
export const isTranslationKey = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    // Translation keys typically contain dots and are lowercase/snake_case
    // Examples: 'tab.resource.tabs', 'common.save', 'resources.users.name'
    return /^[a-z][a-z0-9_.]*[a-z0-9]$/i.test(value) && value.includes('.');
};

/**
 * Hook that provides translation utilities for dash-auto-admin
 */
export const useAutoAdminTranslate = () => {
    const translate = useTranslate();

    /**
     * Translate a label if it's a translation key, otherwise return as-is
     */
    const translateLabel = useCallback((label: string | undefined, fallback?: string): string => {
        if (!label) return fallback || '';
        
        if (isTranslationKey(label)) {
            const translated = translate(label, { _: label });
            // If translation returns the same key, it means no translation was found
            // In that case, check if we should return the label or a fallback
            if (translated === label && fallback) {
                return fallback;
            }
            return translated;
        }
        
        return label;
    }, [translate]);

    /**
     * Translate a value only if it looks like a translation key
     */
    const translateIfKey = useCallback((value: string | undefined): string => {
        if (!value) return '';
        if (isTranslationKey(value)) {
            return translate(value, { _: value });
        }
        return value;
    }, [translate]);

    /**
     * Translate with parameters
     */
    const translateWithParams = useCallback((key: string, params?: Record<string, any>): string => {
        return translate(key, params);
    }, [translate]);

    /**
     * Check if a translation exists for a key
     */
    const hasTranslation = useCallback((key: string): boolean => {
        if (!isTranslationKey(key)) return false;
        const translated = translate(key, { _: key });
        return translated !== key;
    }, [translate]);

    return useMemo(() => ({
        translate,
        translateLabel,
        translateIfKey,
        translateWithParams,
        hasTranslation,
        isTranslationKey,
    }), [translate, translateLabel, translateIfKey, translateWithParams, hasTranslation]);
};

/**
 * Standalone translation function for use outside of React components
 * Uses the translate function from React Admin context if available
 */
export const translateLabelSync = (label: string | undefined, translate: (key: string, options?: any) => string, fallback?: string): string => {
    if (!label) return fallback || '';
    
    if (isTranslationKey(label)) {
        const translated = translate(label, { _: label });
        if (translated === label && fallback) {
            return fallback;
        }
        return translated;
    }
    
    return label;
};

export default useAutoAdminTranslate;
