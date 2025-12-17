/**
 * Data Provider Utilities
 *
 * Helper functions for data provider operations.
 * These utilities are used by data providers across Dash applications.
 */

/**
 * Generic resource configuration interface
 * Apps can extend this with their own properties
 */
export interface IResourceConfig {
    model?: string;
    isFormData?: boolean;
    dataTransform?: (data: Record<string, any>, operation: string) => Record<string, any>;
    [key: string]: any;
}

/**
 * Resource configuration manager
 * Manages resource configurations for data provider operations
 */
class ResourceConfigManager<T extends IResourceConfig = IResourceConfig> {
    private configs: T[] = [];

    /**
     * Set resource configurations
     */
    setConfigs(configs: T[]): void {
        this.configs = configs;
    }

    /**
     * Get all resource configurations
     */
    getConfigs(): T[] {
        return this.configs;
    }

    /**
     * Get resource configuration by resource path
     */
    getConfig(resource: string): T | undefined {
        // Try to find by model path (exact match)
        const config = this.configs.find(r => r.model === resource);
        if (config) return config;

        // Try to find by matching the resource path (partial match)
        return this.configs.find(r => {
            const modelPath = r.model || '';
            return resource.startsWith(modelPath) || modelPath.startsWith(resource);
        });
    }

    /**
     * Clear all configurations
     */
    clear(): void {
        this.configs = [];
    }
}

// Singleton instance
let resourceConfigManager: ResourceConfigManager | null = null;

/**
 * Get the resource config manager instance
 */
export const getResourceConfigManager = <T extends IResourceConfig = IResourceConfig>(): ResourceConfigManager<T> => {
    if (!resourceConfigManager) {
        resourceConfigManager = new ResourceConfigManager<T>();
    }
    return resourceConfigManager as ResourceConfigManager<T>;
};

/**
 * Set resource configurations (convenience function)
 */
export const setResourceConfigs = <T extends IResourceConfig = IResourceConfig>(configs: T[]): void => {
    getResourceConfigManager<T>().setConfigs(configs);
};

/**
 * Get resource configuration by resource path (convenience function)
 */
export const getResourceConfig = <T extends IResourceConfig = IResourceConfig>(resource: string): T | undefined => {
    return getResourceConfigManager<T>().getConfig(resource);
};

/**
 * Process post data before sending to backend
 * Applies resource-specific transformations
 */
export const processPostData = <T extends IResourceConfig = IResourceConfig>(
    resource: string,
    data: Record<string, any>,
    operation: 'create' | 'update' | 'getList' | 'import' | string
): Record<string, any> => {
    const config = getResourceConfig<T>(resource);

    // Clone data to avoid mutations
    let processedData = { ...data };

    // Remove undefined values for cleaner payloads
    Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined) {
            delete processedData[key];
        }
    });

    // Apply resource-specific transformations if defined
    if (config?.dataTransform) {
        processedData = config.dataTransform(processedData, operation);
    }

    return processedData;
};

/**
 * Process data into FormData for file uploads
 */
export const processFormData = (
    resource: string,
    data: Record<string, any>
): FormData => {
    const formData = new FormData();

    const appendToFormData = (key: string, value: any, prefix = ''): void => {
        const fieldName = prefix ? `${prefix}[${key}]` : key;

        if (value === null || value === undefined) {
            return;
        }

        if (value instanceof File) {
            formData.append(fieldName, value);
        } else if (typeof FileList !== 'undefined' && value instanceof FileList) {
            Array.from(value).forEach((file, index) => {
                formData.append(`${fieldName}[${index}]`, file);
            });
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (typeof item === 'object' && !(item instanceof File)) {
                    Object.keys(item).forEach(itemKey => {
                        appendToFormData(itemKey, item[itemKey], `${fieldName}[${index}]`);
                    });
                } else {
                    formData.append(`${fieldName}[${index}]`, item);
                }
            });
        } else if (typeof value === 'object' && !(value instanceof Date)) {
            if (value.rawFile && value.rawFile instanceof File) {
                formData.append(fieldName, value.rawFile);
            } else {
                Object.keys(value).forEach(objKey => {
                    appendToFormData(objKey, value[objKey], fieldName);
                });
            }
        } else if (typeof value === 'boolean') {
            formData.append(fieldName, value ? '1' : '0');
        } else {
            formData.append(fieldName, String(value));
        }
    };

    Object.keys(data).forEach(key => {
        appendToFormData(key, data[key]);
    });

    return formData;
};

/**
 * Build query string from params
 * Supports arrays and nested objects
 */
export const buildQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(item => {
                    searchParams.append(`${key}[]`, String(item));
                });
            } else if (typeof value === 'object') {
                searchParams.append(key, JSON.stringify(value));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    return searchParams.toString();
};

/**
 * Check if resource is configured for FormData uploads
 */
export const isFormDataResource = <T extends IResourceConfig = IResourceConfig>(
    resource: string,
    params?: { data?: { isFormData?: boolean }; meta?: { isFormData?: boolean } }
): boolean => {
    const config = getResourceConfig<T>(resource);
    return (
        config?.isFormData === true ||
        params?.data?.isFormData === true ||
        params?.meta?.isFormData === true
    );
};

export default {
    getResourceConfigManager,
    setResourceConfigs,
    getResourceConfig,
    processPostData,
    processFormData,
    buildQueryString,
    isFormDataResource
};
