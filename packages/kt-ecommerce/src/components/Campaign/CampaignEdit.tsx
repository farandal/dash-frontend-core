import moment from "moment";
import {
  FC,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Loading,
  Form,
  useGetList,
  useUpdate,
  useNotify,
  useCreate,
  useRefresh,
  useDeleteMany,
} from "react-admin";

import Typography from "@mui/material/Typography";
import { useRecordContext } from "react-admin";

import { CampaignStatus } from "./Utils";
import MarketplaceTags from "../Misc/MarketplaceTags";
import CampaignDates from "../Misc/CampaignDates";

import { useDialog } from "../Dialog/DialogService";
import { useDispatch } from "react-redux";

import Logs from "./Tabs/Logs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TabbedShowLayout } from "react-admin";
import { Tab } from "react-admin";
import { useRemoveFromStore } from "react-admin";

import PriceStock from "./Create/PriceStock";

import { AppDialogOptions } from "../Dialog/AppDialog";
import LaravelEchoContext, { ILaravelEchoContext } from "dash-admin/src/contexts/com/LaravelEchoContext";
import { useAxios } from 'dash-axios-hook';
import { LoadingButton } from "@mui/lab";
import { ICampaign, ISocketCampaignTrackerNotificationData, TrackerEndpointResponse, TrackerSummary, ICampaignProduct } from "../../interfaces";
import CampaignButtons from "./Campaign/CampaignButtons";
import CampaignStats from "./Campaign/CampaignStats";
import CampaignProductTable from "./Campaign/CampaignProductTable";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SettingsIcon from "@mui/icons-material/Settings";
import LogsIcon from "@mui/icons-material/History";
import LinkIcon from "@mui/icons-material/Link";
import ProductSelector from "./Campaign/ProductSelector";
import { NotificationWrapper } from 'dash-admin/src/contexts/com/components/NotificationsWidget';
import { toast } from "react-toastify";
import Refresh from "@mui/icons-material/Refresh";
moment.locale("es-es");

/*
Notes:
- Individual product statuses refresh when campaign operations complete (publish, pause, finish)
- Real-time updates via campaign.tracker notifications with status "completed" or "finished"
*/

const CampaignEdit: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const dialog = useDialog();
  const refresh = useRefresh();
  const { id, idmp } = useParams();
  const axios = useAxios();
  const dispatch = useDispatch();

    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
    // This is a hack to avoid a refresh loop by storing the last event we want to listen in localstorage for future refresh.
    // In that way is guarantee, that lastNotification is updated in the react state scope when its really updated. 
    const [lastNotification, setLastNotification] = useState(null);
  
 /*  useEffect(() => {

  const storedEvent = dashStorage.getItem('lastCampaignEvent');
  const currentEvent = JSON.stringify(lastEvent);
  if (lastEvent && storedEvent !== currentEvent) {

    switch (lastEvent.type) {
      case "campaign.status":
      case "campaign.progress":
      case "campaign.error":
        setLastNotification(lastEvent);
        dashStorage.setItem('lastCampaignEvent', currentEvent);
        break;
    }
  }
}, [lastEvent]);*/

useEffect(() => {
  if (!lastEvent) return
  
  switch (lastEvent.data.type) {
    case "campaign.status":
      handleCampaignStatusNotification(lastEvent);
      break;
      
    /*case "campaign.progress":
      handleCampaignProgressNotification(lastEvent);
      break;
     */ 
    case "campaign.error":
      handleCampaignErrorNotification(lastEvent);
      break;
      
   default:

  // Add null/undefined checks before using includes()
  if (lastEvent?.data?.type?.includes("campaign.tracker")) {
    
    // Refresh on failed or completed tracker status (publish, pause, finish)
    if(lastEvent.data.type === "campaign.tracker.failed" || 
       lastEvent.data.status === "completed" ||
       lastEvent.data.status === "finished") {
        refresh();
    }

    handleCampaignTrackerNotification(lastEvent.data);
  }

  if(lastEvent?.data?.type?.includes("job")) {
     refresh();
  }

  break;
  }
}, [lastEvent]);

// Handle campaign status change notifications
const handleCampaignStatusNotification = (event: any) => {
   
  if (event.data?.message) {
    const toastType = getStatusToastType(event.data.new_status);
    
    toast(
      <NotificationWrapper notification={event} key={Date.now()}>
        <div className="flex flex-col">
          <span className="font-medium">{event.data.message}</span>
          {event.data.campaign_name && (
            <span className="text-sm text-gray-600 mt-1">
              Campaña: {event.data.campaign_name}
            </span>
          )}
        </div>
      </NotificationWrapper>,
      {
        position: 'top-right',
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        type: toastType,
      },
    );
  }
  
  // Refresh campaign data if it's the current campaign
  if (event.data.campaign_id && event.data.campaign_id.toString() === campaign?.id?.toString()) {
    refresh();
  }
};

const handleCampaignTrackerNotification = (event: ISocketCampaignTrackerNotificationData) => {
   console.log("updated socket tracker data",event);
   setTrackerSummary(prevState => ({ ...prevState, ...event.tracker_update }))
};

// Add these state variables at the top of your component
/*const [campaignProgress, setCampaignProgress] = useState<{
  isActive: boolean;
  percentage: number;
  processed: number;
  total: number;
  status: string;
  message: string;
} | null>(null);
 */
// Handle campaign progress notifications

/*const handleCampaignProgressNotification = (event: any) => {
  const showToast = false;
  const isCurrentCampaign = event.data.campaign_id && event.data.campaign_id.toString() === campaign?.id?.toString();
  
  // Update progress state for current campaign
  if (isCurrentCampaign) {
    setCampaignProgress({
      isActive: event.data.status !== 'completed' && event.data.status !== 'error' && event.data.stage !== 'completed',
      percentage: event.data.percentage || 0,
      processed: event.data.processed || 0,
      total: event.data.total || 0,
      status: event.data.status || event.data.stage || '', // Use stage as fallback
      message: event.data.message || ''
    });
    
    // Clear progress when completed or error
    if (event.data?.status === 'completed' || event.data?.stage === 'completed' || event.data?.status === 'error') {
      setTimeout(() => setCampaignProgress(null), 3000);
    }
  }

  
  // Show toast notification if enabled
  showToast && toast(
    <NotificationWrapper notification={event} key={Date.now()}>
      <div className="flex flex-col">
        <span className="font-medium">{event.data.message}</span>
        {event.data.campaign_name && (
          <span className="text-sm text-gray-600 mt-1">
            Campaña: {event.data.campaign_name}
          </span>
        )}
        {event.data.percentage !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{event.data.processed || 0} de {event.data.total || 0} productos</span>
              <span>{event.data.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(event.data.percentage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </NotificationWrapper>,
    {
      position: 'top-right',
      autoClose: (event.data.status === 'completed' || event.data.stage === 'completed') ? 5000 : 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      type: getProgressToastType(event.data.status || event.data.stage),
    },
  );
  
  // Update campaign status in real-time if it's the current campaign
  if (isCurrentCampaign) {
    if (event.data?.status === 'completed' || event.data?.stage === 'completed') {
      console.log('Campaign completed, refreshing data...'); // Add this for debugging
      // Refresh data when publishing is completed
      refresh();
    }
  }
};

*/

// Handle campaign error notifications
const handleCampaignErrorNotification = (event: any) => {
  
  if (event.data?.message) {
    toast(
      <NotificationWrapper notification={event} key={Date.now()}>
        <div className="flex flex-col">
          <span className="font-medium text-red-600">{event.data.message}</span>
          {event.data.campaign_name && (
            <span className="text-sm text-gray-600 mt-1">
              Campaña: {event.data.campaign_name}
            </span>
          )}
          {event.data.error && (
            <span className="text-xs text-red-500 mt-1">
              Error: {event.data.error}
            </span>
          )}
        </div>
      </NotificationWrapper>,
      {
        position: 'top-right',
        autoClose: 12000, // Longer for errors
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        type: 'error',
      },
    );
  }
  
  // Refresh campaign data to get updated status
  if (event.data.campaign_id && event.data.campaign_id.toString() === campaign?.id?.toString()) {
    setTimeout(() => refresh(), 1000);
  }
};

// Helper function to determine toast type based on campaign status
const getStatusToastType = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'success';
    case 'PUBLISHING':
    case 'PAUSING':
    case 'FINISHING':
      return 'info';
    case 'PAUSED':
    case 'FINISHED':
      return 'warning';
    case 'PENDING':
      return 'default';
    default:
      return 'default';
  }
};

// Helper function to determine toast type based on progress status
const getProgressToastType = (status: string) => {
  switch (status) {
    case 'started':
      return 'info';
    case 'processing':
      return 'info';
    case 'completed':
      return 'success';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};
  
  const errorDialog = (
    message,
    options?: Partial<AppDialogOptions>
  ) => {
    dialog({
      variant: "danger",
      title: "Ha ocurrido un error.",
      content: message,
      ...options,
    });
  };

  const [inTransitionState, setInTransitionstate] = useState<boolean>(false);

  const [create, { isLoading: isLoadingCreate }] = useCreate();
  const [update, { isLoading: isLoadingUpdate }] = useUpdate();
  const [deleteMany, { isLoading: isLoadingDelete }] = useDeleteMany();
  const campaign: ICampaign = useRecordContext();

  const [selectedProducts, setSelectedProducts] = useState([]);

  const {
    data: campaignProducts,
    isLoading: isLoadingCampaignProducts,
  }: { data: ICampaignProduct[]; isLoading: boolean } = useGetList(
    `/ecommerce/campaign/${id}/products`,
   
    /* @ts-ignore pagination */
    { pagination: false, 
      ...(selectedProducts.length > 0 && { selectedProducts })
    },
    { 
        meta: { removeSortFilters: true },
        refetchOnWindowFocus: false,
           returnPromise: true,
     }
  );
  useEffect(() => {
    if (
      campaign?.status &&
      ["PUBLISHED", "PAUSED", "FINISHED"].includes(campaign.status)
    ) {
      setInTransitionstate(false);
    }

    if(campaign?.tracker_summary) {
        setTrackerSummary(campaign.tracker_summary);
    }

  }, [campaign]);

    const removeProductStore = useRemoveFromStore("product.selectedIds");

  const onSubmit = async (data) => {
    setInTransitionstate(true);

    const _data = {
      source_primary_pricelist_id: data.source_primary_pricelist_id,
      source_sale_pricelist_id: data.source_sale_pricelist_id,
      source_stock_type_id: data.source_stock_type_id,
      overwrite_prices: !!data.overwrite_prices,
      republish_products: !!data.republish_products,
    };

    try {
      await update(
        `/ecommerce/campaign/${id}/campaign_marketplaces`,
        {
          id: id,
          data: _data,
        },
        {
          onSuccess: () => {
            notify("Datos de producto actualizados.");
          },
          onError: (error: any) => {
            console.log(error);
            notify(
              `Error al guardar los datos del producto. ${error?.body?.message || ""
              } ${error?.message || ""}`
            );
          },
          returnPromise: true,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setInTransitionstate(false);
      removeProductStore();
      refresh();
    }
  };

  

const [trackerSummary,setTrackerSummary] = useState<TrackerSummary>(null);

const publishCampaign = async () => {
  try {
    setInTransitionstate(true);
    const publishResponse = await axios.put(`/ecommerce/campaign/${id}/publish`);

    if(publishResponse.data?.tracker_id) {
    
          const {data:trackerData} = await axios.get<TrackerEndpointResponse>(`/ecommerce/campaign/tracker/${publishResponse.data?.tracker_id}`);
         
          setTrackerSummary(trackerData.data);
    }
     } catch (error) {
    errorDialog(error);
  }
};

  const unpublishCampaign = async () => {
    try {
      setInTransitionstate(true);
      const { data } = await axios.put(`/ecommerce/campaign/${id}/pause`);
      console.log(data);
    } catch (error) {
      dialog({
        variant: "danger",
        title: "Error",
        content: "Ha ocurrido un error al despublicar la campaña",
        onSubmit: () => { },
        onClose: () => { },
      });
    } finally {
      refresh();
    }
  };



const updateCampaign = async () => {
  try {
    setInTransitionstate(true);
    const publishResponse = await axios.put(`/ecommerce/campaign/${id}/republish`);

    if(publishResponse.data?.tracker_id) {
    
          const {data:trackerData} = await axios.get<TrackerEndpointResponse>(`/ecommerce/campaign/tracker/${publishResponse.data?.tracker_id}`);
          
          setTrackerSummary(trackerData.data);
    }
     } catch (error) {
    errorDialog(error);
  }
};


  const resetCampaign = async () => {
    try {
      setInTransitionstate(true);
      const { data } = await axios.put(`/ecommerce/campaign/${id}/reset`);
      refresh();
      setInTransitionstate(false);
    } catch (error) {
      dialog({
        variant: "danger",
        title: "Error",
        content: "Ha ocurrido un error al resetear la campaña",
        onSubmit: () => { },
        onClose: () => { },
      });
    }
  };


  useEffect(() => {
    if (campaignProducts) {
      window.dispatchEvent(
        new MessageEvent('dash-global-loader', { data: false })
      );
    }
  }, [campaignProducts]);

  if (!campaign || !(campaignProducts && !isLoadingCampaignProducts))
    return <Loading />;
  

  return <Grid container direction="column">
        {/* @ts-ignore*/}
        <Grid>
           
          <Card >
            <CardHeader
              title={campaign?.name}
              subheader={CampaignStatus(campaign.status)}
              action={<CampaignButtons 
                        campaign={campaign}
                        inTransitionState={inTransitionState}
                        navigate={navigate}
                        publishCampaign={publishCampaign}
                        unpublishCampaign={unpublishCampaign}
                        updateCampaign={updateCampaign}
                        resetCampaign={resetCampaign}
            />}
            />
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="card-content-accordion-content"
                id="card-content-accordion-header"
              >
                  <CampaignDates campaign={campaign} />
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                {/* @ts-ignore*/}
                  <Grid xs={12} md={6}>
                    <MarketplaceTags
                      marketplaces={(
                        campaign?.campaign_marketplaces || []
                      ).map((cmp) => cmp.marketplace)}
                    />
                  
                  </Grid>
                   {/* @ts-ignore*/}
                  <Grid xs={12} md={6}>
                    <CampaignStats campaign={campaign} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="publication-progress-accordion-content"
                id="publication-progress-accordion-header"
              >
                <Typography>
                  Última actualización: 
                  {[
                    { label: 'Acción', value: trackerSummary?.action },
                    { label: 'Estado', value: trackerSummary?.status, error: trackerSummary?.status === 'failed' },
                    { label: 'Progreso Total', value: trackerSummary?.progress != null ? `${trackerSummary.progress}%` : null }
                  ].map(({ label, value, error }, index) => (
                    <Chip
                      key={index}
                      label={`${label}: ${value ?? '-'}`}
                      color={error ? "error" : "default"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  ))}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px' }}>Usuario</td>
                        <td style={{ padding: '4px' }}>Operación</td>
                        <td style={{ padding: '4px' }}>Nombre campaña</td>
                        {trackerSummary?.user_metadata?.failure_reason && (
                          <td style={{ padding: '4px' }}>Motivo de fallo</td>
                        )}
                        <td style={{ padding: '4px' }}>Iniciado</td>
                        <td style={{ padding: '4px' }}>Completado</td>
                        <td style={{ padding: '4px' }}>Última actividad</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px' }}>{`${trackerSummary?.user_metadata?.user_name ?? '-'} (ID: ${trackerSummary?.user_metadata?.user_id ?? '-'})`}</td>
                        <td style={{ padding: '4px' }}>{trackerSummary?.user_metadata?.operation ?? '-'}</td>
                        <td style={{ padding: '4px' }}>{trackerSummary?.user_metadata?.campaign_name ?? '-'}</td>
                        {trackerSummary?.user_metadata?.failure_reason && (
                          <td style={{ padding: '4px', color: 'red' }}>{trackerSummary.user_metadata.failure_reason}</td>
                        )}
                        <td style={{ padding: '4px' }}>{trackerSummary?.started_at ? new Date(trackerSummary.started_at).toLocaleString() : '-'}</td>
                        <td style={{ padding: '4px' }}>{trackerSummary?.completed_at ? new Date(trackerSummary.completed_at).toLocaleString() : '-'}</td>
                        <td style={{ padding: '4px' }}>{trackerSummary?.last_activity_at ? new Date(trackerSummary.last_activity_at).toLocaleString() : '-'}</td>
                      </tr>
                    </tbody>
                  </table>
              

                <Box sx={{ mt: 2 }}>
                  {trackerSummary?.progress != null && (
                    <LinearProgress
                      variant="determinate"
                      value={trackerSummary.progress}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                        },
                      }}
                    />
                  )}
                  {trackerSummary?.phases &&
                    Object.entries(trackerSummary.phases).map(([phaseName, phase]) => (
                      <Box key={phaseName} sx={{ mt: 1 }}>
                        <Tooltip title={
                          <Box>
                            <Typography variant="body2">{phaseName.replace(/_/g, ' ').toUpperCase()}</Typography>
                            <Typography variant="caption">Estado: {phase?.status}</Typography>
                            <Typography variant="caption">Progreso: {phase?.progress != null ? `${phase.progress}%` : '-'}</Typography>
                            <Typography variant="caption">Procesados: {`${phase?.processed_items ?? '-'}${phase?.total_items != null ? `/${phase.total_items}` : ''}`}</Typography>
                            <Typography variant="caption">Exitosos: {phase?.successful_items ?? '-'}</Typography>
                            <Typography variant="caption">Fallidos: {phase?.failed_items ?? '-'}</Typography>
                            {phase?.errors?.length > 0 && (
                              <Typography variant="caption" color="error">
                                Errores: {phase.errors.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        } arrow>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="primary.contrastText">
                              {phaseName.replace(/_/g, ' ').toUpperCase()} ({phase?.progress ?? 0}%)
                            </Typography>
                            <LinearProgress variant="determinate" value={phase?.progress ?? 0} sx={{ flex: 1 }} />
                          </Box>
                        </Tooltip>
                      </Box>
                    ))}
                </Box>                 
              </AccordionDetails>
            </Accordion>            
             </Card>

        </Grid>
         {/* @ts-ignore*/}
        <Grid xs={12}>
          <Card sx={{ p:0 ,pb: 0 }} >
            <CardContent sx={{ p: 0, pb: 0 }}>
              <TabbedShowLayout>
                <Tab icon={<Inventory2Icon />}  label="Productos">
                  <Form
                    onSubmit={onSubmit}
                  >
                    <CampaignProductTable
                        products={campaignProducts}
                      />
                  
                  </Form>
                </Tab>

                <Tab icon={<LinkIcon />} label="Asociar Productos" path="uplaod">

                <ProductSelector
                    selectedProducts={selectedProducts}
                    setSelectedProducts={setSelectedProducts}
                  />
                
                </Tab>
                
                <Tab
                  label="Precios y Stocks"
                  path="stockprices"
                  icon={<SettingsIcon />}                
                   >
                  <Form
                    onSubmit={onSubmit}
                  >
                    <PriceStock />
                    <LoadingButton
                      loading={isLoadingUpdate}
                      type="submit"
                      variant="contained"
                    >
                      <Typography>Guardar precios y stock</Typography>
                    </LoadingButton>
                  </Form>
                </Tab>
                
                {/*<Tab label="Subir Excel" path="asociate">
                  <AssociateProducts />
                </Tab>*/}
              
                {/*<Tab icon={<LogsIcon />} label="Logs" path="logs">
                  <Logs />
                </Tab>*/}

                {/*<Tab icon={<Refresh />} label="Refrescar" path="refresh" onClick={() => refresh()} ><></></Tab>*/}

              </TabbedShowLayout>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
};


/*
function ProductStatusCell(props: GridRenderCellParams) {

    return <MUIHtmlTooltip
        title={
            <React.Fragment>
                <Typography color="inherit">Historial</Typography>
                {JSON.stringify(props.row?.local_status_history)}
            </React.Fragment>
        }
    >
        <Typography color="inherit">{props.formattedValue}</Typography>
    </MUIHtmlTooltip>

}
*/


export default CampaignEdit;
