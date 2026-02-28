import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';
import { Loading } from "react-admin";

const UserPreferences: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    method,
    attribute,
    resourceConfig
}) => {
    const [preferenceFormatsSchema, setPreferenceFormatsSchema] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const formContext = useFormContext();
    const formValues = useWatch({
        control: formContext.control
    });

    const axios = useAxios();

    useEffect(() => {
        const fetchPreferenceFormats = async () => {
            try {
                const response = await axios.get('/api/logistics/user/preferences/system');
                const formats = response.data.data;

                const parsedSchema = formats.map((entry: any) => {
                    // Extract the actual preference path from 'preferences.notifications.tab_created'
                    const preferencePath = entry.attribute;

                    // Get current value from form or default
                    const currentValue = formValues?.preferences ?
                        getNestedValue(formValues.preferences, preferencePath.replace('preferences.', '')) :
                        entry.default_value;

                    return {
                        ...entry,
                        fieldOptions: {
                            defaultValue: currentValue !== undefined ? currentValue : entry.default_value,
                            fullWidth: true,
                        },
                        ...(method === 'view' && {
                            readOnly: true,
                        }),
                    };
                });

                setPreferenceFormatsSchema(parsedSchema);
            } catch (error) {
                console.error('Failed to fetch preference formats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferenceFormats();
    }, [method]);

    // Helper function to get nested object value
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    if (loading) {
        return <Loading />;
    }

    if (!preferenceFormatsSchema) {
        return <div>No preference formats available</div>;
    }

    return (
        <section>
            <DashAutoFormTabs
                schema={preferenceFormatsSchema}
                resourceConfig={resourceConfig}
                options={{
                    mode: method,
                    label: 'Preferencias de Notificaciones',
                }}
            />
        </section>
    );
};

export default UserPreferences;