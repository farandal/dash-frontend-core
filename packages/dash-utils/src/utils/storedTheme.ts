/**
 * Stored Theme Utility
 *
 * Handles theme persistence and initialization in localStorage
 * and the document's data-theme attribute.
 */
import { dashStorage } from './dashDtorage';

/**
 * Get the stored theme from localStorage
 */
export const getStoredTheme = (): string | null => {
    return dashStorage.getItem('theme');
};

/**
 * Set the theme in localStorage and update the document attribute
 */
export const setStoredTheme = (theme: string): void => {
    dashStorage.setItem('theme', theme);
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
    }
};

/**
 * Initialize the theme from storage or use a default
 * Sets both localStorage and the data-theme attribute
 */
export const initializeStoredTheme = (defaultTheme: string): string => {
    const storedTheme = getStoredTheme();
    const themeToUse = storedTheme || defaultTheme;

    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', themeToUse);
    }

    if (!storedTheme) {
        dashStorage.setItem('theme', defaultTheme);
    }

    return themeToUse;
};

/**
 * Clear the stored theme
 */
export const clearStoredTheme = (): void => {
    dashStorage.removeItem('theme');
    if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-theme');
    }
};

export default {
    getStoredTheme,
    setStoredTheme,
    initializeStoredTheme,
    clearStoredTheme,
};
