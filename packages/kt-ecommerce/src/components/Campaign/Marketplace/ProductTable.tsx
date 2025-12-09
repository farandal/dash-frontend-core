import { ICampaign } from "../../../interfaces";
import { GridPreProcessEditCellProps, GridRowParams } from "@mui/x-data-grid";
import { useNotify, useUpdate, useDelete, useRefresh, useRecordContext } from "react-admin";
import { Box } from "react-feather";
import { useParams } from "react-router";
import { PriceEditCell, PriceRenderCell } from "../MarketplaceEdit";

const ProductTable = ({ products }) => {
  const { id } = useParams();
  const notify = useNotify();
  const [update] = useUpdate();
  const [deleteOne] = useDelete();
  const refresh = useRefresh();
  const campaign = useRecordContext();

  const columns: GridColumns = [
    {
      field: 'price',
      headerName: 'Precio normall',
      type: 'number',
      editable: true,
      width: 150,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = '';
        if (!params.props.value && params.props.value !== 0)
          error = 'El precio no puede ser vacio';
        if (params.props.value < 0)
          error = 'El precio no puede ser menor a 0';
        return { ...params.props, error };
      },
      renderEditCell: (props) => <PriceEditCell {...props} campaign={campaign as ICampaign} />,
      renderCell: (props) => <PriceRenderCell {...props} campaign={campaign as ICampaign} />
    },
    {
      field: 'sale_price',
      headerName: 'Precio oferta',
      type: 'number',
      editable: true,
      width: 120,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = '';
        if (!params.props.value && params.props.value !== 0)
          error = 'El precio no puede ser vacio';
        if (params.props.value < 0)
          error = 'El precio no puede ser menor a 0';
        return { ...params.props, error };
      },
      renderEditCell: EditInputCell,
    },
    {
      field: 'sku',
      headerName: 'SKU',
      type: 'string',
      editable: false,
      width: 120
    },
    {
      field: 'stock',
      headerName: 'Stock de campaña',
      type: 'number',
      editable: true,
      width: 120,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        let error = '';
        if (!params.props.value && params.props.value !== 0)
          error = 'El stock no puede ser vacio';
        if (params.props.value < 0)
          error = 'El stock no puede ser menor a 0';
        if (params.props.value > params?.otherFieldsProps?.source_available_stock)
          error = 'El stock tiene que ser mayor al stock de lista';
        return { ...params.props, error };
      },
      renderEditCell: EditInputCell,
    },
    {
      field: 'source_available_stock',
      headerName: 'Stock de lista',
      type: 'number',
      editable: false,
      width: 120
    },
    {
      field: 'local_status',
      headerName: 'Status',
      type: 'number',
      editable: false,
      width: 120,
      renderCell: ProductStatusCell
    },
    {
      field: 'action',
      headerName: 'Acciones',
      type: 'actions',
      getActions: (params: GridRowParams) => {
        return [<AntDTypography.Link onClick={() => removeProduct(params.id)} style={{ marginRight: 8 }}>
          Quitar
        </AntDTypography.Link>]
      },
      width: 90
    }
  ];

  const saveProductEdit = async (data) => {
    try {
      await update(
        `campaign_marketplace/${id}/products`,
        { id: data.id, data },
        {
          onSuccess: () => { notify('Datos de producto actualizados.') },
          onError: (error: any) => { console.log(error); notify(`Error al guardar los datos del producto, ${error?.body?.message || ''}`) },
          returnPromise: true
        }
      );
    } catch (error) {
      console.log(error)
    }
  }

  const removeProduct = async (idProd) => {
    try {
      await deleteOne(
        `campaign_marketplace/${id}/products`,
        { id: idProd },
        {
          onSuccess: () => { notify('Producto quitado correctamente.') },
          onError: (error: any) => { console.log(error); notify(`Error al quitar el producto, ${error?.body?.message || ''}`) },

        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      refresh()
    }
  };

  return (
    <Box
      sx={{
        height: 400,
        width: '100%',
        '& .MuiDataGrid-cell--editing': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#376331' : 'rgb(217 243 190)',
        },
      }}
    >
      <MUIGrid
        columns={columns}
        rows={products || []}
        editMode='row'
        //experimentalFeatures={{ newEditingApi: true }}
        processRowUpdate={(data) => saveProductEdit(data)}
        //localeText={esES.components.MuiDataGrid.defaultProps.localeText}
      />
    </Box>
  )
}

export default ProductTable;
