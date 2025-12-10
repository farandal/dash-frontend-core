/* @deprecated in favor of CampaignEdit.tsx */

import moment from "moment";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CloseCircleOutlined } from "@ant-design/icons";
import { dashStorage } from 'dash-utils';
import {
  Breadcrumb,
  Col,
  Row,
  Button,
  Divider,
  Tag,
  Typography as AntDTypography
} from "antd";

import {
  Card,
  CardContent,
  CardHeader,
  Button as MUIButton,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Box,
} from "@mui/material";
import {
  Loading,
  useGetOne,
  Form,
  SelectInput,
  CheckboxGroupInput,
  useGetList,
  Datagrid,
  TextField,
  TopToolbar,
  FilterButton,
  TextInput,
  useListContext,
  List,
  useUpdate,
  useNotify,
  useCreate,
  useRefresh,
  useDeleteMany,
  useDelete,
} from "react-admin";
import {
  DataGrid as MUIGrid,
  //GridColumns,
  GridEditInputCell,
  GridPreProcessEditCellProps,
  GridRenderEditCellParams,
  GridRowParams,
  //esES,
  GridRenderCellParams,
  GridCell,
  GridCellProps
} from "@mui/x-data-grid";


import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from "react";
import MarketplaceTags from "../Misc/MarketplaceTags";

import CampaignDates from "../Misc/CampaignDates";
import { CampaignStatus } from "./Utils";
import { useRecordContext } from "react-admin";
import { useAxios } from "dash-axios-hook";
import { ICampaign, CampaignStatuses } from "../../interfaces";
import GetProductList from "./Campaign/GetProductList";

moment.locale("es-es");

const MarketplaceEdit: FC = () => {
    
  const navigate = useNavigate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { id, idmp } = useParams();
  const axios = useAxios();

  const [create, { isLoading: isLoadingCreate }] = useCreate();
  const [update, { isLoading: isLoadingUpdate }] = useUpdate();
  const [deleteMany, { isLoading: isLoadingDelete }] = useDeleteMany();

  const { data: campaign, isLoading: campaignIsLoading }: { data: ICampaign, isLoading: boolean } = useGetOne(
    'ecommerce/campaign',
    { id: parseInt(id) },
    { refetchOnWindowFocus: false }
  );

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedTab, setSelectedTab] = useState('product');
  const [open, setOpen] = useState(false);
  const { data: campaignProducts, isLoading: isLoadingCampaignProducts } = useGetList(
    `ecommerce/campaign_marketplace/${id}/products`,
    {
      filter: { selectedProducts: selectedProducts } // TODO: check this
    },
    { refetchOnWindowFocus: false }
  );

  /*useEffect(() => {
      if(campaignProducts){
          const selectedIds = campaignProducts.map(product => product.id);
          setSelectedProducts(selectedIds);
          dashStorage.setItem('RaStore.product.selectedIds', JSON.stringify(selectedIds || []));
      }
  }, [campaignProducts])*/


  const saveSelectedProducts = async () => {
    try {
      if (!isLoadingCreate) {
        await create(
          `campaign_marketplace/${id}/products`,
          { data: { product_ids: selectedProducts } },
          {
            onSuccess: () => { setOpen(false); notify('Productos guardados correctamente.') },
            onError: (error:any) => { console.log(error); notify(`Error al guardar los  productos, ${error?.body?.message || ''}`) },
            returnPromise: true
          }
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      refresh()
    }
  };

  const removeSelectedProducts = async () => {
    try {
      if (!isLoadingCreate) {
        await deleteMany(
          `campaign_marketplace/${id}/products`,
          { ids: selectedProducts },
          {
            onSuccess: () => { setOpen(false); notify('Productos quitados correctamente.') },
            onError: (error: any) => { console.log(error); notify(`Error al quitar los  productos, ${error?.body?.message || ''}`) },

          }
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      refresh()
    }
  };

  const onSubmit = async (data) => {
    try {
      await update(
        `campaign_marketplace`,
        {
          id, data: {
            ...data,
            overwrite_prices: !!data.overwrite_prices
            //,republish_products: !!data.republish_products
          }
        },
        {
          onSuccess: () => { notify('Datos de producto actualizados.') },
          onError: (error: any) => { console.log(error); notify(`Error al guardar los datos del producto, ${error?.body?.message || ''}`) },
          returnPromise: true
        }
      )
    } catch (error) {
      console.error(error);
    }
  };

  const publishCampaign = async () => {
    try {
      const { data } = await axios.put(`/ecommerce/campaign/${id}/publish`);
      console.log(data);
    } catch (error) {

    }
    finally {

    }
  }

  const unpublishCampaign = async () => {
    try {
      const { data } = await axios.put(`/ecommerce/campaign/${id}/pause`);
      console.log(data);
    } catch (error) {

    }
    finally {

    }
  }

  if ((!campaign && campaignIsLoading) || (!campaignProducts && isLoadingCampaignProducts))
    return <Loading />

  return (
    <Form onSubmit={onSubmit} defaultValues={campaign.campaign_marketplaces.find(item => item.id == parseInt(idmp))}>
      <Row>
        <Col span={12}>
          <div >
            <h2 className="dash-page-title">Campañas</h2>
          </div>
          <Breadcrumb separator="/">
            <Breadcrumb.Item>
              <span className="dash-link">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span className="dash-link">Dashboard</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Campañas</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={12}>
          <div className="dash-breadcrumb-btn-container">
            <MUIButton sx={{ borderColor: 'orange', color: 'orange', '&:hover': { backgroundColor: 'orange' } }} className="btn-secondary" onClick={() => navigate(`/campaign/${campaign.id}/show`)}>Mostrar campaña</MUIButton>
            <MUIButton sx={{ borderColor: 'lightblue', color: 'lightblue', '&:hover': { backgroundColor: 'lightblue' } }} className="btn-secondary" onClick={() => navigate(`/campaign/${campaign.id}`)}>Editar campaña</MUIButton>
            {campaign.status === CampaignStatuses.PENDING || campaign.status === CampaignStatuses.PAUSED ?
              <MUIButton sx={{ borderColor: 'green', color: 'green', '&:hover': { backgroundColor: 'green' } }} onClick={() => publishCampaign()}>Publicar campaña</MUIButton>
              : (campaign.status === CampaignStatuses.PUBLISHED ? <MUIButton sx={{ borderColor: 'green', color: 'green', '&:hover': { backgroundColor: 'green' } }} onClick={() => unpublishCampaign()}>Pausar campaña</MUIButton> : <></>)
            }
          </div>
        </Col>
      </Row>
      <Divider  />
      <Row>
        <Col span={7}>
          <Card className="dash-card">
            <CardHeader
              
              title={campaign?.name}
              subheader={CampaignStatus(campaign.status)}
            />
            <CardContent>
              <p>
                {campaign.description}
              </p>

              <div >
                <MarketplaceTags marketplaces={campaign.campaign_marketplaces.map(cmp => cmp.marketplace)} />
                <CampaignDates campaign={campaign} />
              </div>
            </CardContent>
          </Card>
        </Col>
        <Col span={17}>
          <Row>
            <Col span={7}>
              <MUIButton
                sx={{
                  backgroundColor: selectedTab === 'product' ? '#6ea9fe' : 'blue',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#6ea9fe',
                  }
                }}
                onClick={() => setSelectedTab('product')}
              >
                Productos
              </MUIButton>
            </Col>
            <Col span={14}>
              <MUIButton
                sx={{
                  backgroundColor: selectedTab !== 'product' ? '#6ea9fe' : 'blue',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#6ea9fe',
                  }
                }}
                onClick={() => setSelectedTab('priceStock')}>
                Precios y Stocks
              </MUIButton>
            </Col>
          </Row>

          <Card className="dash-card ">
            <CardHeader
              
              title={selectedTab === 'product' ? 'Productos seleccionados' : 'Precios y Stocks'}
            />
            <CardContent className="dash-pt-0">
              {selectedTab === 'product' && <Button onClick={() => setOpen(true)}>Seleccionar productos</Button>}
              {/* @ts-ignore */}
              {selectedTab === 'product' ? (isLoadingCampaignProducts && campaignProducts && campaignProducts.length) ? <Loading /> : <ProductTable products={campaignProducts} /> : <PriceStock />}
              {selectedTab !== 'product' && <Button loading={isLoadingUpdate} htmlType="submit">Guardar precios y stock</Button>}
            </CardContent>
          </Card>
        </Col>
      </Row>
      <Dialog
        fullScreen
        open={open}
        onClose={() => { dashStorage.setItem('RaStore.product.selectedIds', '[]'); refresh(); setOpen(false) }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setOpen(false)}
              aria-label="close"
            >
              <CloseCircleOutlined />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Productos
            </Typography>
            {/* {selectedProducts.length ? <MUIButton sx={{borderColor: 'red', color: 'red', '&:hover': {backgroundColor: 'red'}}}  disabled={isLoadingDelete} autoFocus color="inherit" onClick={() => removeSelectedProducts()}>
                            {isLoadingDelete ? 'Cargando...' : 'Quitar productos'}
                        </MUIButton> : ''} */}
            {selectedProducts.length ? <MUIButton disabled={isLoadingCreate} autoFocus color="inherit" onClick={() => saveSelectedProducts()}>
              {isLoadingCreate ? 'Cargando...' : 'Guardar'}
            </MUIButton> : ''}
          </Toolbar>
        </AppBar>
        <List
          disableSyncWithLocation
          resource='ecommerce/product'
          actions={<TopToolbar><FilterButton /></TopToolbar>}
          filters={[<TextInput label="Buscar" source="q" />]}
        >
          <>
            <GetProductList setProd={(val) => setSelectedProducts(val)} />
            <Datagrid /*bulkActionButCampaignProductPricesEdittons={<></>}*/>
              <TextField source="id" />
              <TextField source="description" label='Nombre' />
              <TextField source="sku" label='SKU' />
            </Datagrid>
          </>
        </List>
      </Dialog>
    </Form>
  );
}

function EditInputCell(props: GridRenderEditCellParams) {
  const { error } = props;

  return (
    <Tooltip sx={{ ...(!!error && { color: 'red' }) }} open={!!error} title={error}>
      <GridEditInputCell {...props} />
    </Tooltip>
  );
}

export interface IPriceEditCell extends GridRenderEditCellParams {
  campaign: ICampaign
}

export const PriceEditCell: FC<IPriceEditCell> = (props) => {
  const { error } = props;
  return (
    <Tooltip sx={{ ...(!!error && { color: 'red' }) }} open={!!error} title={error}>
      <GridEditInputCell {...props} />
    </Tooltip>
  );
}

export interface IPriceRenderCell extends GridRenderCellParams {
  campaign: ICampaign
}

export const PriceRenderCell: FC<IPriceRenderCell> = (props) => {
  return <>{props.value}</>
}

const PriceStock = () => {
  const { data: stockType, isLoading: isLoadingStocks } = useGetList(
    'ecommerce/stock_type',
    { /*pagination: false*/},
    { refetchOnWindowFocus: false }
  );
  const { data: priceList, isLoading: isLoadingPrices } = useGetList(
    'ecommerce/pricelist',
    { /*pagination: false*/ },
    { refetchOnWindowFocus: false }
  );

  if (isLoadingPrices || isLoadingStocks)
    return <Loading />;

  return (
    <Row>
      <Col span={12}>
        <SelectInput fullWidth={true} label='Precio normal' emptyValue='' emptyText='Seleccione una opción' source='source_primary_pricelist_id' choices={priceList} /><br />
        <SelectInput fullWidth={true} label='Precio oferta' emptyValue='' emptyText='Seleccione una opción' source='source_sale_pricelist_id' choices={priceList} />
        <CheckboxGroupInput source='overwrite_prices' label='' choices={[{ id: 'true', name: 'Sobreescribir precios de productos actuales.' }]} />
      </Col>
      <Col span={12}>
        <SelectInput fullWidth={true} label='Stock' emptyValue='' emptyText='Seleccione una opción' source='source_stock_type_id' choices={stockType} />
      </Col>
    </Row>
  )
}

export default MarketplaceEdit
