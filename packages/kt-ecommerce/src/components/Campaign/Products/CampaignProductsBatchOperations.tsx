import { Box, ButtonGroup, Button } from "@mui/material";
import DictionaryContext from "dash-admin/src/contexts/dictionary/DictionaryContext";
import { getCookie } from "dash-admin/src/utils/cookies";
import { useAxios } from 'dash-axios-hook';
import { useDialog } from "dash-dialog";
import { AppDialog } from "dash-dialog/src/AppDialog";
import React, { useContext, useState } from "react";
import { useRefresh } from "react-admin";
import MUISimpleJsonTable from "../../MuiSimpleJsonTable";
import selectedStatusToAction from "./Grid/Helpers/selectedStatusToAction";

import {
  DataGrid as MUIGrid,
  GridColDef,
  esES,
  GridRenderCellParams,
  GridRowParams
} from "@mui/x-data-grid";

/*
import { useDialog } from "@panel/components/Dialog/DialogService";
import MUISimpleJsonTable from "@panel/components/MuiSimpleJsonTable";
import useAxios from "@panel/hooks/axios";
import { getCookie } from "@panel/utils/cookies";
import { useContext, useState } from "react";
import { useRefresh } from "react-admin";

import selectedStatusToAction from "./Grid/Helpers/selectedStatusToAction";

import {
    DataGrid as MUIGrid,
    GridColumnApi,
    GridPreProcessEditCellProps,
    GridRowParams,
    esES,
    GridRenderCellParams,
    GridColDef,
} from "@mui/x-data-grid";
import { AppDialog } from "@panel/components/Dialog/AppDialog";
import DictionaryContext from "@panel/providers/DictionaryContext";
*/
const BatchCampaignProductDialog: React.FC<any> = ({
  campaign,
  status,
  onChange,
  ...rest
}) => {
  const _rows = campaign?.campaign_marketplaces
    ? campaign.campaign_marketplaces
    : [];
   
  const _columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 20 },
    {
      field: "name",
      headerName: "Marketplace",
      width: 150,
      renderCell: (props: GridRenderCellParams) => { return props.row.marketplace?.name || 'N/A' }
    },
  ];

  return (
    <Box sx={{ height: 280, width: 400 }}>
      {/*marketplaces: {JSON.stringify(batchSelectedMarketplaces.map(item=> item.id))}
            productos: {JSON.stringify(batchSelectedCampaignProducts.map(item=> item.id))}*/}
      <h3>Selector de marketplaces</h3>
      <MUIGrid
        rows={_rows}
        columns={_columns}
        /*initialState={{
        pagination: {
            paginationModel: {
            pageSize: 5,
            },
        },
        }}
        pageSizeOptions={[5]}*/
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(ids) => {
          const selectedRowsData = ids.map((id) =>
            _rows.find((row) => row.id === id)
          );

          onChange(selectedRowsData);
        }}
      //disableRowSelectionOnClick
      />
    </Box>
  );
};

const CampaignProductsBatchOperations: React.FC<any> = ({
  campaign,
  selectedProducts,
}) => {
  // publicar, pausar, despublicar
  // todo: eliminar

  const axios = useAxios();
  const dialog = useDialog();
  const refresh = useRefresh();
  const DICT = useContext(DictionaryContext);

  const [batchSelectedMarketplaces, setBatchSelectedMarketplaces] = useState(
    []
  );
  const [dialogVariant, setDialogVariant] =
    useState<"danger" | "info">("info");
  const [action, setAction] = useState(null);

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const changeProductStatus = (status: string) => {
    const tenant_id = localStorage.getItem('tenant_id');
    const processedProductsIds = selectedProducts.map(
      (products) => products.id
    );
    const processedMarketplacesIds = batchSelectedMarketplaces.map(
      (marketplace) => marketplace.id
    );
    const url = `/ecommerce/campaign/${campaign.id}/products/${selectedStatusToAction(
      status
    )}`;
    const payload = {
      tenant_id: Number(tenant_id),
      product_ids: processedProductsIds,
      campaign_marketplace_ids: processedMarketplacesIds,
    };

    axios
      .put(url, payload)
      .then(() => {
        // setOpen(false)
        dialog({
          variant: "info",
          title: "Se ha ejecutado la tarea de actualización de productos en batch",
          content: (
            <>
              Se ha ejecutado la tarea de actualización de
              productos en batch
            </>
          ),
        });
      })
      .catch((error) => {
        //setOpen(false)
        dialog({
          variant: "danger",
          title: "Ha ocurrido un error.",
          content: (
            <>
              <h3>
                Ha ocurrido un error al cambiar de estado los
                productos
              </h3>
              <MUISimpleJsonTable vertical tableData={error} />
            </>
          ),
        });
      })
      .finally(() => refresh());
  };



  return (
    <>
      <AppDialog
        variant={dialogVariant}
        title={`${DICT.get(action)} productos de campaña en marketplaces`}
        content={<BatchCampaignProductDialog
          onChange={setBatchSelectedMarketplaces}
          campaign={campaign} />}
        open={open}
        onSubmit={() => { changeProductStatus(action); setOpen(false); }}
        onClose={handleClose} children={undefined} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "& > *": {
            m: 1,
          },
        }}
      >
        <ButtonGroup
          variant="text"
          aria-label="outlined primary button group"
        >
          <Button onClick={() => { setOpen(true); setAction("publish") }}>
            Publicar productos
          </Button>
          <Button onClick={() => { setOpen(true); setAction("pause") }}>
            Pausar productos
          </Button>
          <Button onClick={() => { setOpen(true); setAction("unpublish") }}>
            Despublicar productos
          </Button>
        </ButtonGroup>
      </Box>
    </>
  );
};

export default CampaignProductsBatchOperations;
