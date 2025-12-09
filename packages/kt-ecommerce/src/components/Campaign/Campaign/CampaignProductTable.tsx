import { ICampaign, CampaignStatuses } from "../../../interfaces";
import {
    GridRenderCellParams,
    GridColDef,
    gridStringOrNumberComparator,
    GridPreProcessEditCellProps,
    GridCellParams,
    MuiEvent,
    GridCallbackDetails,
    DataGrid,
    GridRowSelectionModel
} from "@mui/x-data-grid";
import { useDialog } from "dash-dialog";
import { AppDialogOptions } from "dash-dialog/src/IAppDialogProps";
import React, { useState, useCallback, useMemo } from "react";
import { useNotify, useUpdate, useRefresh, useRecordContext } from "react-admin";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
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
import MarketPlacesCell from "../Marketplace/MarketplaceCell";
import CampaignProductsBatchActions from "./CampaignProductsBatchActions";

// Remove React.memo from the component export to ensure it re-renders properly
const CampaignProductTable = ({ products }) => {
    const { id } = useParams();
    const notify = useNotify();
    const [update] = useUpdate();
    const refresh = useRefresh();
    const [editData, setEditData] = useState(undefined);
    const campaign = useRecordContext<ICampaign>();
    const { setError } = useForm();
    const dialog = useDialog();
    const [batchSelectedCampaignProducts, setBatchSelectedCampaignProducts] = useState<any[]>([]);
    
    // Search state
    const [searchText, setSearchText] = useState('');

    const systemMarketplaces = useMemo(() =>
        campaign?.campaign_marketplaces?.map(marketplace => marketplace.marketplace) || [],
        [campaign?.campaign_marketplaces]
    );

    // Filter products based on search text
    const filteredProducts = useMemo(() => {
        if (!searchText.trim()) {
            return products;
        }

        const searchLower = searchText.toLowerCase();
        return products.filter((product) => {
            return (
                product.sku?.toLowerCase().includes(searchLower) ||
                product.name?.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower)
            );
        });
    }, [products, searchText]);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    }, []);

    const columns: GridColDef[] = [
        {
            field: "sku",
            headerName: "SKU",
            type: "string",
            editable: false,
            width: 120,
            sortable: true,
            sortComparator: gridStringOrNumberComparator,
            hideable: false,
        },
        {
            field: "marketPlaces",
            headerName: "Marketplaces",
            type: "number",
            editable: false,
            width: 70,
            renderCell: (params) => <MarketPlacesCell {...params} systemMarketplaces={systemMarketplaces} />,
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
            sortComparator: gridStringOrNumberComparator,
        },
        {
            field: "primary_stock",
            headerName: "Stock de lista",
            type: "number",
            editable: false,
            width: 120,
            sortable: true,
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
            sortComparator: gridStringOrNumberComparator,
        },
        {
            field: "status",
            headerName: "Status",
            type: "number",
            editable: false,
            width: 120,
            sortComparator: gridStringOrNumberComparator,
            renderCell: (params) => <StatusRenderCell {...params} />,
        },
    ];

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

    const enableBatchOperations = useMemo(() =>
        true,
        [campaign?.status]
    );

    const handleCellKeyDown = useCallback((
        params: GridCellParams,
        event: MuiEvent<React.KeyboardEvent>,
        details: GridCallbackDetails
    ) => {
        if (params.cellMode !== "edit") event.stopPropagation();
    }, []);

   const handleRowSelectionChange = useCallback(
    (rowSelectionModel: GridRowSelectionModel | { ids: Set<number | string>, type: string }, details: GridCallbackDetails<any>) => {
        let selectedIds: (number | string)[] = [];

        if (Array.isArray(rowSelectionModel)) {
            selectedIds = rowSelectionModel;
        } else if (rowSelectionModel && typeof rowSelectionModel === "object" && "ids" in rowSelectionModel) {
            // If type is "exclude", all rows except those in ids are selected
            if (rowSelectionModel.type === "exclude") {
                selectedIds = filteredProducts
                    .map(row => row.id)
                    .filter(id => !rowSelectionModel.ids.has(id));
            } else {
                selectedIds = Array.from(rowSelectionModel.ids);
            }
        }

        const selectedRowsData = selectedIds
            .map((id) => filteredProducts.find((row) => row.id === id))
            .filter(Boolean);

        setBatchSelectedCampaignProducts(selectedRowsData);
    },
    [filteredProducts]
);

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

    // If we have a campaign, we can render the full version
    return (
        <>
            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    variant="filled"
                    placeholder="Buscar por SKU, nombre o descripción..."
                    value={searchText}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                   
                />
            </Box>

            {/* Batch Actions */}
            <CampaignProductsBatchActions 
                batchSelectedCampaignProducts={batchSelectedCampaignProducts} 
                campaign={campaign} 
            />

            {/* Data Grid */}
            <DataGrid
                columns={columns}
                rows={filteredProducts}
                editMode="row"
                loading={!products || products.length === 0}
                onCellKeyDown={handleCellKeyDown}
                {...(enableBatchOperations && { checkboxSelection: true })}
                disableRowSelectionOnClick
                onRowSelectionModelChange={handleRowSelectionChange}
               
                processRowUpdate={handleProcessRowUpdate}
                onProcessRowUpdateError={(error: any) => {
                    console.error(error);
                }}
                sx={{
                    '& .MuiDataGrid-root': {
                        border: 'none',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f0f0f0',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#fafafa',
                        borderBottom: '1px solid #d9d9d9',
                    },
                }}
            />
        </>
    );
};

// Export without memo to ensure it re-renders properly
export default CampaignProductTable;
