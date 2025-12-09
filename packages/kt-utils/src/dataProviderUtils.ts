/**
 * Data provider utilities for form data processing
 */

import DASHStorageClass from 'dash-admin/src/classes/DASHStorageClass';
import { IDashAutoAdminAttribute, IDashAutoAdminResourceConfig } from 'dash-auto-admin';

/**
 * Retrieves the resource configuration for the specified model.
 * 
 * @param model - The name of the model to retrieve the resource configuration for.
 * @returns The resource configuration for the specified model.
 */
export const getResourceConfig = (model: string): IDashAutoAdminResourceConfig | undefined => {
    const resources = DASHStorageClass.resources;
    const normalizedModel = model.replace(/\/\d+$/, '');
    return resources.find((resource: IDashAutoAdminResourceConfig) => resource.model === normalizedModel);
};

/**
 * Processes form data for a given resource and parameters.
 * 
 * @param resource - The name of the resource to process the form data for.
 * @param params - The parameters to include in the form data.
 * @returns A FormData object containing the processed form data.
 */
export const processFormData = (resource: string, params: any): FormData => {
    const debug = true;
    const resourceConfig = getResourceConfig(resource);

    if (debug) console.log(`Processing form data for resource: ${resource}`);
    const form = new FormData();

    if (debug) console.log('Starting to process parameters:', params);

    Object.entries(params).forEach((element) => {
        const [key, value]: [string, any] = element;

        if (value !== undefined) {
            if (debug) console.log(`Processing field: ${key} with value:`, value);

            if (Array.isArray(value)) {
                if (debug) console.log(`Field ${key} is an array`);
                if (!value.length) {
                    if (debug) console.log(`Empty array for ${key}, adding empty string`);
                    form.append(key + '[]', '');
                    return;
                } else {
                    if (debug) console.log(`Adding array values for ${key}`);
                    value.forEach((val) => {
                        form.append(key + '[]', val);
                    });
                    return;
                }
            } else if (!!value && typeof value === "object" && !(value instanceof File)) {
                if (debug) console.log(`Field ${key} is a nested object`);
                const _objKeys = Object.keys(value);
                _objKeys.forEach((objKey) => {
                    if (debug) console.log(`Adding nested object key ${objKey} for ${key}`);
                    form.append(key + '[' + objKey + ']', value[objKey]);
                });
                return;
            }

            if (value === undefined || value === null) {
                if (debug) console.log(`Skipping ${key} as value is undefined or null`);
                return;
            }

            if (resourceConfig) {
                const fieldConfig: IDashAutoAdminAttribute | undefined = resourceConfig.schema.find(
                    (field: IDashAutoAdminAttribute) => field.attribute.split(".")[0] === key,
                );

                if (!fieldConfig) {
                    if (debug) console.log(`No field config found for ${key}, adding raw value`);
                    form.append(key, value);
                    return;
                }

                if (debug) console.log(`Processing ${key} with processor: ${fieldConfig.processor}`);

                // Handle Null processor FIRST before other processors
                if (fieldConfig?.processor === 'Null') {
                    if (debug) console.log(`Processing Null processor for ${key}, value:`, value);
                    if (value === null || value === undefined || value === '' || value === 'null') {
                        if (debug) console.log(`Converting null/empty value for ${key} to empty string`);
                        form.append(key, '');
                        return;
                    }
                    // For non-null values with Null processor, still append the value
                    if (debug) console.log(`Adding non-null value for ${key}:`, value);
                    form.append(key, value);
                    return;
                }

                if (fieldConfig?.processor === 'Blob') {
                    if (debug) console.log(`Adding Blob for ${key}`);
                    form.append(key, value as Blob);
                    return;
                }

                if (fieldConfig?.processor === 'Stringify') {
                    if (debug) console.log(`Stringifying value for ${key}`);
                    form.append(key, JSON.stringify(value));
                    return;
                }

                if (fieldConfig?.processor === 'File') {
                    if (debug) console.log(`Adding File for ${key}`);
                    form.append(key, value as File);
                    return;
                }

                if (fieldConfig?.processor === 'RawFile') {
                    if (debug) console.log(`Adding RawFile for ${key}`);
                    form.append(key, value.rawFile as Blob);
                    return;
                }

                if (fieldConfig?.processor === 'Boolean') {
                    if (debug) console.log(`Converting Boolean for ${key}`);
                    form.append(key, Number(value).toString());
                    return;
                }

                if (fieldConfig?.processor === 'BooleanOnOff') {
                    if (debug) console.log(`Converting BooleanOnOff for ${key}`);
                    form.append(key, Number(value) === 1 ? 'on' : 'off');
                    return;
                }

                if (fieldConfig?.processor === 'BooleanActiveInactive') {
                    if (debug) console.log(`Converting BooleanActiveInactive for ${key}`);
                    form.append(key, Number(value) === 1 ? 'active' : 'inactive');
                    return;
                }
            }

            if (value instanceof File) {
                if (debug) console.log(`Adding File instance for ${key}`);
                form.append(key, value);
            } else if (typeof value === 'object') {
                if (debug) console.log(`Stringifying object for ${key}`);
                form.append(key, JSON.stringify(value));
            } else {
                if (debug) console.log(`Adding raw value for ${key}`);
                form.append(key, value);
            }
        }
    });

    if (debug) console.log('Form processing completed');
    return resourceConfig?.formPostFormatter
        ? (debug && console.log('Applying form post formatter'), resourceConfig.formPostFormatter(params, form))
        : form;
};

/**
 * Processes POST data for a given resource applying field processors
 */
export const processPostData = (
    resource: string,
    params: any,
    method: 'getList' | 'update' | 'create' | 'import',
): any => {
    const resourceConfig = getResourceConfig(resource);

    Object.entries(params).forEach((element) => {
        const [key, value]: [string, any] = element;

        if (resourceConfig) {
            const fieldConfig: IDashAutoAdminAttribute | undefined = resourceConfig.schema.find(
                (field: IDashAutoAdminAttribute) => field.attribute === key,
            );
            if (fieldConfig?.processor === 'Boolean') {
                params[key] = Number(value).toString();
            }

            if (fieldConfig?.processor === 'BooleanOnOff') {
                params[key] = value ? 'on' : 'off';
            }

            if (fieldConfig?.processor === 'BooleanActiveInactive') {
                params[key] = value ? 'active' : 'inactive';
            }
        }
    });

    if (resourceConfig?.postFormatter && method !== 'getList') {
        params = resourceConfig.postFormatter(params, method);
    }

    return params;
};
