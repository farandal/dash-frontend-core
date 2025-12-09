import { ITenantMarketplace } from "../schemas/tenantMarketplace";
import { Alert, Paper, AlertTitle, ButtonGroup, Card } from "@mui/material";
import { DashAutoFormGroups, DashAutoFormMuiTabs, DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';
import { useDialog } from "dash-dialog";
import { AppDialogOptions } from "dash-dialog/src/IAppDialogProps";
import React, { useState, useEffect } from "react";
import { useRecordContext, useGetOne, useRedirect, useRefresh, useNotify, Loading, Button } from "react-admin";
import { useController, useWatch, useFormContext } from "react-hook-form";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";
import { DASHAdminSystemConstants } from "dash-constants";
import MultiLevelTable from "../MultiLevelTable";
import nativeAxios from 'axios';

const TenantMarketplaceConnectionOptionsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    return <Alert severity="info">Ingrese un nombre antes de configurar la integración</Alert>
}

const getDescendantProp = (obj, desc) => {
    var arr = desc.split(".");
    while (arr.length && (obj = obj[arr.shift()]));
    return obj;
}
const CustomReadOnlyField: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, option }) => {
    let record = useRecordContext();

    return <Paper elevation={1}
        style={{ padding: "5px", margin: "0px 0px 8px 0px" }}
    ><div><b>{attribute.label}</b></div> <div>{getDescendantProp(record, attribute.attribute)}</div></Paper>

}

const TenantMarketplaceConnectionOptionsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const record: ITenantMarketplace = useRecordContext();
    const dialog = useDialog();
    const { getValues } = useFormContext();
    const refresh = useRefresh();
    const notify = useNotify();
    const axios = useAxios();

    // Always initialize these hooks, regardless of conditions
    const useCustomConnection = useController({ name: 'connection_params.use_custom_connection' });
    const useCustomAppValue = useWatch({ name: "connection_params.use_custom_connection" });

    const [showForm, setShowForm] = useState<boolean>(false);
    const [usesCustomConnetion, setUsesCustomConnection] = useState<boolean>(false);
    const [currentUseCustomConnection, setCurrentUseCustomConnection] = useState<boolean>(false);
    const [connectionOptionSchema, setConnectionOptionSchema] = useState<any>(null);
    const [infoSchema, setInfoSchema] = useState<any>(null);
    const [availableData, setAvailableData] = useState<boolean>(false);

    const successDialog = (message = "", options?: Partial<AppDialogOptions>) => {
        dialog(
            {
                variant: "info",
                title: "Conexión realizada exitosamente",
                content: message,
                ...options
            })
    }

    const errorDialog = (message, options?: Partial<AppDialogOptions>) => {
        dialog(
            {
                variant: "danger",
                title: "Ha ocurrido un error.",
                content: message,
                ...options
            })
    }

    // Always call useGetOne, even if record is not available yet
    const {
        data: connectionFormat,
        isLoading: connectionFormatLoading,
        error: connectionFormatError
    } = useGetOne(
        "ecommerce/marketplace/" + (record?.id || 'placeholder') + "/connectionParamFormats",
        {
            id: record?.tenant_system_marketplace_id || 'placeholder',
            meta: {
                use_custom_connection: useCustomConnection?.field?.value || false
            }
        },
        {
            refetchOnWindowFocus: false,
            enabled: !!record?.id // Only enable the query when record.id is available
        }
    );

    const getSettings = async () => {
        if (!record?.id) return;

        try {
            const url = DASHAdminSystemConstants.system.API_URL + "/api/ecommerce/marketplace/" + record.id + "/oauth/getSettings";
            const response = await axios.get(url);
            console.log("getSettings", response);
            refresh();
            notify("Configuración obtenida exitosamente", { type: 'success' });
        } catch (error) {
            console.error("Error getting settings:", error);
            notify("Error al obtener la configuración", { type: 'error' });
        }
    }

    const getTenantMarketplaceConnectionURL = async () => {
        if (!record?.id) return;
     
        const getTenantMarketplaceConnectionURL = DASHAdminSystemConstants.system.API_URL + "/api/ecommerce/marketplace/" + record.id + "/oauth/setUpConnection";

        try {
            const response = await axios.post(getTenantMarketplaceConnectionURL);

            if (response.data && response.data.method === "TOKEN") {
                // Assumed success, continue...
                successDialog();
                refresh();
            } else if (response.data && response.data.auth_url) {
                try {
                    // This request performs OAuth authentication using the provided credentials and parameters
                    const oauthResponse = await nativeAxios.request({
                        url: response.data.auth_url,
                        method: response.data.method,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: new URLSearchParams(response.data.params)
                    });

                    successDialog();
                    refresh();
                    return oauthResponse.data;
                } catch (error) {
                    errorDialog(JSON.stringify(error));
                    console.error('OAuth request failed:', error);
                } finally {
                    notify("Proceso de conexión finalizado");
                }
            } else {
                // For other cases handle success
                successDialog();
                refresh();
            }
        } catch (e: any) {
            console.error("getTenantMarketplaceConnectionURL", e);
            const response = e.response;

            if (!response) {
                errorDialog("Error de conexión. Por favor intente nuevamente.");
                return;
            }

            switch (response.status) {
                case 301:
                    console.log("REDIRECT", response.data.auth_url);
                    window.location = response.data.auth_url;
                    break;
                case 422:
                    errorDialog(response.data.response?.body || response.data.message || "Error");
                    break;
                case 500:
                    errorDialog(response.data.message);
                    break;
                default:
                    errorDialog(response.data.message || e.message || "Ha ocurrido un error, vuelva a intentarlo.");
                    break;
            }
        } finally {
            notify("Proceso de conexión finalizado");
        }
    }

    // Effect for record changes
    useEffect(() => {
        if (record) {
            setShowForm(true);

            if (record.connection_params) {
                setAvailableData(true);
            }
        }
    }, [record]);

    // Effect for connection format changes
    useEffect(() => {
        if (connectionFormat?.format && !connectionFormatLoading && record) {
            let parsedSchema = connectionFormat.format.map((entry) => {
                console.log("FORMAT", entry);

                const defaultValue = (record.connection_params && record.connection_params[entry.attribute]) ?? false;

                return {
                    ...entry,
                    ...(method === "edit" && record?.connection_params && {
                        readOnly: !entry.editable
                    }),
                    ...(!entry.editable && { custom: true, component: CustomReadOnlyField }),
                    ...(method === "edit" && record?.connection_params && defaultValue && {
                        fieldOptions: {
                            defaultValue: defaultValue,
                            size: "small"
                        }
                    })
                }
            });

            console.log("SCHEMA", parsedSchema);
            setConnectionOptionSchema(parsedSchema);

            let infoSchema = connectionFormat?.info ? connectionFormat.info.map((entry) => {
                const defaultValue = entry?.value ?? null;
                return {
                    ...entry,
                    readOnly: true,
                    ...(defaultValue && {
                        fieldOptions: {
                            defaultValue: defaultValue,
                            size: "small"
                        }
                    }),
                    value: defaultValue
                }
            }) : null;

            console.log("INFO SCHEMA", infoSchema);
            setInfoSchema(infoSchema);

            let _usesCustomConnection: boolean = connectionFormat?.custom_params_connection_allowed;
            let current_use_custom_connection = record?.connection_params?.use_custom_connection ?? false
            setCurrentUseCustomConnection(current_use_custom_connection);
            setUsesCustomConnection(_usesCustomConnection);
            setShowForm(_usesCustomConnection);
        }
    }, [connectionFormat, connectionFormatLoading, record, method]);

    // Effect for custom app value changes
    useEffect(() => {
        if (useCustomAppValue !== undefined) {
            setShowForm(useCustomAppValue);
        }
    }, [useCustomAppValue]);

    //if (!record?.tenantSystemMarketplace || connectionFormatLoading) return <Loading />;

    return (
        <>
            <Card
                style={{
                    padding: "8px",
                    textAlign: "left",
                    flex: 1
                }}
            >
                {infoSchema ? DashAutoFormGroups({
                    schema: infoSchema,
                    resourceConfig: null,
                    options: {
                        mode: "view",
                        label: "Información",
                        readOnlyComponent: (props) => {
                            return <Alert severity="info">
                                <AlertTitle>{props.input.label}</AlertTitle>
                                {typeof props.input.value === "string" ? <div dangerouslySetInnerHTML={{ __html: props.input.value }} /> : <MultiLevelTable data={props.input.value} />}
                            </Alert>
                        }
                    }
                }) : <></>}
            </Card>

            <Card
                style={{
                    padding: "8px",
                    textAlign: "left",
                    flex: 1
                }}
            >
                {connectionOptionSchema ?
                    DashAutoFormMuiTabs({
                        schema: connectionOptionSchema,
                        resourceConfig: null,
                        options: {
                            meta: { tabs: "mui" },
                            mode: "edit",
                            useReadOnlyInputAsTextField: true,
                            label: "Opciones de conexión"
                        }
                    })
                    :
                    <></>}
            </Card>

            <Card
                style={{
                    padding: "8px",
                    textAlign: "left",
                    flex: 1
                }}
            >
                {(method === "edit" && (record?.connection_params)) ?
                    <>
                        <Button variant="contained" onClick={() => getTenantMarketplaceConnectionURL()}>
                            {record.active ? "Re-Establecer conexión / renovar token" : "Establecer conexión - obtener token"}
                        </Button>
                        <Button variant="contained" onClick={() => getSettings()}>
                            Obtener configuración
                        </Button>
                    </>
                    :
                    <></>}
            </Card>
        </>
    );
}

const TenantMarketplaceConnectionOptionsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const record: ITenantMarketplace = useRecordContext();
    return (
        <>
            <MUISimpleJsonTable vertical tableData={record?.connection_params} />
        </>
    );
}

const TenantMarketplaceConnectionOptions = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <TenantMarketplaceConnectionOptionsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "view":
            return <TenantMarketplaceConnectionOptionsView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "create":
            return <TenantMarketplaceConnectionOptionsCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
}

export default TenantMarketplaceConnectionOptions;
