import { IconButtonProps, IconButton, CardHeader, CardActions, CardContent, Typography, Box, Card, Chip, Alert } from "@mui/material";
import LogFileById from 'dash-admin/src/components/logs/LogFileById';
import useGlobalLoaderMgr from 'dash-admin/src/hooks/useGlobalLoaderMgr';
import { formatNotification} from "dash-admin/src/contexts/com/components/notificationFormats";
import LaravelEchoContext, { ILaravelEchoContext } from "dash-admin/src/contexts/com/LaravelEchoContext";
import { getCookie, setCookie } from "dash-admin/src/utils/cookies";
import AppDialog, { useDialog } from "dash-dialog";
import React, { useContext, useState, useEffect } from "react";
import { LinearProgressProps, LinearProgress, useRecordContext, Identifier, useRefresh, Loading, Button, useTranslate } from "react-admin";
import { ProductImportLogComponent } from "../ProductImportLog";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';
import { NotificationWrapper } from "dash-admin/src/contexts/com/components/NotificationsWidget";
import { NotificationComponent } from "dash-admin/src/contexts/com/components/NotificationRenderer";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";
import { IDashNotificationPayloadBase } from "dash-admin/src/interfaces/communication/INotification";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { dashStorage } from 'dash-utils';
import { useProductImportState } from './ProductImportContext';
const LinearProgressWithLabel = (
  props: LinearProgressProps & { value: number }
) => {
  return (
    <Box component="div" sx={{ display: "flex", alignItems: "center" }}>
      <Box component="div" sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box component="div" sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

// Enhanced progress component for normalized imports
const NormalizedProgressComponent = ({ progress, stats, mode }: { 
  progress: any, 
  stats: any, 
  mode: 'preview' | 'import' 
}) => {
  const translate = useTranslate();
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {mode === 'preview' 
          ? translate('resource.import.instances.progress.title_preview') 
          : translate('resource.import.instances.progress.title_import')}
      </Typography>
      
      {/* Main Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <LinearProgressWithLabel
          value={progress?.percent || 0}
          color="primary"
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {translate('resource.import.instances.progress.processed_count', { 
            processed: progress?.processed || 0, 
            total: progress?.total || 0 
          })}
        </Typography>
      </Box>

      {/* Current Status */}
      {progress?.current_sku && progress.current_sku !== 'completed' && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" component="span">
            {translate('resource.import.instances.progress.currently_processing')}
          </Typography>
          <Chip label={progress.current_sku} size="small" color="primary" />
        </Box>
      )}

      {/* Stats Grid */}
      {stats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2, 
          mb: 2 
        }}>
          {mode === 'preview' ? (
            <>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.to_create')}</Typography>
                <Typography variant="h6" color="success.main">
                  {stats.products_to_create || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.to_update')}</Typography>
                <Typography variant="h6" color="info.main">
                  {stats.products_to_update || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.categories_to_create')}</Typography>
                <Typography variant="h6">
                  {stats.categories_to_create || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.brands_to_create')}</Typography>
                <Typography variant="h6">
                  {stats.brands_to_create || 0}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.created')}</Typography>
                <Typography variant="h6" color="success.main">
                  {stats.products_created || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.updated')}</Typography>
                <Typography variant="h6" color="info.main">
                  {stats.products_updated || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.categories_created')}</Typography>
                <Typography variant="h6">
                  {stats.categories_created || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.galleries_created')}</Typography>
                <Typography variant="h6">
                  {stats.galleries_created || 0}
                </Typography>
              </Box>
            </>
          )}
          
          {/* Common stats */}
          <Box>
            <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.errors')}</Typography>
            <Typography variant="h6" color={stats.errors_count > 0 ? "error.main" : "text.primary"}>
              {stats.errors_count || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{translate('resource.import.instances.stats.skipped')}</Typography>
            <Typography variant="h6" color={stats.skipped_rows > 0 ? "warning.main" : "text.primary"}>
              {stats.skipped_rows || 0}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Last Update */}
      {progress?.timestamp && (
        <Typography variant="caption" color="text.secondary">
          {translate('resource.import.instances.progress.last_updated', { 
            time: new Date(progress.timestamp).toLocaleTimeString() 
          })}
        </Typography>
      )}
    </Box>
  );
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ProductImportComponentEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  // No se puede editar el status desde el panel
  const record = useRecordContext();
  return <></>;
};

const IMPORT_STEPS = [
  "ImportingProductData",
  "ImportingPrices",
  "ImportingStocks",
  "UpdatingPackStocks",
  "ImportingProductMetadata",
];

export interface IProgressUpdate {
  productImportInstanceId: Identifier;
  phaseName: string;
  phaseNumber: number;
  processedItems: number;
  totalItems: number;
  totalPhases: number;
}

export interface IProgressObject {
  [x: string]: IProgressUpdate;
}

// Interface for normalized import progress - now imported from context
// Using types from ProductImportContext

const ProductImportComponentView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const record = useRecordContext();
  const axios = useAxios();
  const refresh = useRefresh();
  const translate = useTranslate();

  // Get state from context (provided by contextComponent in resource config)
  const contextState = useProductImportState();
  const { 
    normalizedProgress: contextProgress, 
    normalizedStats: contextStats, 
    isNormalizedImportActive: contextImportActive,
    importStats: contextImportStats,
    lastImportEvent,
    clearProgress
  } = contextState;

  // Debug: Log context state on every render
  console.log('🟡🟡🟡 [ProductImportComponent] Context state 🟡🟡🟡', {
    hasContextProgress: !!contextProgress,
    hasContextStats: !!contextStats,
    contextImportActive,
    hasLastImportEvent: !!lastImportEvent,
    lastImportEventType: lastImportEvent?.type || lastImportEvent?.notificationPayload?.type,
    // Check if we're using default context (not provided)
    isDefaultContext: contextState === undefined || Object.keys(contextState).length === 0
  });

  // Local state for UI-specific needs (will be synced with context)
  const [localProgress, setLocalProgress] = useState<any>(null);
  const [localStats, setLocalStats] = useState<any>(null);
  const [localImportActive, setLocalImportActive] = useState(false);

  // Merge context and local state (local takes precedence during active import)
  const normalizedProgress = localImportActive ? localProgress : contextProgress;
  const normalizedStats = localImportActive ? localStats : contextStats;
  const isNormalizedImportActive = localImportActive || contextImportActive;
  const importStats = contextImportStats;

  // Legacy template import progress (kept local as it's not used in context)
  const [progress, setProgress] = useState<IProgressObject>();
  
  const [stats, setStats] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [notificationDialogOpen, SetNotificationDialogOpen] = React.useState(false);
  const [notificationDialogProps, SetNotificationDialogProps] = React.useState(null);

  // Legacy notification handling for class-based notifications (template imports)
  const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
  const [lastNotification, setLastNotification] = useState(null);

  // Sync local state with context events during import
  useEffect(() => {
    console.log('[ProductImportComponent] useEffect triggered, lastImportEvent:', {
      hasEvent: !!lastImportEvent,
      eventType: lastImportEvent?.type || lastImportEvent?.data?.type || lastImportEvent?.notificationPayload?.type,
      rawEvent: lastImportEvent
    });
    
    if (!lastImportEvent) return;
    
    // Check multiple possible locations for event type
    const eventType = lastImportEvent.type || 
                      lastImportEvent.data?.type || 
                      lastImportEvent.notificationPayload?.type ||
                      lastImportEvent.notificationPayload?.stdClass?.type ||
                      lastImportEvent.notificationPayload?.notificationPayload?.type;
    
    // Get notification data from multiple possible locations
    const notificationData = lastImportEvent.data || 
                             lastImportEvent.notificationPayload?.notificationPayload ||
                             lastImportEvent.notificationPayload?.stdClass?.notificationPayload ||
                             {};
    
    console.log('[ProductImportComponent] Syncing with context event:', eventType, {
      notificationData,
      currentLocalImportActive: localImportActive
    });
    
    switch (eventType) {
      case 'import.started':
        setLocalImportActive(true);
        setLocalProgress(null);
        setLocalStats(null);
        break;
        
      case 'import.progress':
        if (notificationData.progress) {
          setLocalProgress(notificationData.progress);
        }
        if (notificationData.stats) {
          setLocalStats(notificationData.stats);
        }
        break;
        
      case 'import.completed':
        console.log('✅✅✅ [ProductImportComponent] IMPORT COMPLETED - Setting localImportActive=FALSE ✅✅✅');
        setLocalImportActive(false);
        setLocalProgress(prev => ({
          ...prev,
          percent: 100,
          current_sku: 'completed',
          timestamp: new Date().toISOString()
        }));
        if (notificationData.stats) {
          setLocalStats(notificationData.stats);
        }
        
        // Show completion dialog
        SetNotificationDialogOpen(true);
        SetNotificationDialogProps({
          variant: "success",
          title: "",
          showCloseButton: true,
          content: <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
        });
        break;
        
      case 'import.failed':
        setLocalImportActive(false);
        
        SetNotificationDialogOpen(true);
        const error = formatNotification<IDashNotificationPayloadBase>(lastImportEvent);
        SetNotificationDialogProps({
          variant: "error",
          title: error.title,
          content: (
            <NotificationWrapper notification={lastImportEvent} key={0}>
              <NotificationComponent notification={lastImportEvent} />
            </NotificationWrapper>
          ),
        });
        break;
        
      case 'import.already_completed':
        setLocalImportActive(false);
        setLocalProgress(null);
        
        const modeLabel = notificationData.mode === 'preview' 
          ? translate('resource.import.instances.tabs.preview') 
          : translate('resource.import.instances.tabs.import');
        
        SetNotificationDialogOpen(true);
        SetNotificationDialogProps({
          variant: "info",
          title: translate('resource.import.instances.dialog.already_completed.title', { mode: modeLabel }),
          content: (
            <Alert severity="info">
              <Typography variant="body1">
                {translate('resource.import.instances.dialog.already_completed.message', { mode: modeLabel })}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {translate('resource.import.instances.dialog.already_completed.status', { status: notificationData.completed_status })}
              </Typography>
              <Typography variant="body2">
                {translate('resource.import.instances.dialog.already_completed.footer')}
              </Typography>
            </Alert>
          ),
        });
        break;
    }
  }, [lastImportEvent]);

  // Legacy class-based notification handler for template imports only
  useEffect(() => {
    if (!lastEvent) return;
    
    // Only handle class-based notifications here (context handles type-based)
    // Check multiple possible locations for event type
    const eventType = lastEvent.type || 
                      lastEvent.data?.type || 
                      lastEvent.notificationPayload?.type ||
                      lastEvent.notificationPayload?.stdClass?.type ||
                      lastEvent.notificationPayload?.notificationPayload?.type;
    if (eventType) return; // Let context handle type-based events
    
    const notificationClass = lastEvent.notificationPayload?.class ||
                              lastEvent.notificationPayload?.stdClass?.class;
    if (!notificationClass) return;
    
    // Check for duplicate
    const storedEvent = dashStorage.getItem('lastImportEvent');
    const currentEvent = JSON.stringify(lastEvent);
    if (storedEvent === currentEvent) return;
    
    switch (notificationClass) {
      case "ValidateProductImportNotification":
      case "ProductImportNotification":
      case "ProductImportProgressNotification":
      case "ProductImportErrorNotification":
        console.log('[ProductImportComponent] Legacy class notification:', notificationClass);
        setLastNotification(lastEvent);
        dashStorage.setItem('lastImportEvent', currentEvent);
        break;
    }
  }, [lastEvent]);

  // Handle legacy class-based notifications (template imports)
  useEffect(() => {
    if (!lastNotification) return

    // Handle multiple possible locations for class name
    const notificationClass = lastNotification.notificationPayload?.class ||
                              lastNotification.notificationPayload?.stdClass?.class;
    
    // Get notification payload data from multiple possible locations
    const notificationPayloadData = lastNotification.notificationPayload?.notificationPayload ||
                                    lastNotification.notificationPayload?.stdClass?.notificationPayload;

    switch (notificationClass) {
        
      case "ValidateProductImportNotification":
        // Extract and display validation stats for template mode
        const validationData = notificationPayloadData;
        if (validationData && validationData.json && validationData.json.info) {
          setStats({
            ...validationData.json.info,
            log_id: validationData?.id
          });
        }
        setLastNotification(null);
        break;
        
      case "ProductImportNotification":
      case "ProductImportProgressNotification":
        setLastNotification(null);
        break;
        
      case "ProductImportErrorNotification":
        setLastNotification(null);
        SetNotificationDialogOpen(true);
       
        const legacyError = formatNotification<IDashNotificationPayloadBase>(lastNotification);
        SetNotificationDialogProps({
          variant: "error",
          title: legacyError.title,
          content: (
            <NotificationWrapper notification={lastNotification} key={0}>
              <NotificationComponent notification={lastNotification} />
            </NotificationWrapper>
          ),
        });
        break;
        
      default:
        const formattedNotification = formatNotification<IDashNotificationPayloadBase>(lastNotification);
        SetNotificationDialogOpen(true);
        SetNotificationDialogProps({
          variant: "info",
          title: formattedNotification.title,
          content: (
            <NotificationWrapper notification={lastNotification} key={0}>
              <NotificationComponent notification={lastNotification} />
            </NotificationWrapper>
          ),
        });
        setLastNotification(null);
        refresh();
        break;
    }
  }, [lastNotification]);


 const startProcess = async (e: any) => {
  setShowImportProgress(true);

  const importData = {
    tenant_id:dashStorage.getItem('tenant_id'),
    product_import_instance_id: record.id,
    preview_mode: attribute.attribute === "preview_log_id" ? 1 : 0,
    import_type: record.import_type || 'normalized',
    options: record.options || {}
  };

  // Reset normalized progress when starting
  if (record.import_type === 'normalized') {
    setLocalImportActive(true);
    setLocalProgress(null);
    setLocalStats(null);
  }

  try {
    const {data} = await axios.post(`/ecommerce/product/import`, importData);
    
    // Handle immediate responses from controller
    if (data.already_completed) {
      // Stop the loading state
      setLocalImportActive(false);
      
      // Clear any stuck progress
      setLocalProgress(null);
      
      // Show info notification
      SetNotificationDialogOpen(true);
      const modeLabel = importData.preview_mode ? translate('resource.import.instances.tabs.preview') : translate('resource.import.instances.tabs.import');

      SetNotificationDialogProps({
        variant: "info",
        title: translate('resource.import.instances.dialog.already_completed.title', { mode: modeLabel }),
        content: (
          <Alert severity="info">
            <Typography variant="body1">
              {data.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {translate('resource.import.instances.dialog.already_completed.status', { status: data.status })}
            </Typography>
            <Typography variant="body2">
              {translate('resource.import.instances.dialog.already_completed.footer')}
            </Typography>
          </Alert>
        ),
      });
      
      // Refresh the record to show current state
      /*setTimeout(() => {
        refresh();
      }, 1000);*/
      
      return; // Exit early
    }
    
    if (data.already_running) {
      // Stop the loading state
      setLocalImportActive(false);
      
      // Show info notification
      SetNotificationDialogOpen(true);
      const modeLabel = importData.preview_mode ? translate('resource.import.instances.tabs.preview') : translate('resource.import.instances.tabs.import');

      SetNotificationDialogProps({
        variant: "info",
        title: translate('resource.import.instances.dialog.already_running.title', { mode: modeLabel }),
        content: (
          <Alert severity="info">
            <Typography variant="body1">
              {data.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {translate('resource.import.instances.dialog.already_running.status', { status: data.status })}
            </Typography>
            <Typography variant="body2">
              {translate('resource.import.instances.dialog.already_running.footer')}
            </Typography>
          </Alert>
        ),
      });
      
      // Refresh the record to show current state
      /*setTimeout(() => {
        refresh();
      }, 1000);*/
      
      return; // Exit early
    }
    
    // Handle successful queue response
    if (data.queued) {
      // Job was successfully queued, wait for socket notifications
      // The loading state and progress will be handled by socket notifications
      return;
    }
    
    // Handle preview mode immediate results (for template imports)
    if (data.preview_mode === 1 && data.stats) {
      setLocalImportActive(false);
      setStats(JSON.parse(JSON.stringify(data.stats)));
    }

  } catch (error:any) {
    console.error('Import failed:', error);
    setLocalImportActive(false);
    
    // Show error dialog for actual failures
    SetNotificationDialogOpen(true);
    SetNotificationDialogProps({
      variant: "error",
      title: "Error",
      content: (
        <Alert severity="error">
        {error.response?.data?.message || error.message || 'error'}
        </Alert>
      ),
    });
  }
};

  const [expanded, setExpanded] = React.useState(false);
  const [showImportProgress, setShowImportProgress] = useState<boolean>(true);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Legacy template progress component
  const TemplateProgressComponent = () => {
    return (
      <Box sx={{ width: "100%" }}>
        {progress &&
          Object.keys(progress).map((step) => {
            let percent =
              (progress[step].processedItems /
                progress[step].totalItems) *
              100;

            return (
              <Box key={step} sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {step} - {progress[step].processedItems} /{" "}
                  {progress[step].totalItems} - {Math.round(percent)}%
                </Typography>
                <LinearProgressWithLabel
                  color="secondary"
                  value={percent}
                />
              </Box>
            );
          })}
      </Box>
    );
  };

  // Determine which progress component to show
  // Show normalized progress for BOTH normalized AND template imports when we have type-based notifications
  // This supports the unified notification format across both import types
  const shouldShowNormalizedProgress = 
    (isNormalizedImportActive || normalizedProgress);
  
  const shouldShowTemplateProgress = !shouldShowNormalizedProgress &&
    record.import_type !== 'normalized' && 
    attribute.attribute === "import_log_id" && 
    record.status !== "IMPORT_COMPLETED";

  return (
    <>
      {/*<AppDialog
        open={importDialogOpen}
        variant={"info"}
        title={"Import Dialog"}
        content={
          <Loading
            loadingPrimary={"Import process has started"}
            loadingSecondary={"Please wait a moment"} 
          />
        } 
        children={undefined} 
      />*/}

      <AppDialog
        open={notificationDialogOpen}
        variant={notificationDialogProps?.variant || "info"}
        title={notificationDialogProps?.title || "Notification"}
        content={notificationDialogProps?.content || <></>} 
        children={undefined}
        onClose={() => SetNotificationDialogOpen(false)}
      />

      <Card>
        {attribute.attribute == "preview_log_id" ? (
          <CardHeader
            title={translate('resource.import.instances.headers.preview_title')}
            subheader={
              record.import_type === 'normalized' 
                ? translate('resource.import.instances.headers.preview_normalized_sub')
                : translate('resource.import.instances.headers.preview_template_sub')
            }
          />
        ) : (
          <CardHeader
            title={translate('resource.import.instances.headers.import_title')}
            subheader={
              record.import_type === 'normalized'
                ? translate('resource.import.instances.headers.import_normalized_sub')
                : translate('resource.import.instances.headers.import_template_sub')
            }
          />
        )}

        <CardActions disableSpacing>
          {(record.status == "NOT_INITIATED" ||
            record.status == "PREVIEW_COMPLETED") &&
            attribute.attribute == "preview_log_id" ? (
            <>
              <Button 
                onClick={startProcess}
                disabled={isNormalizedImportActive}
                variant="contained"
                color="primary"
              >
                {isNormalizedImportActive 
                  ? translate('resource.import.instances.actions.preview_in_progress') 
                  : translate('resource.import.instances.actions.preview_start')}
              </Button>
            </>
          ) : (
            <></>
          )}

          {(record.status == "NOT_INITIATED" ||
            record.status == "PREVIEW_COMPLETED") &&
            attribute.attribute == "import_log_id" ? (
            <>
              <Button 
                onClick={startProcess}
                disabled={isNormalizedImportActive}
                variant="contained"
                color="primary"
              >
                {isNormalizedImportActive 
                  ? translate('resource.import.instances.actions.import_in_progress') 
                  : translate('resource.import.instances.actions.import_start')}
              </Button> 
            </>
          ) : (
            <></>
          )}
        </CardActions>

        <CardContent>
          {/* Show normalized progress for normalized imports */}
          {shouldShowNormalizedProgress && (
            <NormalizedProgressComponent 
              progress={normalizedProgress}
              stats={normalizedStats}
              mode={attribute.attribute === "preview_log_id" ? 'preview' : 'import'}
            />
          )}

          {/* Show template progress for template imports */}
          {shouldShowTemplateProgress && (
            <TemplateProgressComponent />
          )}

          {/* Show immediate stats or wait for socket progress */}
          {stats && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {translate('resource.import.instances.results.title', { 
                  mode: attribute.attribute === "preview_log_id" 
                    ? translate('resource.import.instances.tabs.preview') 
                    : translate('resource.import.instances.tabs.import') 
                })}
              </Typography>
              <MUISimpleJsonTable tableData={JSON.parse(JSON.stringify(stats))} vertical showKey />
              {stats.log_id && <LogFileById id={stats.log_id} />}
            </Box>
          )}
          
          {/* Show final import stats */}
          {importStats && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Final Import Results
              </Typography>
              <MUISimpleJsonTable tableData={JSON.parse(JSON.stringify(importStats))} vertical showKey />
              {importStats.log_id && <LogFileById id={importStats.log_id} />}
            </Box>
          )}

          {/* Show completion message for normalized imports */}
          {record.import_type === 'normalized' && normalizedProgress?.percent === 100 && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success">
                <Typography variant="h6">
                  {attribute.attribute === "preview_log_id" ? "Preview" : "Import"} Completed Successfully!
                </Typography>
                <Typography variant="body2">
                  All products have been processed. Check the results above for details.
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Show status for active imports */}
          {isNormalizedImportActive && !normalizedProgress && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body1">
                  {attribute.attribute === "preview_log_id" ? "Preview" : "Import"} is starting...
                </Typography>
                <Typography variant="body2">
                  You will see progress updates here as the process continues.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const ProductImportComponent = ({
  method,
  attribute,
  resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return (
        <ProductImportComponentEdit
          attribute={attribute}
          method={method} 
          resourceConfig={resourceConfig} 
        />
      );
    case "view":
      return (
        <ProductImportComponentView
          attribute={attribute}
          method={method} 
          resourceConfig={resourceConfig} 
        />
      );
  }
};

export default ProductImportComponent;