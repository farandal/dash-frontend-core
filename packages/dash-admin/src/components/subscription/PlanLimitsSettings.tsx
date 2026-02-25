import { DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect } from "react";
import { Loading, useRecordContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import MUISimpleJsonTable from "../misc/MuiSimpleJsonTable";
import { useSubscriptionPlanFormats } from "../../contexts/SubscriptionPlanFormatsProvider";

/**
 * PlanLimitsSettings Component
 * 
 * A dynamic form component for managing subscription plan limits.
 * Similar to TenantSettings, this component reads limit definitions from a backend config
 * and renders appropriate form fields for each limit type (boolean, integer, etc.)
 * 
 * Usage:
 * - In edit mode: Renders form fields for each limit defined in subscription_plans.limit_formats
 * - In view mode: Displays the current limits as a table
 * - In create mode: Renders form fields with default values
 */

interface LimitFormat {
    id: string;
    group: string;
    tab: string;
    attribute: string;
    label: string;
    visible: boolean;
    required: boolean;
    type: 'boolean' | 'integer' | 'string' | 'select';
    editable: boolean;
    rules: string;
    default_value: any;
    description?: string;
}

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    limits?: Record<string, any>;
    [key: string]: any;
}

const PlanLimitsSettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const [limitsSchema, setLimitsSchema] = useState<any>(null);
    const plan: SubscriptionPlan = useRecordContext();
    const formContext = useFormContext();
    
    useWatch({
        control: formContext.control
    });

    const { formats: formatsData, loading } = useSubscriptionPlanFormats();

    useEffect(() => {
        // formatsData is the raw API response: { formats: [...], grouped: {...}, tabs: [...] }
        if (formatsData && formatsData.formats) {
            const parsedSchema = (formatsData.formats as LimitFormat[])
                .filter((entry) => entry.visible !== false)
                .map((entry) => {
                    // Extract the actual limit name from 'limits.limit_name'
                    const limitName = entry.attribute ? entry.attribute.replace('limits.', '') : entry.id;

                    // Get current value from plan or use default
                    const currentValue = plan?.limits?.[limitName] ?? entry.default_value;

                    return {
                        ...entry,
                        fieldOptions: {
                            defaultValue: currentValue,
                            fullWidth: true,
                            helperText: entry.description,
                        },
                        ...(method === 'view' && {
                            readOnly: true,
                        }),
                    };
                });

            console.log('PlanLimitsSettings SCHEMA', parsedSchema);
            setLimitsSchema(parsedSchema);
        }
    }, [formatsData, plan]);

    if (loading) return <Loading />;

    return (
        <section>
            {limitsSchema ? (
                DashAutoFormTabs({
                    schema: limitsSchema,
                    resourceConfig: null,
                    options: {
                        mode: method,
                        label: 'Plan Limits Configuration',
                    }
                })
            ) : null}
        </section>
    );
};

const PlanLimitsSettingsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const [limitsSchema, setLimitsSchema] = useState<any>(null);
    const formContext = useFormContext();
    
    useWatch({
        control: formContext.control
    });

    const { formats: formatsData, loading } = useSubscriptionPlanFormats();

    useEffect(() => {
        // formatsData is the raw API response: { formats: [...], grouped: {...}, tabs: [...] }
        if (!loading && formatsData && formatsData.formats) {
            const parsedSchema = (formatsData.formats as LimitFormat[])
                .filter((entry) => entry.visible !== false)
                .map((entry) => ({
                    ...entry,
                    fieldOptions: {
                        defaultValue: entry.default_value,
                        fullWidth: true,
                        helperText: entry.description,
                    },
                }));

            setLimitsSchema(parsedSchema);
        }
    }, [formatsData, loading]);

    if (loading) return <Loading />;

    return (
        <section>
            {limitsSchema ? (
                DashAutoFormTabs({
                    schema: limitsSchema,
                    resourceConfig: null,
                    options: {
                        mode: method,
                        label: 'Plan Limits Configuration',
                    }
                })
            ) : null}
        </section>
    );
};

const PlanLimitsSettingsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const plan: SubscriptionPlan = useRecordContext();
    const [parsedValues, setParsedValues] = useState<any>(null);
    
    const { formats: formatsData, loading } = useSubscriptionPlanFormats();

    const parseValue = (value: any, type: string) => {
        if (value === null || value === undefined || value === -1) {
            return "Unlimited";
        }
        switch (type) {
            case "boolean":
                return value ? "✓ Enabled" : "✗ Disabled";
            case "integer":
                return typeof value === 'number' ? value.toLocaleString() : value;
            default:
                return value;
        }
    };

    useEffect(() => {
        // formatsData is the raw API response: { formats: [...], grouped: {...}, tabs: [...] }
        if (formatsData?.formats && plan) {
            const object: Record<string, React.ReactNode> = {};
            
            (formatsData.formats as LimitFormat[])
                .filter((entry) => entry.visible !== false)
                .forEach((entry) => {
                    const limitName = entry.attribute ? entry.attribute.replace('limits.', '') : entry.id;
                    const value = plan.limits?.[limitName] ?? entry.default_value;
                    object[entry.label] = <>{parseValue(value, entry.type)}</>;
                });

            setParsedValues(object);
        }
    }, [formatsData, plan]);

    if (loading) return <Loading />;

    return parsedValues ? (
        <MUISimpleJsonTable tableData={parsedValues} vertical={true} />
    ) : (
        <Loading />
    );
};

/**
 * Main PlanLimitsSettings component
 * Renders the appropriate sub-component based on the form mode (edit, view, create)
 */
const PlanLimitsSettings: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
    method, 
    attribute, 
    resourceConfig 
}) => {
    switch (method) {
        case "edit":
            return <PlanLimitsSettingsEdit 
                attribute={attribute} 
                method={method} 
                resourceConfig={resourceConfig} 
            />;
        case "view":
            return <PlanLimitsSettingsView 
                attribute={attribute} 
                method={method} 
                resourceConfig={resourceConfig} 
            />;
        case "create":
            return <PlanLimitsSettingsCreate 
                attribute={attribute} 
                method={method} 
                resourceConfig={resourceConfig} 
            />;
        case "list":
            return null;
        default:
            return null;
    }
};

export default PlanLimitsSettings;
