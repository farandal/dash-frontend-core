import { IconButtonProps, IconButton, CardHeader, CardActions, CardContent, Typography, Box, Card, Chip, Alert } from "@mui/material";
import LogFileById from 'dash-admin/src/components/logs/LogFileById';
import useGlobalLoaderMgr from 'dash-admin/src/hooks/useGlobalLoaderMgr';
import { formatNotification} from "dash-admin/src/contexts/com/components/notificationFormats";
import LaravelEchoContext, { ILaravelEchoContext } from "dash-admin/src/contexts/com/LaravelEchoContext";
import { getCookie, setCookie } from "dash-admin/src/utils/cookies";
import AppDialog, { useDialog } from "dash-dialog";
import React, { useContext, useState, useEffect } from "react";
import { LinearProgressProps, LinearProgress, useRecordContext, Identifier, useRefresh, Loading, Button } from "react-admin";
import { ProductImportLogComponent } from "../ProductImportLog";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';
import { NotificationWrapper } from "dash-admin/src/contexts/com/components/NotificationsWidget";
import { NotificationComponent } from "dash-admin/src/contexts/com/components/NotificationRenderer";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";
import { IDashNotificationPayloadBase } from "dash-admin/src/interfaces/communication/INotification";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { dashStorage } from 'dash-utils';
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
        {mode === 'preview' ? 'Preview' : 'Import'} Progress
      </Typography>
      
      {/* Main Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <LinearProgressWithLabel
          value={progress?.percent || 0}
          color="primary"
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {progress?.processed || 0} of {progress?.total || 0} products processed
        </Typography>
      </Box>

      {/* Current Status */}
      {progress?.current_sku && progress.current_sku !== 'completed' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            Currently processing: <Chip label={progress.current_sku} size="small" color="primary" />
          </Typography>
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
                <Typography variant="body2" color="text.secondary">To Create</Typography>
                <Typography variant="h6" color="success.main">
                  {stats.products_to_create || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">To Update</Typography>
                <Typography variant="h6" color="info.main">
                  {stats.products_to_update || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Categories to Create</Typography>
                <Typography variant="h6">
                  {stats.categories_to_create || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Brands to Create</Typography>
                <Typography variant="h6">
                  {stats.brands_to_create || 0}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="h6" color="success.main">
                  {stats.products_created || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Updated</Typography>
                <Typography variant="h6" color="info.main">
                  {stats.products_updated || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Categories Created</Typography>
                <Typography variant="h6">
                  {stats.categories_created || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Galleries Created</Typography>
                <Typography variant="h6">
                  {stats.galleries_created || 0}
                </Typography>
              </Box>
            </>
          )}
          
          {/* Common stats */}
          <Box>
            <Typography variant="body2" color="text.secondary">Errors</Typography>
            <Typography variant="h6" color={stats.errors_count > 0 ? "error.main" : "text.primary"}>
              {stats.errors_count || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Skipped</Typography>
            <Typography variant="h6" color={stats.skipped_rows > 0 ? "warning.main" : "text.primary"}>
              {stats.skipped_rows || 0}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Last Update */}
      {progress?.timestamp && (
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(progress.timestamp).toLocaleTimeString()}
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

// Interface for normalized import progress
interface INormalizedProgress {
  percent: number;
  processed: number;
  total: number;
  current_sku: string;
  timestamp: string;
}

interface INormalizedStats {
  products_to_create?: number;
  products_to_update?: number;
  products_created?: number;
  products_updated?: number;
  categories_to_create?: number;
  categories_created?: number;
  brands_to_create?: number;
  galleries_to_create?: number;
  galleries_created?: number;
  errors_count: number;
  skipped_rows: number;
}

const ProductImportComponentView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const record = useRecordContext();
  const axios = useAxios();
  const refresh = useRefresh();

  // Legacy template import progress
  const [progress, setProgress] = useState<IProgressObject>();
  
  // Normalized import progress
  const [normalizedProgress, setNormalizedProgress] = useState<INormalizedProgress | null>(null);
  const [normalizedStats, setNormalizedStats] = useState<INormalizedStats | null>(null);
  const [isNormalizedImportActive, setIsNormalizedImportActive] = useState(false);
  
  const [stats, setStats] = useState<any>(null);
  const [importStats, setImportStats] = useState<any>();
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [notificationDialogOpen, SetNotificationDialogOpen] = React.useState(false);
  const [notificationDialogProps, SetNotificationDialogProps] = React.useState(null);

  const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
  const [lastNotification, setLastNotification] = useState(null);
  const [lastNormalizedNotification, setLastNormalizedNotification] = useState(null);

  useEffect(() => {
    // Unified notification handler - works for both template and normalized imports
    // Priority: Check for type-based notifications first (unified approach)
    if (!lastEvent) return;
    
    const storedEvent = dashStorage.getItem('lastImportEvent');
    const currentEvent = JSON.stringify(lastEvent);
    
    if (storedEvent === currentEvent) return;
    
    // Check if this is a type-based notification (works for both template and normalized)
    const eventType = lastEvent.type || lastEvent.notificationPayload?.type;
    
    console.log('[ProductImport] Received event:', { 
      type: lastEvent.type, 
      payloadType: lastEvent.notificationPayload?.type,
      payloadClass: lastEvent.notificationPayload?.class,
      eventType,
      data: lastEvent.data
    });
    
    if (eventType) {
      switch (eventType) {
        case "import.started":
        case "import.progress":
        case "import.failed":
        case "import.completed":
        case "import.already_completed":
          console.log('[ProductImport] Routing to normalized handler with type:', eventType);
          setLastNormalizedNotification(lastEvent);
          dashStorage.setItem('lastImportEvent', currentEvent);
          return;
      }
    }
    
    // Fallback: class-based routing for legacy template notifications without type
    const notificationClass = lastEvent.notificationPayload?.class;
    if (notificationClass) {
      switch (notificationClass) {
        case "ValidateProductImportNotification":
        case "ProductImportNotification":
        case "ProductImportProgressNotification":
        case "ProductImportErrorNotification":
          console.log('[ProductImport] Routing to legacy handler with class:', notificationClass);
          setLastNotification(lastEvent);
          dashStorage.setItem('lastImportEvent', currentEvent);
          break;
      }
    }
  }, [lastEvent]);
  useEffect(() => {
    if (!lastNotification) return

    switch (lastNotification.notificationPayload.class) {
        
      case "ValidateProductImportNotification":
        // Remove setImportDialogOpen(false) since we're not showing it
        
        // Extract and display validation stats for template mode
        const validationData = lastNotification.notificationPayload.notificationPayload;
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
        // Remove setImportDialogOpen(false) since we're not showing it
        setLastNotification(null);
        break;
        
      case "ProductImportErrorNotification":
        // Remove setImportDialogOpen(false) since we're not showing it
        setLastNotification(null);
        SetNotificationDialogOpen(true);
       
        const error = formatNotification<IDashNotificationPayloadBase>(
            lastNotification
        );
        
        SetNotificationDialogProps({
          variant: "error",
          title: error.title,
          content: (
            <NotificationWrapper
              notification={lastNotification}
              key={0}
            >
              <NotificationComponent
                notification={lastNotification}
              />
            </NotificationWrapper>
          ),
        });
        break;
        
      default:
        const formattedNotification =
          formatNotification<IDashNotificationPayloadBase>(
            lastNotification
          );
        SetNotificationDialogOpen(true);
        SetNotificationDialogProps({
          variant: "info",
          title: formattedNotification.title,
          content: (
            <NotificationWrapper
              notification={lastNotification}
              key={0}
            >
              <NotificationComponent
                notification={lastNotification}
              />
            </NotificationWrapper>
          ),
        });
        setLastNotification(null);
        refresh();
        break;
    }
  }, [lastNotification]);

  useEffect(() => {
    if (!lastNormalizedNotification) return
    
    // Extract notification data - works for both template and normalized imports
    // Template: data is in lastNormalizedNotification.data (includes progress object)
    // Normalized: data is in lastNormalizedNotification.data or notificationPayload.notificationPayload
    const notificationData = lastNormalizedNotification.data || lastNormalizedNotification.notificationPayload?.notificationPayload || {};
    
    // Extract type - works for both template and normalized imports
    const eventType = lastNormalizedNotification.type || lastNormalizedNotification.notificationPayload?.type;
    
    console.log('[ProductImport] Processing notification:', { eventType, notificationData, rawEvent: lastNormalizedNotification });
    
    switch (eventType) {
      case "import.started":
        setIsNormalizedImportActive(true);
        setNormalizedProgress(null);
        setNormalizedStats(null);
        setLastNormalizedNotification(null);
        break;
        
      case "import.progress":
        setIsNormalizedImportActive(true);
        
        // Update progress from notification
        if (notificationData.progress) {
          console.log('[ProductImport] Setting progress:', notificationData.progress);
          setNormalizedProgress(notificationData.progress);
        }
        
        // Update stats from notification
        if (notificationData.stats) {
          console.log('[ProductImport] Setting stats:', notificationData.stats);
          setNormalizedStats(notificationData.stats);
        }
        
        setLastNormalizedNotification(null);
        break;

      case "import.already_completed": // Add this new case
        setIsNormalizedImportActive(false);
        
        // Clear any stuck progress
        setNormalizedProgress(null);
        
        // Show info notification
        SetNotificationDialogOpen(true);
        SetNotificationDialogProps({
          variant: "info",
          title: `${notificationData.mode === 'preview' ? 'Preview' : 'Import'} Already Completed`,
          content: (
            <Alert severity="info">
              <Typography variant="body1">
                This {notificationData.mode === 'preview' ? 'preview' : 'import'} was already completed previously.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Current status: <strong>{notificationData.completed_status}</strong>
              </Typography>
              <Typography variant="body2">
                If you need to run it again, please refresh the page or create a new import instance.
              </Typography>
            </Alert>
          ),
        });
        
        setLastNormalizedNotification(null);
        
        // Refresh the record to show current state
        /*setTimeout(() => {
          refresh();
        }, 1000);*/
        break;
        
      case "import.failed":
        setIsNormalizedImportActive(false);
        
        // Keep the last progress and stats visible even after failure
        
        SetNotificationDialogOpen(true);
        
        const error = formatNotification<IDashNotificationPayloadBase>(
            lastNormalizedNotification
        );
        
        SetNotificationDialogProps({
          variant: "error",
          title: error.title,
          content: (
            <NotificationWrapper
              notification={lastNormalizedNotification}
              key={0}
            >
              <NotificationComponent
                notification={lastNormalizedNotification}
              />
            </NotificationWrapper>
          ),
        });
        
        setLastNormalizedNotification(null);
        break;
        
      case "import.completed":
        setIsNormalizedImportActive(false);
        
        // Set final progress to 100%
        setNormalizedProgress(prev => ({
          ...prev,
          percent: 100,
          current_sku: 'completed',
          timestamp: new Date().toISOString()
        }));
        
        // Set final stats from notification data
        if (notificationData.stats) {
          setNormalizedStats(notificationData.stats);
        }
        
        // Set import stats for final results display
        setImportStats(notificationData);
        
        // Show completion notification
        SetNotificationDialogOpen(true);
        SetNotificationDialogProps({
          variant: "success",
          title: "",
          showCloseButton: true,
          content: <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
                    
        });
        
        setLastNormalizedNotification(null);
        
        // Refresh the record after completion
        /*setTimeout(() => {
          refresh();
        }, 2000);*/
        break;
    }
  }, [lastNormalizedNotification]);


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
    setIsNormalizedImportActive(true);
    setNormalizedProgress(null);
    setNormalizedStats(null);
  }

  try {
    const {data} = await axios.post(`/ecommerce/product/import`, importData);
    
    // Handle immediate responses from controller
    if (data.already_completed) {
      // Stop the loading state
      setIsNormalizedImportActive(false);
      
      // Clear any stuck progress
      setNormalizedProgress(null);
      
      // Show info notification
      SetNotificationDialogOpen(true);
      SetNotificationDialogProps({
        variant: "info",
        title: `${importData.preview_mode ? 'Preview' : 'Import'} Already Completed`,
        content: (
          <Alert severity="info">
            <Typography variant="body1">
              {data.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Current status: <strong>{data.status}</strong>
            </Typography>
            <Typography variant="body2">
              If you need to run it again, please refresh the page or create a new import instance.
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
      setIsNormalizedImportActive(false);
      
      // Show info notification
      SetNotificationDialogOpen(true);
      SetNotificationDialogProps({
        variant: "info",
        title: `${importData.preview_mode ? 'Preview' : 'Import'} Already Running`,
        content: (
          <Alert severity="info">
            <Typography variant="body1">
              {data.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Current status: <strong>{data.status}</strong>
            </Typography>
            <Typography variant="body2">
              Please wait for the current process to complete or refresh the page to see the latest status.
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
      setIsNormalizedImportActive(false);
      setStats(JSON.parse(JSON.stringify(data.stats)));
    }

  } catch (error:any) {
    console.error('Import failed:', error);
    setIsNormalizedImportActive(false);
    
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
            title="Mass Import Preview"
            subheader={
              record.import_type === 'normalized' 
                ? "Preview with normalized format"
                : "Preview with custom template"
            }
          />
        ) : (
          <CardHeader
            title="Mass Import"
            subheader={
              record.import_type === 'normalized'
                ? "Import with normalized format"
                : "Import with custom template"
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
                {isNormalizedImportActive ? "Preview in Progress..." : "Preview Import"}
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
                {isNormalizedImportActive ? "Import in Progress..." : "Start Import"}
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
                {attribute.attribute === "preview_log_id" ? "Preview" : "Import"} Results
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