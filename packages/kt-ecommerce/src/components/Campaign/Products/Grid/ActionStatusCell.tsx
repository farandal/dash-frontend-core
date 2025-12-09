/*import moment from "moment";
import { stringify } from "query-string";
import { useState } from "react";
import { useParams } from "react-router";
//import * as Icon from 'react-feather';
import * as Icon from "react-icons/fa";
import {
    Button,
    ButtonGroup,
    //    Chip,
    //    Dialog,
    FormControl,
    //    InputLabel,
    //    MenuItem,
    //    Select,
} from "@mui/material";

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useUpdate, useNotify, useRefresh, useDelete } from "react-admin";

import { GridRenderCellParams } from "@mui/x-data-grid";
import MarketplaceTag from "../../../../components/Misc/MarketplaceTag";

import { useRecordContext } from "react-admin";
//import { ProductStatus } from "../../Utils";
//import CampaignProductStatuses, { RenderStatusHistory } from "./CampaignProductStatuses";
import CellSettings from "./CellSettings";
//import { CampaignStatusesActions } from "../../../../interfaces/campaign/ICampaign";
import ICampaign, {
    SystemMarketplace,
} from "@panel/interfaces/campaign/ICampaign";
import ICampaignProduct, {
    CampaignMarketplace,
    Pivot,
    StatusHistory,
} from "@panel/interfaces/campaign/ICampaignProduct";

import useAxios from "@panel/hooks/axios";
import { useDispatch } from "react-redux";
import { useDialog } from "@panel/components/Dialog/DialogService";
import { SUDO_REDUX_ACTIONS } from "dash-uikit";
import { AppDialogOptions } from "@panel/components/Dialog/AppDialog";
import { getCookie } from "@panel/utils/cookies";
import { CustomSystemMarketplace } from "../Interfaces/CustomSystemMarketplace";
import selectedStatusToAction from "./Helpers/selectedStatusToAction";
import MUISimpleJsonTable from "@panel/components/MuiSimpleJsonTable";


*/

import MarketplaceTag from "../../../Misc/MarketplaceTag";
import MUISimpleJsonTable from "../../../MuiSimpleJsonTable";

import { ButtonGroup, FormControl } from "@mui/material";
import * as Icon from "react-icons/fa";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { getCookie } from "dash-admin/src/utils/cookies";
import { useAxios } from 'dash-axios-hook';
import { useDialog } from "dash-dialog";
import { AppDialogOptions } from "dash-dialog/src/IAppDialogProps";
import moment from "moment";
import queryString from "query-string";
import React, { useState } from "react";
import { useDelete, useUpdate, useRefresh, useNotify, useRecordContext, Button } from "react-admin";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { CustomSystemMarketplace } from "../Interfaces/CustomSystemMarketplace";
import CellSettings from "./CellSettings";
import selectedStatusToAction from "./Helpers/selectedStatusToAction";
import { ICampaign, CampaignMarketplace, SystemMarketplace, ICampaignProduct, Pivot } from "../../../../interfaces";
import { dashStorage } from "dash-utils";


moment.locale("es-es");

interface IButtons {
  enabled: boolean;
  name: string;
  onClick: () => any;
  color:
  | "error"
  | "default"
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning";
  className: string;
  icon: JSX.Element;
}

export enum CampaignStatusesActions {
  finish = "DESPUBLICAR",
  publish = "PUBLICAR",
  pause = "PAUSAR",
  delete = "ELIMINAR",
}

/*
const DELETE_PRODUCT_DIALOG = "CampaignProductDeleteDialog";
const ERROR_DIALOG = "CampaignProductErrorDialog";
const ACTION_PRODUCT_DIALOG = "ActionProductDialog";
*/

export const ActionStatusCell = (props: GridRenderCellParams) => {
  const { id } = useParams();
  const [deleteOne] = useDelete();
  const [update] = useUpdate();
  const refresh = useRefresh();
  const notify = useNotify();

  const axios = useAxios();
  const dispatch = useDispatch();
  const dialog = useDialog();

  // const [selectedStatus, setSelectedStatus] = useState<CampaignStatusesActions>(null); // TODO: asignar el valor pre seleccionado dependiendo del estado actual: CampaignStatusesActions.PENDING
  const [selectedStatus, setSelectedStatus] = useState<string>(null); // TODO: asignar el valor pre seleccionado dependiendo del estado actual: CampaignStatusesActions.PENDING
  const [selectedMarketplace, setSelectedMarketplace] =
    useState<SystemMarketplace>(null);

  const contextCampaign: ICampaign = useRecordContext();
  const systemMarketplaces: CustomSystemMarketplace[] =
    contextCampaign.campaign_marketplaces.map((campaignMarketplace) => {
    
      return {
        ...campaignMarketplace.marketplace,
        campaign_marketplace_id: campaignMarketplace.id,
      };
    });
  //const stackableDialogs = useStackableDialog();

  const deleteDialog = () => {
    dialog({
      variant: "info",
      title: "Eliminar producto de campaña",
      //hideBackdrop: true,
      //disableEnforceFocus: true,
      content:
        "¿Está seguro de eliminar este producto de la campaña, incluyendo sus publicaciones en todos los marketplaces asociados?",
      onSubmit: () => {
        removeProduct(props.row.id);
        //stackableDialogs.close(DELETE_PRODUCT_DIALOG);
      },
      /*onClose: () => {

          //stackableDialogs.close(DELETE_PRODUCT_DIALOG);
      },  */
    });
  };

  const errorDialog = (options?: Partial<AppDialogOptions>) => {
    /*stackableDialogs.open(ERROR_DIALOG,
        {
            variant: "danger",
            title: "Error",
            //hideBackdrop: true,
            disableEnforceFocus: true,
            content: "Ha ocurrido un error",
            //onSubmit: () => stackableDialogs.close(ERROR_DIALOG),
            ...options,
            onClose: () => {
                
                stackableDialogs.close(ERROR_DIALOG);
            },

        })*/

    dialog({
      variant: "danger",
      title: "Error",
      //hideBackdrop: true,
      //disableEnforceFocus: true,
      content: "Ha ocurrido un error",
      //onSubmit: () => stackableDialogs.close(ERROR_DIALOG),
      ...options,
    });
  };

  const actionDialog = (
    status,
    marketplace?: SystemMarketplace,
    options?: Partial<AppDialogOptions>
  ) => {
    dialog({
      variant: "danger",
      title: "Confirmar Acción",
      //hideBackdrop: true,
      //disableEnforceFocus: true,
      content: marketplace ? (
        <>
          {`¿Está seguro de ${CampaignStatusesActions[status]} este producto en `}
          <MarketplaceTag marketplace={marketplace} />
        </>
      ) : (
        <>{`¿Está seguro de ${CampaignStatusesActions[status]} este producto en todos los marketplaces?`}</>
      ),
      ...options,
      onSubmit: () => {
        changeProductStatus(props.row.id, status, marketplace);
      },
    });
  };

  const changeProductStatus = async (
    idProd: number,
    _selectedStatus: string,
    _selectedMarketplace: CustomSystemMarketplace
  ) => {

    const product = props.row;
    const tenant_id = dashStorage.getItem('tenant_id');

    try {
      console.error(
        "changeProductStatus",
        idProd,
        _selectedStatus,
        _selectedMarketplace
      );
      try {
        //dispatch(SUDO_REDUX_ACTIONS.loading(true));

        const processedSelectedMarketplaces = _selectedMarketplace
          ? [_selectedMarketplace.campaign_marketplace_id]
          : product.campaign_marketplaces.map(
            (marketplace) => marketplace.id
          );

        let action = axios.put;
        let url = `/ecommerce/campaign/${id}/products/${selectedStatusToAction(
          _selectedStatus
        )}`;
        const payload = {
          tenant_id: Number(tenant_id),
          product_ids: [idProd],
          campaign_marketplace_ids: processedSelectedMarketplaces,
        };

        if (_selectedStatus === "delete") {
          const processedQuery = queryString.stringify(payload, {
            arrayFormat: "bracket",
          });
          url = `/ecommercecampaign/${id}/products?${processedQuery}`;
          action = axios.delete;
        }

        const { data } = await action(url, payload);
      } catch (error: any) {
        errorDialog({
          content:
            error?.response?.data?.message ||
            "Ha ocurrido un error al cambiar de estado el producto  (" +
            error?.message +
            "  " +
            JSON.stringify(error.response?.data).substring(
              0,
              200
            ),
        });
      } finally {
        //dispatch(SUDO_REDUX_ACTIONS.loading(false));
      }
    } catch (error) {
      console.log(error);
    } finally {
      refresh();
    }
  };
  // TODO: test de remove product
  const removeProduct = async (idProd) => {
    const tenant_id = dashStorage.getItem('tenant_id');

    try {
      /* TODO: Se dicidió no  implementar la acción batch para eliminar multiples productos en forntend; 
       por lo tanto campaign_marketplace_ids siempre envía todas los marketplaces en los que está el producto 
     */

      const payload = {
        tenant_id: Number(tenant_id),
        product_ids: [idProd],
        campaign_marketplace_ids: product.campaign_marketplaces.map(
          (marketplace) => marketplace.id
        ),
      };

      const processedQuery = queryString.stringify(payload, {
        arrayFormat: "bracket",
      });

      

      const url = `/ecommerce/campaign/${id}/products?${processedQuery}`;

      await axios.delete(url);
    } catch (error) {
      errorDialog({
        content: (
          <>
            <MUISimpleJsonTable vertical tableData={error} />
          </>
        ),
      });
    } finally {
      //setOpen(false);
      refresh();
    }
  };

  const selectStatus = (
    status: string,
    systemMarketplace?: SystemMarketplace
  ) => {

    // TODO: esto en verdad no tiene un efecto,m porque no se progaga el estado para utilizarlo en el dialogo, de todas formas se setean.
    setSelectedMarketplace(systemMarketplace || null);
    setSelectedStatus(status);
    actionDialog(status, systemMarketplace);
  };

  /* const ActionButtons:FC<{
      product: ICampaignProduct,
      marketplace?: SystemMarketplace,
      //campaignMarketplaceProductData: CampaignMarketplace,
  //}> = ({campaignMarketplaceProductData,marketplace,...props}) => {
  }> = ({product,marketplace,...props}) => {*/

  const ActionButtons = (statusSelectProps: {
    product: ICampaignProduct | Pivot;
    selectedMarketplace?: SystemMarketplace;
  }) => {
    const { product, selectedMarketplace } = statusSelectProps;

    const StatusButtonsComponent = () => {
      const campaignStatus: string = contextCampaign.status.toLowerCase();
      const productStatus: string = product.status
        ? product.status.toLowerCase()
        : null;

      //console.log("product",product);
      //console.log("productStatus",productStatus);
      //console.log("campaignStatus",campaignStatus);

      let _buttons: IButtons[] = [
        {
          enabled:
            ["published" /*,"paused"*/].includes(campaignStatus) &&
            !["published", "finished"].includes(productStatus),
          name: "publish",
          onClick: () => {
            selectStatus("publish", selectedMarketplace);
          },
          color: "primary",
          className: "",
          icon: <Icon.FaPlay />,
        },
        {
          enabled:
            ["published"].includes(campaignStatus) &&
            ["published", "warning", "errored"].includes(
              productStatus
            ),
          name: "pause",
          onClick: () => {
            selectStatus("pause", selectedMarketplace);
            //deleteDialog()
          },
          color: "primary",
          className: "",
          icon: <Icon.FaPause />,
        },
        {
          enabled:
            ["published", "paused"].includes(campaignStatus) &&
            !["pending", "finished"].includes(productStatus),
          name: "finish",
          onClick: () => selectStatus("finish", selectedMarketplace),
          color: "primary",
          className: "",
          icon: <Icon.FaStop />,
        },
        {
          enabled: ["pending", "finished"].includes(productStatus),
          name: "delete",
          //onClick: () =>  removeProduct(props.row.id),
          /*onClick: () => { 
              //console.log(productStatus); 
              deleteDialog() 
          },*/
          onClick: () => selectStatus("delete", selectedMarketplace),
          color: "error",
          className: "",
          icon: <Icon.FaTrash />,
        },
      ];

      /*if(status === 'pausing' || status === 'publishing' || status === 'finishing') {
          return <>
              <a><Chip color={"primary"} label={showIcon(mdiPause)} className={'chip-regular'} size={"small"} /></a>
              <a><Chip color={"primary"} label={showIcon(mdiStop)} className={'chip-regular'} size={"small"} /></a>
              <a><Chip color={"primary"} label={showIcon(mdiPlay)} className={'chip-regular'} size={"small"} /></a>
          </>
      }*/

      return (
        <ButtonGroup
          variant="contained"
          //aria-label="outlined button group"
          //disableElevation
          size={"small"}
        >
          {_buttons
            .filter((ele) => ele.enabled)
            .map((btn, key) => {
              {
                /* @ts-ignore: Unreachable code error */
              }
              return (
                <Button
                  key={key}
                  onClick={btn.onClick}

                  //color={btn.color}
                  className={btn.className}
                >
                  {btn.icon}
                </Button>
              );
            })}
        </ButtonGroup>
      );

      /* return <>
           <a onClick={() => selectStatus('pause', marketplace) }>
               <Chip color={"primary"} label={showIcon(mdiPause)} size={"small"} className={ status !== 'paused' ? 'chip-red' : 'chip-regular' }/>
           </a>
           <a onClick={() =>selectStatus('publish', marketplace)}>
               <Chip color={"primary"} label={showIcon(mdiPlay)} className={status !== 'published' ? 'chip-red' : 'chip-regular'} size={"small"} />
           </a>
           <a onClick={() =>selectStatus('finish', marketplace)}>
               <Chip color={"primary"} label={showIcon(mdiStop)} className={ status !== 'pending' && status !== 'finished' ? 'chip-red' : 'chip-regular' } size={"small"} />
           </a>
       </>*/
    };

    return (
      <FormControl sx={{ m: 1, maxWidth: 120 }} size="small">
        <StatusButtonsComponent />
      </FormControl>
    );
  };

  const ProductStatusesComponent = (data: ICampaignProduct) => {
    return (
      <table>
        {data &&
          data.campaign_marketplaces.map(
            (
              campaignMarketplaceProductData: CampaignMarketplace
            ) => {
           
              const marketplace = systemMarketplaces.find(
                (ele) => ele.tenant_system_marketplace_id == campaignMarketplaceProductData.marketplace.tenant_system_marketplace_id
              );
              //const status = campaignMarketplaceProductData.pivot.status;

              //console.log("campaignMarketplaceProductData",campaignMarketplaceProductData);
              //console.log("marketplace",marketplace);
              //console.log("data",data);

              const productMarketplace =
                data.campaign_marketplaces.find(
                  (ele) => ele.id === marketplace.campaign_marketplace_id
                );

              return (
                <>
                  <tr>
                    <td>
                      <MarketplaceTag
                        marketplace={marketplace}
                      />
                    </td>
                    {/*<td>{ProductStatus(status)}</td>*/}
                  </tr>
                  <tr>
                    <td>
                      <ActionButtons
                        //campaignMarketplaceProductData={campaignMarketplaceProductData}
                        selectedMarketplace={
                          marketplace
                        }
                        product={
                          productMarketplace.pivot
                        }
                      />
                    </td>
                    {/*<td>{JSON.stringify(campaignMarketplaceProductData.pivot)}</td>*/}
                    {/*<td>{RenderStatusHistory(campaignMarketplaceProductData.pivot)}</td>*/}
                  </tr>
                </>
              );
            }
          )}
      </table>
    );
  };

  let _warning =
    props.value === null
      ? { active: true, message: "Status diferentes por marketplace" }
      : { active: false, message: "" };

  const product: ICampaignProduct = props.row;

  return (
    <>
      <div className="table-cell-container">
        <div className="table-cell-content">
          {/*<Button color={'error'} onClick={() => setOpen(true)} style={{ marginRight: 8 }}>
                        Quitar
                </Button>*/}

          <ActionButtons
            product={
              product
            } /*marketplace={null} campaignMarketplaceProductData={null}*/
          />
        </div>
        <CellSettings
          warning={_warning}
          row={props.row}
          field={props.field}
          type="drawer"
        >
          {ProductStatusesComponent(props.row as ICampaignProduct)}
        </CellSettings>
      </div>
    </>
  );
};

export default ActionStatusCell;
