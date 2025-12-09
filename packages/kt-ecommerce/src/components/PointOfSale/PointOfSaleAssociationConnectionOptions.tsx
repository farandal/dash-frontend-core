/*import { AutoFormGroups, IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useState } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertTitle, Button, Chip, Switch } from '@mui/material';

import { useRecordContext } from 'react-admin';
import MUISimpleJsonTable from '../../components/MuiSimpleJsonTable';
import { IPointOfsaleAssociation } from '../../schemas/pointofsaleAssociationSchema';
import { useGetOne } from 'react-admin';
import { Loading } from 'react-admin';
import { values } from 'lodash';
import { useRedirect } from 'react-admin';
import useAxios from '../../hooks/axios';
import CONSTANTS from '../../config/CONSTANTS';
import { setCookie } from '../../utils/cookies';
import { useNotify } from 'react-admin';
import { useRefresh } from 'react-admin';
import { useDialog } from '@panel/components/Dialog/DialogService';
import { AppDialogOptions } from '@panel/components/Dialog/AppDialog';
//const connectionParamsResource = "system_point_of_sale/connectionParamFormat";*/

import { IPointOfsaleAssociation } from "../schemas/pointofsaleAssociationSchema";
import { Alert, AlertTitle } from "@mui/material";
import { DashAutoFormGroups, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';
import { useDialog } from "dash-dialog";
import { AppDialogOptions } from "dash-dialog/src/IAppDialogProps";
import React, { useEffect, useState } from "react";
import { useGetOne, useRedirect, useRefresh, useNotify, Loading, Button, useRecordContext } from "react-admin";
import { useFormContext, useController, useWatch } from "react-hook-form";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";
import {DASHAdminSystemConstants} from "dash-constants";

const PointOfSaleAssociationConnectionOptionsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return <Alert severity="info">Ingrese un nombre antes de configurar la integración</Alert>

}

const PointOfSaleAssociationConnectionOptionsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ record, method, attribute }) => {


  //const system_point_of_sale_id = record.pointOfSale.tenantSystemPointOfSale.system_point_of_sale_id;
  const point_of_sale_association_id = record.id;
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue('connection_params.use_own_token', record?.connection_params?.use_own_token ?? false);
  }, []);

  const useCustomToken = useController({ name: 'connection_params.use_own_token', defaultValue: record?.connection_params.use_own_token });

  const { data: connectionFormat,
    isLoading: connectionFormatLoading,
    error: connectionFormatError } = useGetOne(
      "ecommerce/point_of_sale_association/" + point_of_sale_association_id + "/connectionParamFormats",
      {
        id: point_of_sale_association_id,
        meta: {
          is_association: 1,
          use_own_token: useCustomToken && useCustomToken.field ? useCustomToken.field.value : false,
          point_of_sale_association_id: record.id
        }
      },
      { refetchOnWindowFocus: false }
    );

  const [showForm, setShowForm] = useState<boolean>(false);
  const [usesCustomConnetion, setUsesCustomConnection] = useState<boolean>(false);
  const [currentUseCustomConnection, setCurrentUseCustomConnection] = useState<boolean>(false);

  const [connectionOptionSchema, setConnectionOptionSchema] = useState<any>(null);
  const [infoSchema, setInfoSchema] = useState<any>(null);

  const [availableData, setAvailableData] = useState<boolean>(false);
  const redirect = useRedirect();
  const refresh = useRefresh();
  const axios = useAxios();
  const notify = useNotify();

  const dialog = useDialog();

  const successDialog = (message = "", options?: Partial<AppDialogOptions>) => {

    dialog(
      {
        variant: "info",
        title: "Conexión realizada exitosamente",
        content: message,
        //onSubmit: () =>  { saveProductEdit(); stackableDialogs.close("ERROR_CAMPAIGN_PRODUCT_DIALOG"); },
        //onClose: () => { stackableDialogs.close("ERROR_CAMPAIGN_PRODUCT_DIALOG") },
        ...options
      })
  }

  const errorDialog = (message, options?: Partial<AppDialogOptions>) => {

    dialog(
      {
        variant: "danger",
        title: "Ha ocurrido un error.",
        content: message,
        //onSubmit: () =>  { saveProductEdit(); stackableDialogs.close("ERROR_CAMPAIGN_PRODUCT_DIALOG"); },
        //onClose: () => { stackableDialogs.close("ERROR_CAMPAIGN_PRODUCT_DIALOG") },
        ...options
      })
  }

  const getPointOfSaleAssociationConnectionURL = async () => {

    /*  if (useCustomToken && useCustomToken.field.value === true) {
          const getPointOfSaleAssociationConnectionURL = CONSTANTS.SYSTEM.API_URL + "/api/ecommerce/point_of_sale_association/" + record.id + "/oauth/checkToken";

          try {
              const response = await axios.get(getPointOfSaleAssociationConnectionURL);

              if (response.status === 200) {
                  notify("Se ha establecido la conexión con éxito");
              } else {
                  notify("Ha ocurrido un error al establecer la conexión");
              }


          } catch {
              notify("Ha ocurrido un error al establecer la conexión");

          }

          refresh();


      } else {
          const getPointOfSaleAssociationConnectionURL = CONSTANTS.SYSTEM.API_URL + "/api/ecommerce/point_of_sale/" + record.id + "/oauth/setUpConnection";
          //setCookie('current_marketplace_instance', record.id.toString(), null);
          const response = await axios.post(getPointOfSaleAssociationConnectionURL);
          
          const results = response.data;
          window.location = results.auth_url;
      } */

    const getPointOfSaleAssociationConnectionURL = DASHAdminSystemConstants.system.API_URL + "/api/ecommerce/point_of_sale_association/" + record.id + "/oauth/setUpConnection";
    let response = null;

    try {
      response = await axios.post(getPointOfSaleAssociationConnectionURL);
      // Asssumed 200 response:

      successDialog();


    } catch (e: any) {
      console.error("getPointOfSaleAssociationConnectionURL", e);
      response = e.response;
      //TODO validate if !e.response

      switch (response.status) {
        case 301:
          // TODO validate response data auth_url && error message
          window.location = response.data.auth_url;
          break;
        case 500:
          errorDialog(response.data.message);
          break;
        default:
          errorDialog(response.data.message || e.message || "Ha ocurrido un error, vuelva a intentarlo.");
          break;
      }
    } finally {
      refresh();
    }


  }

  useEffect(() => {
    if (record) {
      setShowForm(true);

      if (record.connection_params) {

        setAvailableData(true);
      }
    }
  }, [record])

  useEffect(() => {

    if (connectionFormat?.format && !connectionFormatLoading && record) {

      let parsedSchema = connectionFormat.format.map((entry) => {

        const defaultValue = (record.connection_params && record.connection_params[entry.attribute]) ?? false;

        return {
          ...entry,
          readOnly: entry?.editable === true ? false : true,
          ...(method === "edit" && record?.connection_params && defaultValue && {
            fieldOptions: {
              defaultValue: defaultValue
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
          //type:"string",
          ...(defaultValue && {
            fieldOptions: {
              defaultValue: defaultValue
            }
          })
          ,
          value: defaultValue
        }
      }) : null;

      console.log("INFO SCHEMA", infoSchema);
      setInfoSchema(infoSchema);

      let _usesCustomConnetion: boolean = connectionFormat?.custom_params_connection_allowed;
      let current_use_custom_connection = record?.connection_params?.use_custom_connection ?? false
      setCurrentUseCustomConnection(current_use_custom_connection);
      setUsesCustomConnection(_usesCustomConnetion);
      setShowForm(_usesCustomConnetion);

    }

  }, [connectionFormat, connectionFormatLoading])

  // TODO: pasar el current custom connection, al react hook form controller.

  //const useCustomApp = useController({ name: 'connection_params.use_custom_connection' });
  const useCustomAppValue = useWatch({ name: "connection_params.use_custom_connection" });

  useEffect(() => {
    setShowForm(useCustomAppValue)
  }, [useCustomAppValue])

  if (!record.pointOfSale) return <Loading />

  return <>

    <section>
      {infoSchema ? DashAutoFormGroups(infoSchema, null, {
        mode: "view", label: "Información", readOnlyComponent: (props) => {
          return <Alert severity="info">
            <AlertTitle>{props.input.label}</AlertTitle>
            {props.input.value}
          </Alert>
        }
      }) : <></>}
    </section>

    <section>
      {connectionOptionSchema ? DashAutoFormGroups(connectionOptionSchema, null, { mode: "edit", useReadOnlyInputAsTextField: true, label: "Opciones de conexión" }) : <></>}
    </section>

    <section>
      {(method === "edit" && (record?.connection_params)) ? <Button onClick={(e) => getPointOfSaleAssociationConnectionURL()} >
        <>{record.active ? "Re-Establecer conexión" : "Establecer conexión"}</></Button> : <></>}
    </section>

  </>

}

const PointOfSaleAssociationConnectionOptionsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record: IPointOfsaleAssociation = useRecordContext();
  return (
    <>
      <MUISimpleJsonTable vertical tableData={record?.connection_params} />
    </>
  )
}

const PointOfSaleAssociationConnectionOptions = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  const record: IPointOfsaleAssociation = useRecordContext();
  switch (method) {
    case "edit":
      return <PointOfSaleAssociationConnectionOptionsEdit record={record} attribute={attribute} method={method} />
    case "view":
      return <PointOfSaleAssociationConnectionOptionsView record={record} attribute={attribute} method={method} />
    case "create":
      return <PointOfSaleAssociationConnectionOptionsCreate attribute={attribute} method={method} />
  }
}

export default PointOfSaleAssociationConnectionOptions

