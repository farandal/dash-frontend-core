import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useEffect, useState } from "react";
import { Loading, useRecordContext } from "react-admin";

import { useSystemRequestsCache } from "../../contexts/SystemRequestsCache";
import { FormTabsRenderer, SettingsSections } from "./SettingsSections";

/**
 * The Tenancy-level twin of TenantSettings.tsx — same backend-driven
 * card+drawer settings layout (shared via ./SettingsSections.tsx), reading
 * a Tenancy record's `settings` JSON column instead of a Tenant's. Feeds
 * the system app's Tenancy edit screen "AI Providers" tab (per-provider
 * system_key/tenant_key/disabled mode + the tenancy's own default-provider
 * fallback — see the backend's config/ai_tenancy_settings.php) with no
 * further frontend change if a domain adds more tenancy-level settings
 * later, the same guarantee TenantSettings.tsx already makes for Tenant.
 *
 * Requires the resource's contextComponent to wrap edit/view in
 * <SystemRequestsCache apiUrl="system/tenancy/systemSettingFormats" ...>
 * — see systemResources.tsx's `system/tenancy` resource.
 *
 * FILTERED TO tab === 'ai' — `system/tenancy/systemSettingFormats` returns
 * EVERY tenancy setting_formats entry, including core's pre-existing
 * billing-tab fields (billing_email/tax_id_type/auto_pay_enabled,
 * config/tenancies.php) that have never had a dedicated UI before this
 * component's own contextComponent wiring was added. Mirrors
 * TenantTheme.tsx's own `.filter((entry) => entry.tab === 'colors')` — this
 * component owns exactly ONE tab, not "everything the endpoint returns".
 */
const AI_PROVIDERS_TAB = 'ai';

const TenancySettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent & { tenancy: any }> = ({ method, tenancy }) => {
    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    const { formats: formatsData } = useSystemRequestsCache();

    useEffect(() => {
        if (formatsData?.data?.setting_formats) {
            const parsedSchema = formatsData.data.setting_formats
                .filter((entry: any) => entry.tab === AI_PROVIDERS_TAB && entry.visible !== false)
                .map((entry: any) => {
                    // 'settings.foo' -> 'foo', the actual key on the record.
                    const settingName = entry.attribute ? entry.attribute.replace('settings.', '') : entry.id;
                    const defaultValue = tenancy?.settings?.[settingName] ?? entry?.default_value;

                    return {
                        ...entry,
                        ...(defaultValue !== null && defaultValue !== undefined && {
                            fieldOptions: { defaultValue, fullWidth: true },
                        }),
                    };
                });

            setSettingFormatsSchema(parsedSchema);
        }
    }, [formatsData, tenancy]);

    if (!settingFormatsSchema) {
        return <Loading />;
    }

    return <SettingsSections schema={settingFormatsSchema} method={method} translationNamespace="tenancy.settings" />;
};

const TenancySettingsView: React.FC<IDashAutoAdminCustomFieldComponent & { tenancy: any }> = ({ method, tenancy }) => {
    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    const { formats: formatsData } = useSystemRequestsCache();

    useEffect(() => {
        if (formatsData?.data?.setting_formats) {
            const parsedSchema = formatsData.data.setting_formats
                .filter((entry: any) => entry.tab === AI_PROVIDERS_TAB && entry.visible !== false)
                .map((entry: any) => ({ ...entry, readOnly: true }));

            setSettingFormatsSchema(parsedSchema);
        }
    }, [formatsData]);

    if (!settingFormatsSchema) {
        return <Loading />;
    }

    return <SettingsSections schema={settingFormatsSchema} method={method} translationNamespace="tenancy.settings" />;
};

const TenancySettingsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method }) => {
    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    const { formats: formatsData, loading } = useSystemRequestsCache();

    useEffect(() => {
        if (!loading && formatsData?.data?.setting_formats) {
            setSettingFormatsSchema(
                formatsData.data.setting_formats.filter(
                    (entry: any) => entry.tab === AI_PROVIDERS_TAB && entry.visible !== false,
                ),
            );
        }
    }, [formatsData, loading]);

    if (!settingFormatsSchema) {
        return <Loading />;
    }

    return <FormTabsRenderer schema={settingFormatsSchema} method={method} label="AI Providers" />;
};

const TenancySettings = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const tenancy = useRecordContext();

    switch (method) {
        case "edit":
            return <TenancySettingsEdit attribute={attribute} method={method} tenancy={tenancy} resourceConfig={resourceConfig} />;
        case "view":
            return <TenancySettingsView attribute={attribute} method={method} tenancy={tenancy} resourceConfig={resourceConfig} />;
        case "create":
            return <TenancySettingsCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "list":
        default:
            return <></>;
    }
};

export default TenancySettings;
