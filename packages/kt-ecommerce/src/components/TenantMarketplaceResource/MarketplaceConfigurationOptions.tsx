import { ITenantMarketplace } from '../../schemas/tenantMarketplace';
import CloseIcon from '@mui/icons-material/Close';
import { Paper, SwipeableDrawer, IconButton, Typography, DialogContent, DialogActions, Box } from '@mui/material';
import { getCookie } from 'dash-admin/src/utils/cookies';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import { AppDialogOptions } from 'dash-dialog/src/IAppDialogProps';
import React, { useState, useEffect } from 'react';
import { useRecordContext, useRedirect, useRefresh, useNotify, useGetOne, Loading, Button, AppBar, Toolbar } from 'react-admin';
import { useForm, FormProvider } from 'react-hook-form';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';
import SearchableSelectChips from '../SearchableSelectChips';
import { dashStorage } from 'dash-utils';

/** getDescendantProp */
const getDescendantProp = (obj, desc) => {
  var arr = desc.split(".");
  while (arr.length && (obj = obj[arr.shift()]));
  return obj;
}

/** CustomReadOnlyField */
const CustomReadOnlyField: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, option }) => {
  let record = useRecordContext();
  return <Paper elevation={1}
    style={{ padding: "5px", margin: "0px 0px 8px 0px" }}
  ><div><b>{attribute.label}</b></div> <div>{getDescendantProp(record, attribute.attribute)}</div></Paper>
}

const TenantMarketplaceConfigurationOptionsnsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  /**
   *  1. gets the configuration options fron GET /marketplace/{marketplace_instance_id}/exportMetadataMappers
   *  2. formats the configuration optons
   *  3. renders the custom select fields by calling /system_marketplace_metadata_format?system_marketplace_id={marketplace_instance_id}
   *  4. PUT /marketplace/{marketplace_instance_id}/exportMetadataMappers to save the form
   * 
   *  pitfalls: it does not uses the current form context form react-admin
  */

  const [showForm, setShowForm] = useState<boolean>(false);
  const [configurationOptionsSchema, setConfigurationOptionsSchema] = useState<any>(null);

  const redirect = useRedirect();
  const refresh = useRefresh();
  const axios = useAxios();

  // const axios = initAxios();
  const form = useForm();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = form;


  const [openModal, setOpenModal] = useState(false);
  const record = useRecordContext()

  const notify = useNotify();
  const marketplaceInstance: ITenantMarketplace = useRecordContext();
  const dialog = useDialog();

  const tenant_id = dashStorage.getItem('tenant_id');

  async function onSubmit(data) {

    /**
     * Process data
     * 
     * "tenant_id": 1,
     * "export_metadata_mappers": [
     * {
     *  "system_marketplace_metadata_format_id": 40,
     *  "metadata_format_id": 1
     * },
     * */

    const processedData = {
      tenant_id,
      export_metadata_mappers: Object.values(data).map((data) => (data as any)?.system_marketplace_metadata_format_id && data).filter(Boolean)

    }

    try {
      const response = await axios.put(`/ecommerce/marketplace/${record.id}/exportMetadataMappers`, processedData, {});

      if (response.status) {
        notify(`Configuraciones de marketplace guardadas correctamente!`, { type: 'success', autoHideDuration: 5000 });
        /* notify.open({
              type: 'success',
              message: <>{JSON.stringify(response.data)}</>,
              description: '',
              className: 'alert-toast',
              icon: <></>,
              duration: 8,
            });*/
        refresh();
        //window.dispatchEvent(new MessageEvent('package-add-note', { data: response.data }))
      }
      setOpenModal(false);

    } catch (e) {

      errorDialog(<MUISimpleJsonTable vertical tableData={e} />)



    }



  }

  /** success dialog */
  const successDialog = (message = "", options?: Partial<AppDialogOptions>) => {
    dialog(
      {
        variant: "info",
        title: "Conexión realizada exitosamente",
        content: message,
        ...options
      })
  }

  /** error dialog */
  const errorDialog = (message, options?: Partial<AppDialogOptions>) => {
    dialog(
      {
        variant: "danger",
        title: "Ha ocurrido un error.",
        content: message,
        ...options
      })
  }

  /** get configuration schema */
  const {
    data: configurationFormat,
    isLoading: configurationFormatLoading,
    error: configurationFormatError
  } = useGetOne(
    "/ecommerce/marketplace/" + marketplaceInstance.id + "/exportMetadataMappers",
    { id: marketplaceInstance.id }
  );

  /** showForm effect */
  useEffect(() => {
    if (marketplaceInstance) {
      setShowForm(true);
    }
  }, [marketplaceInstance])

  /** configuration schema effect */
  useEffect(() => {
    if (configurationFormat && configurationFormat.export_metadata_mappers && !configurationFormatLoading && marketplaceInstance) {
      let _configurationFormat = configurationFormat?.export_metadata_mappers;
      let parsedSchema = [];
      try {
        parsedSchema = _configurationFormat.map((entry) => {
          return {
            tab: "Configuraciones adicionales",
            label: entry.column_label,
            name: entry.column_name,
            attribute: entry.column_name,
            type: String,
            meta: entry,
            ...(!entry.editable && { custom: true, component: CustomReadOnlyField }),
            ...(method === "edit" && entry?.metadata_format_id && {
              fieldOptions: {
                defaultValue: entry.metadata_format_id
              }
            })
          }
        });
      } catch (error) {
        console.error("Error parsing configuration format:", _configurationFormat, error);
       
      }
      setConfigurationOptionsSchema(parsedSchema);
    }
  }, [configurationFormat, configurationFormatLoading])

  function changeOpenModal() {
    openModal ? setOpenModal(false) : setOpenModal(true);
  }


  const handleClose = () => {
    setOpenModal(false)
  };

  if (configurationFormatLoading || !configurationOptionsSchema) return <Loading />

  return <>

    <Button onClick={changeOpenModal} variant="outlined" className="btn-width-lg" style={{ marginLeft: 'auto' }}><>Panel de configuración</></Button>

    <SwipeableDrawer
      //maxWidth={"xl"}
      anchor={'right'}
      onClose={handleClose}
      open={openModal}
      onOpen={function (event: React.SyntheticEvent<{}, Event>): void {
        throw new Error('Function not implemented.');
      }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...form}>
          <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                position: 'relative',
                padding: '8px 16px'
            }}>
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '64px'
                }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Configuraciones Adicionales
              </Typography>
              {/*  <Button autoFocus color="inherit" onClick={handleClose}>
              save
    </Button> */}
            </Toolbar>
          </Box>
         </Box>

          <DialogContent>
            <section>
              {configurationOptionsSchema.map((inputConfig, idx) => {



                const defaultValue = inputConfig?.meta.metadata_format_id ?
                  {
                    id: inputConfig.meta.metadata_format_id,
                    system_marketplace_metadata_format_id: inputConfig.meta.system_marketplace_metadata_format_id,
                    metadata_format_id: inputConfig.meta.metadata_format_id,
                    name: inputConfig.meta.metadata_format_name
                  }
                  : null;

                return <fieldset key={"fieldset-" + idx}>
                  <legend>{inputConfig.label}</legend>
                  {<SearchableSelectChips
                    metadata={inputConfig}
                    //record={inputConfig}
                    {...defaultValue && { defaultValues: defaultValue }}

                    name={inputConfig.name}
                    resource="ecommerce/metadata_format"
                    label="Búscador de metadatos"
                    viewAttribute='name'
                    valueKeyId="id"
                    queryFilter="q"
                    filter={{ is_internal: 0 }}
                    isMultiple={false}

                    renderText={(option: any, caller: string): any => {

                      return option.name
                    }}
                    isOptionEqualToValue={(option: any, value: any): boolean => {

                      return option.id === value.id;
                    }}


                    transformOption={(option, metadata, parsedOptions, caller) => {

                      return {
                        id: option.id,
                        system_marketplace_metadata_format_id: metadata.meta.system_marketplace_metadata_format_id,
                        metadata_format_id: option.id,
                        name: option.name
                      }


                    }}


                  />}
                </fieldset>
              })}
            </section>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="primary" onClick={changeOpenModal}><>Volver</>
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"><>Guardar</>
            </Button>
          </DialogActions>
        </FormProvider>
      </form>
    </SwipeableDrawer>


  </>
}

/** View component */
const TenantMarketplaceConfigurationOptionsnsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record: ITenantMarketplace = useRecordContext();
  return (
    <>
      <MUISimpleJsonTable vertical tableData={record?.connection_params} />
    </>
  )
}

/** Configuration Component */
const TenantMarketplaceConfigurationOptionsns = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <TenantMarketplaceConfigurationOptionsnsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <TenantMarketplaceConfigurationOptionsnsView attribute={attribute} method={method} resourceConfig={resourceConfig}  />
    case "create":
      return <></>
  }
}

export default TenantMarketplaceConfigurationOptionsns