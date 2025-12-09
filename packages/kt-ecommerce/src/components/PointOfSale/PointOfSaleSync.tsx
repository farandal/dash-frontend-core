import ApplicationLayout from "dash-admin/src/layout/ApplicationLayout";
import { getCookie } from "dash-admin/src/utils/cookies";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { useDialog } from "dash-dialog";
import React from "react";
import { useNotify, Button, Resource } from "react-admin";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from "dash-utils";

interface IPointOfSaleSync {
  resourceConfig: IDashAutoAdminResourceConfig;
}

interface IManageSync {
  resourceConfig: IDashAutoAdminResourceConfig;
}

const ManageSync: React.FC<IManageSync> = ({ resourceConfig, ...props }) => {

  const axios = useAxios();
  const dialog = useDialog();
  const notify = useNotify();
  const tenant_id = dashStorage.getItem('tenant_id');

  const pricesSync = async () => {


    try {
      const { data } = await axios.post(`point_of_sale_pricelist/sync`, { tenant_id });

      notify('Sincronización realizada')


      dialog({
        variant: "info",
        title: "Sincronización Realizada",
        content: data.message || <MUISimpleJsonTable tableData={data} vertical={true} />,
        onSubmit: () => {
        },
        onClose: () => { }
      });

    } catch (error: any) {
      notify(`Error al sincronizar, ${error?.body?.message || ''}`);
    }
  }

  const stocksSync = async () => {

    try {
      const { data } = await axios.post(`point_of_sale_stock_type/sync`, { tenant_id });
      notify('Sincronización realizada')

      dialog({
        variant: "info",
        title: "Sincronización Realizada",
        content: data.message || <MUISimpleJsonTable tableData={data} vertical={true} />,
        onSubmit: () => {
        },
        onClose: () => { }
      });

    } catch (error: any) {
      notify(`Error al sincronizar, ${error?.body?.message || ''}`);
    }
  }

  return <>
    <Button
      type="submit"
      variant="contained"
      color="primary"
      onClick={stocksSync}
    >
      <>Sincronizar Stocks</>
    </Button>

    <Button
      type="submit"
      variant="contained"
      color="primary"
      onClick={pricesSync}
    >
      <>Sincronizar Precios</>
    </Button>
  </>

}


export const PointOfSaleSync: React.FC<IPointOfSaleSync> = ({ resourceConfig, ...props }) => {

  return <ApplicationLayout resourceConfig={resourceConfig} >

    <Resource options={{ label: resourceConfig.label, group: resourceConfig.group }} name={resourceConfig.model}
      list={<ManageSync resourceConfig={resourceConfig} />}
      //edit={resourceEdit}
      //create={resourceCreate}
      //show={resourceShow}
      /* @ts-ignore mismatch */
      icon={resourceConfig.icon}
    />

  </ApplicationLayout>

}

function notify(arg0: string) {
  throw new Error("Function not implemented.");
}
