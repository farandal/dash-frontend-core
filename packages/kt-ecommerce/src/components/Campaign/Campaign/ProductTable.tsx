import { ICampaign, CampaignStatuses } from "../../../interfaces";
import { 
  GridRenderCellParams, 
  GridColDef, 
  gridStringOrNumberComparator, 
  GridPreProcessEditCellProps, 
  GridCellParams, 
  MuiEvent, 
  GridCallbackDetails,
  DataGrid as MUIGrid
} from "@mui/x-data-grid";
import { useDialog } from "dash-dialog";
import { AppDialogOptions } from "dash-dialog/src/IAppDialogProps";
import React, { useState, useCallback, useMemo } from "react";
import { useNotify, useUpdate, useRefresh, useRecordContext } from "react-admin";
import { Box } from "react-feather";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import MarketplaceTag from "../../Misc/MarketplaceTag";
import MUISimpleJsonTable from "../../MuiSimpleJsonTable";
import { PriceEditCell, PriceRenderCell } from "../MarketplaceEdit";
import CampaignProductsBatchOperations from "../Products/CampaignProductsBatchOperations";
import ActionStatusCell from "../Products/Grid/ActionStatusCell";
import CellSettings from "../Products/Grid/CellSettings";
import { StatusRenderCell } from "../Products/Grid/StatusCell";
import { StockAlertEditCell, StockAlertRenderCell } from "../Products/Grid/StockAlertCell";
import { StockEditCell, StockRenderCell } from "../Products/Grid/StockCell";
import { VentasRenderCell } from "../Products/Grid/VentasCell";

const ProductTable = ({ products }) => {
  console.log("ProductTable rendering with products:", products?.length);
  
  const { id } = useParams();
  const notify = useNotify();
  const [update] = useUpdate();
  const refresh = useRefresh();
  const [editData, setEditData] = useState(undefined);
  const campaign: ICampaign = useRecordContext();
  const { setError } = useForm();
  const dialog = useDialog();
  const [batchSelectedCampaignProducts, setBatchSelectedCampaignProducts] = useState<any[]>([]);
  
  // Memoize system marketplaces to avoid recalculation
  const systemMarketplaces = useMemo(() => 
    campaign?.campaign_marketplaces?.map(marketplace => marketplace.marketplace) || [],
    [campaign?.campaign_marketplaces]
  );

  // Optimize MarketPlacesCell with memoization
  const MarketPlacesCell = useCallback((props: GridRenderCellParams) => {
    const icons = props.row.campaign_marketplaces.map((item) => {
      const marketplace_product_url = item.pivot.product_extra_info.post_link;
      const marketplace = systemMarketplaces.find(
        (ele) => ele.id == item.marketplace.tenant_system_marketplace_id
      );
      
      return (
        <a key={item.id} target="_blank" href={marketplace_product_url}>
          <MarketplaceTag
            marketplace={marketplace}
            noTitle={true}
          />
        </a>
      );
    });

    return (
      <div className="table-cell-container">
        <div className="table-cell-content">{icons}</div>
        <CellSettings row={props.row} field={props.field}>
          {props.row.campaign_marketplaces.map((item, index) => {
            const marketplace_extra_data = item.pivot.product_extra_info;
            const marketplace = systemMarketplaces.find(
              (ele) => ele.id == item.marketplace.tenant_system_marketplace_id
            );
            
            return (
              <div key={`${item.id}-${index}`}>
                <MarketplaceTag
                  marketplace={marketplace}
                  noTitle={true}
                />
                <MUISimpleJsonTable
                  ignore={["post_link"]}
                  tableData={marketplace_extra_data}
                  vertical={true}
                />
              </div>
            );
          })}
        </CellSettings>
      </div>
    );
  }, [systemMarketplaces]);

  // Memoize columns to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(() => [
    {
      field: "sku",
      headerName: "SKU",
      type: "string",
      editable: false,
      width: 120,
      sortable: true,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
      hideable: false,
    },
    {
      field: "marketPlaces",
      headerName: "Marketplaces",
      type: "number",
      editable: false,
      width: 70,
      renderCell: MarketPlacesCell,
      sortable: false,
    },
    {
      field: "sales_count",
      headerName: "Ventas",
      type: "number",
      editable: false,
      width: 50,
      renderCell: (params) => <VentasRenderCell {...params} />,
      sortable: true,
      valueGetter: (params) => {
        return params.value || 0;
      },
      sortComparator: gridStringOrNumberComparator,
    },
    {
      field: "primary_price",
      headerName: "Precio normal",
      type: "number",
      editable: true,
      width: 120,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = "";
        if (params.props.value !== null && !params.props.value && params.props.value !== 0)
          error = "El precio no puede ser vacio";
        if (params.props.value < 0)
          error = "El precio no puede ser menor a 0";
        return { ...params.props, error };
      },
      renderEditCell: (params) => <PriceEditCell {...params} campaign={campaign} />,
      renderCell: (params) => <PriceRenderCell {...params} campaign={campaign} />,
      sortable: true,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
    },
    {
      field: "sale_price",
      headerName: "Precio oferta",
      type: "number",
      editable: true,
      width: 120,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = "";
        if (params.props.value !== null && !params.props.value && params.props.value !== 0)
          error = "El precio no puede ser vacio";
        if (params.props.value < 0)
          error = "El precio no puede ser menor a 0";
        return { ...params.props, error };
      },
      renderEditCell: (params) => <PriceEditCell {...params} campaign={campaign} />,
      renderCell: (params) => <PriceRenderCell {...params} campaign={campaign} />,
      sortable: true,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
    },
    {
      field: "stock",
      headerName: "Stock por marketplace",
      type: "number",
      editable: true,
      width: 120,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = "";
        if (params.props.value !== null && !params.props.value && params.props.value !== 0)
          error = "El stock no puede ser vacio";
        if (params.props.value < 0)
          error = "El stock no puede ser menor a 0";
        if (params.props.value > params?.otherFieldsProps?.source_available_stock)
          error = "El stock tiene que ser mayor al stock de lista";
        return { ...params.props, error };
      },
      renderEditCell: (params) => <StockEditCell {...params} campaign={campaign} />,
      renderCell: (params) => <StockRenderCell {...params} />,
      sortable: true,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
    },
    {
      field: "primary_stock",
      headerName: "Stock de lista",
      type: "number",
      editable: false,
      width: 120,
      sortable: true,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
    },
    {
      field: "stock_alert_threshold",
      headerName: "Alerta de stock",
      type: "number",
      editable: true,
      width: 120,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = "";
        if (params.props.value !== null && !params.props.value && params.props.value !== 0)
          error = "El valor para la alerta de stock no puede ser vacio";
        if (params.props.value < 0)
          error = "El valor para la alerta de stock no puede ser menor que 0";
        return { ...params.props, error };
      },
      renderEditCell: (params) => <StockAlertEditCell {...params} campaign={campaign} />,
      renderCell: (params) => <StockAlertRenderCell {...params} campaign={campaign} />,
      sortable: true,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
    },
    {
      field: "status",
      headerName: "Status",
      type: "number",
      editable: false,
      width: 120,
      //valueGetter: (params) => params.value,
      sortComparator: gridStringOrNumberComparator,
      renderCell: (params) => <StatusRenderCell {...params} />,
    },
    {
      field: "change_status",
      headerName: "Acción",
      type: "string",
      editable: false,
      sortable: false,
      hideable: false,
      renderCell: (params) => <ActionStatusCell {...params} />,
      width: 200,
    },
  ], [MarketPlacesCell, campaign]);

  // Optimize saveProductEdit with useCallback
  const saveProductEdit = useCallback(async (data = null) => {
    try {
      const _data = data || editData;
      if (!_data) return;

      const transformedData = {
        product_id: _data.id,
        ...(![null, undefined].includes(_data.stock_alert_threshold) && 
            { stock_alert_threshold: _data.stock_alert_threshold }),
        ...(![null, undefined].includes(_data.primary_price) && 
            { primary_price: _data.primary_price }),
        ...(![null, undefined].includes(_data.sale_price) && 
            { sale_price: _data.sale_price }),
        ...(![null, undefined].includes(_data.stock) && 
            { stock: _data.stock }),
      };

      await update(
        `/ecommerce/campaign/${id}/products`,
        { id: _data.id, data: transformedData },
        {
          onSuccess: () => {
            notify("Datos de producto actualizados.");
          },
          onError: (error: any) => {
            console.error(error);
            notify(`Error al guardar los datos del producto, ${error?.body?.message || ""}`);
          },
          returnPromise: true,
        }
      );
    } catch (errors) {
      console.error(errors);
      if (errors && typeof errors === 'object') {
        Object.keys(errors).forEach((key) => {
          setError(key, errors[key]);
        });
      }
    } finally {
      setEditData(undefined);
      refresh();
    }
  }, [editData, id, update, notify, setError, refresh]);

  // Optimize updateDialog with useCallback
  const updateDialog = useCallback((options?: Partial<AppDialogOptions>) => {
    dialog({
      variant: "info",
      title: "Actualizar producto en campaña",
      content: "¿Esta seguro de querer actualizar los campos de este productos para todos los marketplaces?",
      onSubmit: () => {
        saveProductEdit();
      },
      ...options,
    });
  }, [dialog, saveProductEdit]);

  // Memoize enableBatchOperations
  const enableBatchOperations = useMemo(() => 
    campaign?.status === CampaignStatuses.PUBLISHED || 
    campaign?.status === CampaignStatuses.PAUSED,
    [campaign?.status]
  );

  // Optimize row selection handler
  const handleRowSelectionChange = useCallback((ids) => {
    const selectedRowsData = ids.map((id) => 
      products.find((row) => row.id === id)
    ).filter(Boolean);
    
    setBatchSelectedCampaignProducts(selectedRowsData);
  }, [products]);

  // Optimize row update handler
  const handleProcessRowUpdate = useCallback((data) => {
    if (data.campaign_marketplaces.length > 1) {
      if (
        data.stock !== null ||
        data.sale_price !== null ||
        data.primary_price !== null
      ) {
        setEditData(data);
        updateDialog();
      }
    } else if (data.campaign_marketplaces.length === 1) {
      saveProductEdit(data);
    }
    return { ...data };
  }, [saveProductEdit, updateDialog]);

  // Optimize cell key down handler
  const handleCellKeyDown = useCallback((
    params: GridCellParams, 
    event: MuiEvent<React.KeyboardEvent>, 
    details: GridCallbackDetails
  ) => {
    if (params.cellMode !== "edit") event.stopPropagation();
  }, []);

  // Prepare products data for the grid
  const preparedProducts = useMemo(() => {
    if (!products) return [];
    return products.map(product => ({
      ...product,
      marketPlaces: product.campaign_marketplaces
    }));
  }, [products]);

  // Check if we have the necessary data
  if (!campaign) {
    console.warn("Campaign not available in ProductTable");
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading campaign data...
      </div>
    );
  }

  return (
    <>
   
      <Box
        sx={{
          width: "100%",
          height: 500, // Set explicit height
          "& .MuiDataGrid-cell--editing": {
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "#376331"
                : "rgb(217 243 190)",
          },
        }}
      >
        {batchSelectedCampaignProducts.length > 0 && (
          <CampaignProductsBatchOperations
            campaign={campaign}
            selectedProducts={batchSelectedCampaignProducts}
          />
        )}

        <MUIGrid
          sx={{ 
            height: 450, // Explicit height
            width: '100%'
          }}
          columns={columns}
          rows={preparedProducts}
          editMode="row"
          rowHeight={80}
          loading={!products || products.length === 0}
          onCellKeyDown={handleCellKeyDown}
          {...(enableBatchOperations && { checkboxSelection: true })}
          disableRowSelectionOnClick
          onRowSelectionModelChange={handleRowSelectionChange}
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={(error: any) => {
            console.error(error);
          }}
          components={{
            NoRowsOverlay: () => (
              <div style={{ 
                display: 'flex', 
                height: '100%', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                No hay productos disponibles
              </div>
            )
          }}
        />
      </Box>
    </>
  );
};

// Export without React.memo to ensure proper rendering
export default ProductTable;
