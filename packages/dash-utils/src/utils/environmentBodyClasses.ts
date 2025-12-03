/**
 * Environment Body Classes Utility
 *
 * Manages body CSS classes based on the runtime environment.
 * Useful for platform-specific styling (Electron, Mac, mobile, etc.)
 */

export interface EnvironmentVars {
    PLATFORM_TYPE?: string;
    IS_ELECTRON?: boolean;
    IS_MAC?: boolean;
    IS_WINDOWS?: boolean;
    IS_LINUX?: boolean;
    PLATFORM?: string;
}

/**
 * Add environment-based classes to the document body
 * @param envVars - Environment variables object
 * @returns Cleanup function to remove the classes
 */
export const setupEnvironmentBodyClasses = (envVars: EnvironmentVars): (() => void) => {
    if (typeof document === 'undefined') {
        return () => {}; // No-op for SSR
    }

    const { PLATFORM_TYPE, IS_ELECTRON, IS_MAC, IS_WINDOWS, IS_LINUX } = envVars;
    const classesToAdd: string[] = [];

    if (PLATFORM_TYPE) {
        document.body.classList.add(PLATFORM_TYPE);
        classesToAdd.push(PLATFORM_TYPE);
    }

    if (IS_ELECTRON) {
        document.body.classList.add('electron');
        classesToAdd.push('electron');
    }

    if (IS_MAC) {
        document.body.classList.add('mac');
        classesToAdd.push('mac');
    }

    if (IS_WINDOWS) {
        document.body.classList.add('windows');
        classesToAdd.push('windows');
    }

    if (IS_LINUX) {
        document.body.classList.add('linux');
        classesToAdd.push('linux');
    }

    // Return cleanup function
    return () => {
        classesToAdd.forEach(className => {
            document.body.classList.remove(className);
        });
    };
};

/**
 * React hook for environment body classes
 * Use with useEffect to automatically clean up on unmount
 */
export const useEnvironmentBodyClasses = (envVars: EnvironmentVars): void => {
    // Note: This is a simple helper. For actual use, wrap in useEffect in your component:
    // useEffect(() => setupEnvironmentBodyClasses(envVars), [envVars]);
};

export default setupEnvironmentBodyClasses;
