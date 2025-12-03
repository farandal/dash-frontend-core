/**
 * Resource Loader Utility
 *
 * Provides a generic mechanism for lazy-loading and caching resources.
 * Useful for loading React-Admin resource configurations on demand.
 */

/**
 * Creates a resource loader with caching support
 *
 * @param loadFn - Async function that loads the resources
 * @returns Object with getResources() method and cached resources array
 *
 * @example
 * ```typescript
 * const { getResources, resources } = createResourceLoader(async () => {
 *     const [{ default: systemResources }, { default: todoResource }] = await Promise.all([
 *         import('dash-admin/src/systemResources'),
 *         import('@app/resources/demo/todoResource'),
 *     ]);
 *     return [...systemResources, todoResource];
 * });
 *
 * // Async usage (recommended)
 * const allResources = await getResources();
 *
 * // Sync usage (returns cached or empty array)
 * const cachedResources = resources;
 * ```
 */
export const createResourceLoader = <T>(
    loadFn: () => Promise<T[]>
): {
    getResources: () => Promise<T[]>;
    resources: T[];
    clearCache: () => void;
    isLoaded: () => boolean;
} => {
    let cachedResources: T[] | null = null;
    let loadingPromise: Promise<T[]> | null = null;

    const getResources = async (): Promise<T[]> => {
        // Return cached if available
        if (cachedResources) {
            return cachedResources;
        }

        // If already loading, return the existing promise to avoid duplicate loads
        if (loadingPromise) {
            return loadingPromise;
        }

        // Start loading
        loadingPromise = loadFn().then((resources) => {
            cachedResources = resources;
            loadingPromise = null;
            return resources;
        }).catch((error) => {
            loadingPromise = null;
            console.error('Failed to load resources:', error);
            throw error;
        });

        return loadingPromise;
    };

    const clearCache = (): void => {
        cachedResources = null;
        loadingPromise = null;
    };

    const isLoaded = (): boolean => {
        return cachedResources !== null;
    };

    // Return empty array for sync access, will be populated after getResources() is called
    const resources: T[] = [];

    return {
        getResources,
        resources,
        clearCache,
        isLoaded,
    };
};

/**
 * Simple resource loader for cases where you just need the async getter
 *
 * @param loadFn - Async function that loads the resources
 * @returns Async function that returns cached resources
 */
export const createSimpleResourceLoader = <T>(
    loadFn: () => Promise<T[]>
): (() => Promise<T[]>) => {
    let cache: T[] | null = null;

    return async (): Promise<T[]> => {
        if (cache) {
            return cache;
        }
        cache = await loadFn();
        return cache;
    };
};

export default createResourceLoader;
