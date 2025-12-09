
import moment from "moment";
import {
  useEffect,
} from "react";
import { useNavigate, useParams } from "react-router";

import {
  Button as MUIButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Datagrid,
  TextField,
  TopToolbar,
  FilterButton,
  TextInput,
  List,
  useUpdate,
  useNotify,
  useCreate,
  useRefresh,
  useDeleteMany,
} from "react-admin";

import { useRecordContext } from "react-admin";

import { useDispatch } from "react-redux";

import { useRemoveFromStore } from "react-admin";


import { useAxios } from 'dash-axios-hook';
import { ICampaign } from "../../../interfaces";
import { useDialog } from "dash-dialog";
import GetProductList from "./GetProductList";
moment.locale("es-es");


const ProductSelector = ({
    selectedProducts,
    setSelectedProducts
  }) => {
    
    
  const navigate = useNavigate();
  const notify = useNotify();
  const dialog = useDialog();
  const refresh = useRefresh();
  const { id, idmp } = useParams();
  const axios = useAxios();
  const dispatch = useDispatch();

  const [create, { isLoading: isLoadingCreate }] = useCreate();
  const [update, { isLoading: isLoadingUpdate }] = useUpdate();
  const [deleteMany, { isLoading: isLoadingDelete }] = useDeleteMany();
  const campaign: ICampaign = useRecordContext();

  const removeProductStore = useRemoveFromStore("product.selectedIds");

  useEffect(() => {
    return () => removeProductStore();
  }, []);


    const saveSelectedProducts = async () => {
      // moved from CampaignEdit
      // setInTransitionstate is not available here, so omitted
      try {
        if (!isLoadingCreate) {
          await create(
            `/ecommerce/campaign/${id}/products`,
            { data: { product_ids: selectedProducts } },
            {
              onSuccess: () => {
                notify("Productos guardados correctamente.");
                removeProductStore();
              },
              onError: (error: any) => {
                console.log(error);
                /*notify(
                  `Error al guardar los  productos, ${error?.body?.message || ""
                  }`
                );*/
              },
              returnPromise: true,
            }
          );
        }
        navigate(`/ecommerce/campaign/${id}/show`);
      } catch (error) {
        console.log(error);
      } finally {
        refresh();
      }
    };

    return (
      <>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            {selectedProducts.length ? (
              <MUIButton
                disabled={isLoadingCreate}
                color="primary"
                onClick={() => saveSelectedProducts()}
              >
                {isLoadingCreate ? "Cargando..." : "Guardar"}
              </MUIButton>
            ) : (
              ""
            )}
          </Toolbar>
        </AppBar>
        <List
          disableSyncWithLocation
          resource="ecommerce/product"
          actions={
            <TopToolbar
        
            
            >
              <FilterButton />
            </TopToolbar>
          }
          filters={[
            <TextInput
              label="Buscar"
              source="q"
              alwaysOn
            />,
          ]}
          perPage={100}
        >
          <>
            <GetProductList
              setProd={(val) => {
                setSelectedProducts(val);
              }}
            />
            <Datagrid
              style={{ marginTop: 50 }}
              bulkActionButtons={<></>}
            >
              <TextField source="id" />
              <TextField
                source="name"
                label="Nombre"
              />
              <TextField
                source="sku"
                label="SKU"
              />
            </Datagrid>
          </>
        </List>
      </>
    );
  };
  
export default ProductSelector;