import { DashAutoFormGroups, DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { useGetList, Loading, useRecordContext } from "react-admin";
import { useAxios } from 'dash-axios-hook';
import { useFormContext, useWatch } from "react-hook-form";
import { Tenant } from "../../interfaces/Tenant";
import MUISimpleJsonTable from "../misc/MuiSimpleJsonTable";
import { useTenantSettingsFormats } from "./TenantSettingsContext";
import { useSystemRequestsCache } from "../../contexts/SystemRequestsCache";

const TenantSettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, tenant }) => {
    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    const formContext = useFormContext();
    const formValues = useWatch({
        control: formContext.control
    });

    const { formats: formatsData, loading } = useSystemRequestsCache();

    useEffect(() => {
      
        if (formatsData && formatsData.data && formatsData.data.setting_formats) {

            const parsedSchema = formatsData.data.setting_formats
                .filter((entry) => entry.tab !== 'colors')
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
    
        {settingFormatsSchema ? (
            DashAutoFormTabs({
                schema: settingFormatsSchema, resourceConfig: null, options: {
                    mode: method,
                    label: 'Opciones de configuración',
                }
            })
        ) : (
            <></>
        )}
    </section>

    //return <>{DashAutoFormGroups(settingFormatsSchema, null, { mode: method, useReadOnlyInputAsTextField: true, label: "Opciones de configuración", meta: {dynamic: true} })}</>


}

const TenantSettingsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
    const formContext = useFormContext();
    const formValues = useWatch({
        control: formContext.control
    });


    const { formats: formatsData, loading } = useSystemRequestsCache();

    useEffect(() => {

        if (!loading && formatsData && formatsData.data && formatsData.data.setting_formats) {
            const parsedSchema = formatsData.data.setting_formats
                .filter((entry) => entry.tab !== 'colors')
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

        {settingFormatsSchema ? (
            DashAutoFormTabs({
                schema: settingFormatsSchema, resourceConfig: null, options: {
                    mode: method,
                    label: 'Opciones de configuración',
                }
            })
        ) : (
            <></>
        )}
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
                .filter((entry) => entry.tab !== 'colors')
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
