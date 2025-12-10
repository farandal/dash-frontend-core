import React, { useEffect, useState } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertTitle, Button, Card, Paper } from '@mui/material';

import { useRecordContext } from 'react-admin';

import { useGetOne } from 'react-admin';
import { Loading } from 'react-admin';
import { useRedirect } from 'react-admin';

import { useNotify } from 'react-admin';
import { useRefresh } from 'react-admin';

import { DashAutoFormGroups, DashAutoFormMuiTabs, IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import { AppDialogOptions } from 'dash-dialog/src/IAppDialogProps';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';
import { DASHAdminSystemConstants } from 'dash-constants';
import MultiLevelTable from '../MultiLevelTable';
import { IPointOfsale } from '../../schemas/pointOfSale';

const PointOfSaleConnectionOptionsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
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

const PointOfSaleConnectionOptionsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record: IPointOfsale = useRecordContext();
  const { setValue, getValues } = useFormContext();
  const dialog = useDialog();
  const refresh = useRefresh();
  const notify = useNotify();
  const axios = useAxios();

  // Always initialize these hooks, regardless of conditions
  const useCustomToken = useController({ name: 'connection_params.use_own_token', defaultValue: record?.connection_params?.use_own_token });
  const useCustomTokenValue = useWatch({ name: "connection_params.use_own_token" });

  const [showForm, setShowForm] = useState<boolean>(false);
  const [usesCustomConnetion, setUsesCustomConnection] = useState<boolean>(false);
  const [currentUseCustomConnection, setCurrentUseCustomConnection] = useState<boolean>(false);
  const [connectionOptionSchema, setConnectionOptionSchema] = useState<any>(null);
  const [infoSchema, setInfoSchema] = useState<any>(null);
  const [availableData, setAvailableData] = useState<boolean>(false);

  // Always call useGetOne, even if record is not available yet
  const { data: connectionFormat,
    isLoading: connectionFormatLoading,
    error: connectionFormatError } = useGetOne(
      "ecommerce/point_of_sale/" + (record?.id || 'placeholder') + "/connectionParamFormats",
      {
        id: record?.id || 'placeholder',
        meta: {
          use_own_token: useCustomToken?.field?.value || false,
          point_of_sale_id: record?.id
        }
      },
      { 
        refetchOnWindowFocus: false,
        enabled: !!record?.id // Only enable the query when record.id is available
      }
    );
  
  const redirect = useRedirect();

  const successDialog = (message = "", options?: Partial<AppDialogOptions>) => {
    dialog({
      variant: "info",
      title: "Conexión realizada exitosamente",
      content: message,
      ...options
    })
  }

  const errorDialog = (message, options?: Partial<AppDialogOptions>) => {
    dialog({
      variant: "danger",
      title: "Ha ocurrido un error.",
      content: message,
      ...options
    })
  }

  const getPointOfSaleConnectionURL = async () => {
    if (!record?.id) return;

    const getPointOfSaleConnectionURL = DASHAdminSystemConstants.system.API_URL + "/api/ecommerce/point_of_sale/" + record.id + "/oauth/setUpConnection";
   
    try {
      const response = await axios.post(getPointOfSaleConnectionURL);
      successDialog();
      refresh();
    } catch (e: any) {
      console.error("getPointOfSaleConnectionURL", e);
      const response = e.response;

      if (!response) {
        errorDialog("Error de conexión. Por favor intente nuevamente.");
        return;
      }

      switch (response?.status) {
        case 301:
            if(!response.data.auth_url || response.data.auth_url.url === "#") {
              errorDialog("No implementado");
              return;
            }
            window.location = response.data.auth_url;
          break;
        case 422:
          errorDialog(response.data.response?.body || response.data.message || "Error");
          break;
        case 500:
          errorDialog(response.data.message);
          break;
        default:
          errorDialog(response?.data?.message || e.message || "Ha ocurrido un error, vuelva a intentarlo.");
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
  }, [record])

  // Effect for connection format changes
  useEffect(() => {
    if (connectionFormat?.format && !connectionFormatLoading && record) {
      const parsedSchema = connectionFormat.format.map((entry) => {
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

      const infoSchema = connectionFormat?.info ? connectionFormat.info.map((entry) => {
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

      const _usesCustomConnetion = connectionFormat?.own_token_allowed;
      const current_use_custom_connection = record?.connection_params?.use_custom_connection ?? false;

      setValue('connection_params.accessToken', record?.connection_params?.accessToken || "");
      setCurrentUseCustomConnection(current_use_custom_connection);
      setUsesCustomConnection(_usesCustomConnetion);
      setShowForm(_usesCustomConnetion);
    }
  }, [connectionFormat, connectionFormatLoading, record, method])

  // Effect for custom token value changes
  useEffect(() => {
    if (useCustomTokenValue !== undefined) {
      setShowForm(useCustomTokenValue);
    }
  }, [useCustomTokenValue])

  // Initialize connection params
  useEffect(() => {
    if (record?.connection_params) {
      setValue('connection_params', record?.connection_params);
      setShowForm(true);
    }
  }, [record?.connection_params, setValue]);

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
        {(method === "edit" && record?.connection_params) ? (
          <Button variant="contained" onClick={getPointOfSaleConnectionURL}>
            {record.active ? "Re-Establecer conexión" : "Establecer conexión"}
          </Button>
        ) : <></>}
      </Card>
    </>
  )
}

const PointOfSaleConnectionOptionsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record: IPointOfsale = useRecordContext();
  return (
    <>
      <MUISimpleJsonTable vertical tableData={record?.connection_params} />
    </>
  );
}

const PointOfSaleConnectionOptions = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <PointOfSaleConnectionOptionsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <PointOfSaleConnectionOptionsView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "create":
      return <PointOfSaleConnectionOptionsCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
    default:
      return null;
  }
}

export default PointOfSaleConnectionOptions
