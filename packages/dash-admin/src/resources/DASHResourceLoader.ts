/**
 * DASH Resource Loader
 * 
 * Dynamic resource loading system that loads resources from a JSON manifest.
 * Supports caching to prevent redundant imports and can be configured with
 * a custom manifest path.
 * 
 * @packageDocumentation
 */
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

/**
 * Resource manifest entry interface
 */
export interface IResourceManifestEntry {
    /** Unique name identifier for the resource */
    name: string;
    /** Import path for the resource module */
    path: string;
}

/**
 * Resource loader configuration options
 */
export interface IDASHResourceLoaderConfig {
    /** Path to the resource manifest JSON file */
    manifestPath?: string;
    /** Whether to enable caching of loaded resources */
    enableCache?: boolean;
    /** Custom manifest entries to use instead of loading from file */
    customManifest?: IResourceManifestEntry[];
}

/**
 * Cache for loaded resources to prevent redundant imports
 */
let resourceCache: IDashAutoAdminResourceConfig[] | null = null;

/**
 * Clear the resource cache
 * Useful when you need to reload resources
 */
export const clearResourceCache = (): void => {
    resourceCache = null;
};

/**
 * Get cached resources if available
 */
export const getCachedResources = (): IDashAutoAdminResourceConfig[] | null => {
    return resourceCache;
};

/**
 * Load resources from a manifest
 * 
 * @param manifest - Array of resource manifest entries
 * @returns Promise resolving to array of resource configurations
 */
export const loadResourcesFromManifest = async (
    manifest: IResourceManifestEntry[]
): Promise<IDashAutoAdminResourceConfig[]> => {
    const resources: IDashAutoAdminResourceConfig[] = [];

    const loadedModules = await Promise.all(
        manifest.map(async (item) => {
            try {
                // Dynamic import of the resource module
                const module = await import(/* @vite-ignore */ item.path);
                return {
                    name: item.name,
                    module: module.default || module,
                };
            } catch (error) {
                console.error(`Failed to load resource "${item.name}" from "${item.path}":`, error);
                return null;
            }
        })
    );

    loadedModules.forEach((loaded) => {
        if (loaded && loaded.module) {
            // Handle both single resource and array of resources
            if (Array.isArray(loaded.module)) {
                resources.push(...loaded.module);
            } else {
                resources.push(loaded.module);
            }
        }
    });

    return resources;
};

/**
 * Default manifest loader that imports the manifest from a path
 * 
 * @param manifestPath - Path to the manifest JSON file
 * @returns Promise resolving to array of manifest entries
 */
export const loadManifest = async (
    manifestPath: string
): Promise<IResourceManifestEntry[]> => {
    try {
        const manifestModule = await import(/* @vite-ignore */ manifestPath);
        return manifestModule.default || manifestModule;
    } catch (error) {
        console.error(`Failed to load manifest from "${manifestPath}":`, error);
        return [];
    }
};

/**
 * Create a resource loader function with configuration
 * 
 * @param config - Resource loader configuration
 * @returns Async function that returns loaded resources
 * 
 * @example
 * ```tsx
 * // Using manifest file path
 * const getResources = createDASHResourceLoader({
 *     manifestPath: '@app/resourceManifest.json'
 * });
 * 
 * // Using custom manifest array
 * const getResources = createDASHResourceLoader({
 *     customManifest: [
 *         { name: 'todoResource', path: '@app/resources/todoResource' }
 *     ]
 * });
 * 
 * // Then use it
 * const resources = await getResources();
 * ```
 */
export const createDASHResourceLoader = (
    config: IDASHResourceLoaderConfig = {}
): (() => Promise<IDashAutoAdminResourceConfig[]>) => {
    const { manifestPath, enableCache = true, customManifest } = config;

    return async (): Promise<IDashAutoAdminResourceConfig[]> => {
        // Return cached resources if caching is enabled and cache exists
        if (enableCache && resourceCache) {
            return resourceCache;
        }

        let manifest: IResourceManifestEntry[];

        if (customManifest) {
            // Use custom manifest if provided
            manifest = customManifest;
        } else if (manifestPath) {
            // Load manifest from file path
            manifest = await loadManifest(manifestPath);
        } else {
            console.warn('No manifest path or custom manifest provided to resource loader');
            return [];
        }

        const resources = await loadResourcesFromManifest(manifest);

        // Cache the results if caching is enabled
        if (enableCache) {
            resourceCache = resources;
        }

        return resources;
    };
};

/**
 * Default resource loader using @app/resourceManifest.json
 * This is a convenience export for the most common use case.
 */
export const getDASHResources = createDASHResourceLoader({
    manifestPath: '@app/resourceManifest.json',
});

export default createDASHResourceLoader;
