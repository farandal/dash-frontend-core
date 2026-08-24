import { DashAutoFormGroups, DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { useGetList, Loading, useRecordContext, useTranslate } from "react-admin";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Drawer,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";



import { useAxios } from 'dash-axios-hook';
import { useFormContext, useWatch } from "react-hook-form";
import { Tenant } from "../../interfaces/Tenant";
import MUISimpleJsonTable from "../misc/MuiSimpleJsonTable";
import { useTenantSettingsFormats } from "./TenantSettingsContext";
import { useSystemRequestsCache } from "../../contexts/SystemRequestsCache";

/** Wrapper creating a React component boundary so DashAutoFormTabs hooks don't violate Rules of Hooks */
const FormTabsRenderer: React.FC<{schema: any; method: "list" | "create" | "edit" | "view"; label: string}> = ({schema, method, label}) => (
    <>{DashAutoFormTabs({schema, resourceConfig: null, options: {mode: method, label}})}</>
);


/**
 * NOTE — there is a second, behaviourally identical implementation of this
 * section-card layout in kitchntabs-frontend/packages/kt-ecommerce/src/
 * components/TenantSettings.tsx, used by the *-system apps and the
 * /tenant/tenant resource.
 *
 * They are not merged yet on purpose. Sharing this one would mean kt-ecommerce
 * importing a NEW export from dash-admin, which resolves from node_modules for
 * anyone without LINK_DASH_CORE=true — so it would break the *-system apps
 * until dash-admin is republished. Merge them in the same change that ships a
 * new dash-admin version, not before.
 */
/**
 * Split the settings schema into the cards shown on the configuration tab.
 *
 * Grouped by the `group` each setting format already declares — data-driven, so
 * this is agnostic to which product is running: a domain that ships different
 * groups gets different cards with no change here, and one that ships none at
 * all still gets a single card rather than an error.
 *
 * `group` rather than `tab`: tab is the coarser of the two, and a domain that
 * puts everything on one tab (the common case) would get no split at all.
 */
const toSettingsSections = (schema: any[]) => {
    const order: string[] = [];
    const byGroup: Record<string, any[]> = {};

    schema.forEach((entry) => {
        const key = entry.group || entry.tab || 'general';

        if (!byGroup[key]) {
            byGroup[key] = [];
            order.push(key);
        }

        byGroup[key].push(entry);
    });

    return order.map((key) => ({ key, entries: byGroup[key] }));
};

const prettifyGroup = (key: string) =>
    key.replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase());

/**
 * The configuration panel: one card per settings group, each opening a drawer.
 *
 * Replaces a single flat list that grew to whatever the backend declared —
 * unreadable once a product ships more than a handful of settings.
 *
 * ── Two things this has to get right ─────────────────────────────────────────
 *
 * keepMounted: the fields belong to the surrounding react-hook-form. Unmounting
 * a closed drawer unregisters them and drops edits made in a section the user
 * closed before saving. Context reaches through the portal, so the form itself
 * is fine — it is only unmount that loses data.
 *
 * z-index: this panel is often rendered INSIDE a Drawer already (the tenancy
 * resource opens records in one). Two Drawers both sit at theme.zIndex.modal,
 * where stacking falls to DOM order; raising this one makes it deliberate.
 *
 * Labels resolve through the translator, so a domain can name its own groups.
 * A missing key falls back to the prettified group key rather than rendering a
 * raw translation string.
 */
const SettingsSections: React.FC<{
    schema: any[];
    method: "list" | "create" | "edit" | "view";
}> = ({ schema, method }) => {
    const translate = useTranslate();
    const [openSection, setOpenSection] = useState<string | null>(null);
    const sections = toSettingsSections(schema);

    const labelFor = (key: string) =>
        translate(`tenant.settings.groups.${key}`, { _: prettifyGroup(key) });

    return (
        <section>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
            >
                {sections.map((section) => (
                    <Card key={section.key} variant="outlined">
                        <CardActionArea onClick={() => setOpenSection(section.key)}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {labelFor(section.key)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {translate('tenant.settings.option_count', {
                                        smart_count: section.entries.length,
                                        _: `${section.entries.length}`,
                                    })}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>

            {sections.map((section) => (
                <Drawer
                    key={section.key}
                    anchor="right"
                    open={openSection === section.key}
                    onClose={() => setOpenSection(null)}
                    ModalProps={{ keepMounted: true }}
                >
                    <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6">{labelFor(section.key)}</Typography>
                            <IconButton onClick={() => setOpenSection(null)} size="small" aria-label="Close">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <FormTabsRenderer schema={section.entries} method={method} label={labelFor(section.key)} />
                    </Box>
                </Drawer>
            ))}
        </section>
    );
};

const TenantSettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, tenant }) => {
    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    /*const formContext = useFormContext();
    const formValues = useWatch({
        control: formContext.control
    });*/

    const { formats: formatsData, loading } = useSystemRequestsCache();

    useEffect(() => {
     
        if (formatsData && formatsData.data && formatsData.data.setting_formats) {
         
            const parsedSchema = formatsData.data.setting_formats
                .filter((entry) => entry.tab !== 'colors' && entry.visible !== false)
                .map((entry) => {
                // Extract the actual setting name from 'settings.setting_name'
                const settingName = entry.attribute ? entry.attribute.replace('settings.', '') : entry.id;

                const defaultValue =
                    (tenant.settings && tenant.settings[settingName]) ||
                    entry?.default_value;

                return {
                    ...entry,
                    .../*method === "edit" &&*/ ((defaultValue !== null ||
                        defaultValue !== undefined) && {
                        fieldOptions: {
                            defaultValue: defaultValue,
                            fullWidth: true,
                        },
                    }),
                    ...(method === 'view' && {
                        readOnly: true,
                    }),
                };
            });

            console.log('SCHEMA', parsedSchema);
           
            setSettingFormatsSchema(parsedSchema);

        }

    }, [formatsData])

    /*useEffect(() => {
        if(settingFormatsSchema) { 
            formContext.setValue('settings_schema', settingFormatsSchema); 
        }
    }, [settingFormatsSchema]);*/

    /*const readOnlyComponent = ({...props}) => {
        return <>{props.defaultValue}</>
    }*/
    //if (!settingFormatsSchema || loading) return <Loading />
    return <section>
        {settingFormatsSchema && <SettingsSections schema={settingFormatsSchema} method={method} />}
    </section>

}

const TenantSettingsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    /*const formContext = useFormContext();
    const formValues = useWatch({
        control: formContext.control
    });*/


    const { formats: formatsData, loading } = useSystemRequestsCache();

    useEffect(() => {

        if (!loading && formatsData && formatsData.data && formatsData.data.setting_formats) {
            const parsedSchema = formatsData.data.setting_formats
                .filter((entry) => entry.tab !== 'colors' && entry.visible !== false)
                .map((entry) => ({
                ...entry,
                ...(method === 'view' && {
                    readOnly: true,
                }),
            }));

            setSettingFormatsSchema(parsedSchema);

        }

    }, [formatsData, loading])


    //if (!settingFormatsSchema || loading) return <Loading />
    return <section>
        {settingFormatsSchema && <FormTabsRenderer schema={settingFormatsSchema} method={method} label="Opciones de configuración" />}
    </section>

}

const TenantSettingsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, tenant }) => {

    const { formats: settingFormats, loading } = useTenantSettingsFormats();
    const [settingFormatsParsedValues, setSettingFormatsParsedValues] = useState<any>(null);

    const parseValue = (value) => {
        switch (typeof value) {
            case "boolean":
                return value ? "Sí" : "No";
            case "number":
            case "string":
            default:
                return value
        }
    }

    useEffect(() => {
        let object = {};
        if (settingFormats && tenant) {

            settingFormats
                .filter((entry) => entry.tab !== 'colors' && entry.visible !== false)
                .forEach((entry) => {
                const defaultValue = tenant.settings && tenant.settings.hasOwnProperty(entry.id) ? tenant.settings[entry.id] : entry?.default_value;

                object[entry.label] = <>{parseValue(defaultValue)}</>;
            });


            console.log("SCHEMA", object);

            setSettingFormatsParsedValues(object);

        }

    }, [settingFormats, tenant])


    return settingFormatsParsedValues ? <MUISimpleJsonTable tableData={settingFormatsParsedValues} vertical={true} /> : <Loading />


}

const TenantSettings = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const tenant: Tenant = useRecordContext();
    switch (method) {
        case "edit":
            return <TenantSettingsEdit attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
        case "view":
            return <TenantSettingsView attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
        case "create":
            return <TenantSettingsCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "list":
            return <></>
    }
}

export default TenantSettings;
