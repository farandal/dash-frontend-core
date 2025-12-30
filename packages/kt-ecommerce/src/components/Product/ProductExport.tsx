import { Dialog, DialogActions, DialogContent, Button, Radio, FormControl, RadioGroup, FormControlLabel, TextField, FormLabel, Typography, Box, Alert, LinearProgress, Chip } from '@mui/material'
import { useState, useEffect, useContext } from 'react'
import { Button as RAButton, useListContext, useNotify } from 'react-admin';
import { saveAs } from 'file-saver';
import GetAppIcon from "@mui/icons-material/GetApp";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useAxios } from 'dash-axios-hook';
import { getCookie } from 'dash-admin/src/utils/cookies';
import LaravelEchoContext from 'dash-admin/src/contexts/com/LaravelEchoContext';
import type { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import React from 'react';
import { dashStorage } from 'dash-utils';

const EXPORT_FORMATS = [
  { value: 'xlsx', label: 'Excel (xlsx)' },
//  { value: 'csv', label: 'CSV (csv)' },
//  { value: 'json', label: 'JSON (json)' }
];

const EXPORT_TYPES = [
  { value: 'normalized', label: 'Estándar' },
    //  { value: 'detailed', label: 'Detallado (datos completos)' },
  { value: 'standard', label: 'Básico' }
];

interface ProductExportProps {
}

interface AsyncExportResponse {
  switched_to_async: boolean;
  message: string;
  job_id: string;
  estimated_filename: string;
  product_count: number;
  sync_limit: number;
  queued: boolean;
  status_check_url?: string;
  notification_enabled?: boolean;
}

interface ExportNotification {
  notificationPayload: {
    class: string;
    title: string;
    message: string;
    notificationPayload: {
      jobId: string;
      tenantId: number;
      filename: string;
      format: string;
      exportType: string;
      phaseName?: string;
      phaseNumber?: number;
      totalPhases?: number;
      processedItems?: number;
      totalItems?: number;
      progress?: number;
      type: string;
      message: string;
      status?: string;
      exportedFiles?: Array<{
        filename: string;
        path: string;
        size: number;
        created_at: number;
      }>;
      downloadUrls?: Array<{
        filename: string;
        url: string;
        size: number;
        created_at: number;
      }>;
      error?: string;
      completedAt?: string;
      failedAt?: string;
    };
  };
  type: string;
  timestamp: string;
}

interface ExportProgress {
  jobId: string;
  phaseName: string;
  phaseNumber: number;
  totalPhases: number;
  progress: number;
  message: string;
  status: 'processing' | 'completed' | 'failed';
}

const ProductExport: React.FC<ProductExportProps> = () => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({ 
    filename: '', 
    format: 'xlsx', 
    export_type: 'normalized',
    use_selection: false 
  });
  const [fileLoading, setFileLoading] = useState(false);
  const [asyncExportInfo, setAsyncExportInfo] = useState<AsyncExportResponse | null>(null);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [lastExportNotification, setLastExportNotification] = useState<ExportNotification | null>(null);
  const [completedExports, setCompletedExports] = useState<Array<{
    jobId: string;
    filename: string;
    downloadUrls: Array<{filename: string; url: string; size: number}>;
    completedAt: string;
  }>>([]);
  const axios = useAxios();

  // WebSocket context for real-time notifications
  const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);

  const hasSelection = selectedIds.length > 0;
  const exportCount = options.use_selection ? selectedIds.length : '*';

  // Handle export notifications (class-based and type-based)
  useEffect(() => {
    if (!lastEvent) return;
    
    // Check by notification class (nested in notificationPayload)
    const notificationClass = lastEvent.notificationPayload?.class;
    // Check by event type (top-level type field)
    const eventType = lastEvent.type;
    
    console.log('🔍 ProductExport checking event:', { notificationClass, eventType, lastEvent });
    
    const isExportNotification = 
      notificationClass === "ProductExportProgressNotification" ||
      notificationClass === "ProductExportNotification" ||
      notificationClass === "ProductExportErrorNotification" ||
      eventType === "export.progress" ||
      eventType === "export.completed" ||
      eventType === "export.error";
    
    if (isExportNotification) {
      console.log('✅ ProductExport: Processing export notification');
      /* @ts-ignore */
      setLastExportNotification(lastEvent);
    }
  }, [lastEvent]);

  // Process export notifications
  useEffect(() => {
    if (lastExportNotification) {
      processExportNotification(lastExportNotification);
    }
  }, [lastExportNotification]);

  const processExportNotification = (notification: ExportNotification) => {
  // Handle both nested notificationPayload and direct data field
  const payload = notification.notificationPayload?.notificationPayload || 
                  (notification as any).data || 
                  {};
  
  const notificationClass = notification.notificationPayload?.class;
  const eventType = (notification as any).type;
  
  console.log('🔄 processExportNotification:', { notificationClass, eventType, payload });
  
  // Determine notification type from class or event type
  const isProgress = notificationClass === "ProductExportProgressNotification" || eventType === "export.progress";
  const isCompleted = notificationClass === "ProductExportNotification" || eventType === "export.completed";
  const isError = notificationClass === "ProductExportErrorNotification" || eventType === "export.error";
  
  if (isProgress) {
    console.log('📊 Setting export progress:', payload);
    setExportProgress({
      jobId: payload.jobId,
      phaseName: payload.phaseName || 'Processing',
      phaseNumber: payload.phaseNumber || 1,
      totalPhases: payload.totalPhases || 4,
      progress: payload.progress || 0,
      message: payload.message || notification.notificationPayload?.message || 'Procesando...',
      status: 'processing'
    });
  } else if (isCompleted) {
    console.log('✅ Export completed:', payload);
    setExportProgress({
      jobId: payload.jobId,
      phaseName: 'Completed',
      phaseNumber: payload.totalPhases || 4,
      totalPhases: payload.totalPhases || 4,
      progress: 100,
      message: payload.message || notification.notificationPayload?.message || 'Exportación completada',
      status: 'completed'
    });
    
    if (payload.downloadUrls && payload.downloadUrls.length > 0) {
      // Filter download URLs to only include the requested format
      const requestedFormat = payload.format || 'xlsx';
      const filteredDownloadUrls = payload.downloadUrls.filter((file: any) => {
        const fileExtension = file.filename.split('.').pop()?.toLowerCase();
        return fileExtension === requestedFormat.toLowerCase();
      });

      console.log('📥 Setting completed exports with download URLs:', filteredDownloadUrls);
      setCompletedExports(prev => [
        ...prev.filter(exp => exp.jobId !== payload.jobId),
        {
          jobId: payload.jobId,
          filename: payload.filename,
          downloadUrls: filteredDownloadUrls.map((file: any) => ({
            ...file,
            jobId: payload.jobId
          })),
          completedAt: payload.completedAt || new Date().toISOString()
        }
      ]);
    }
    notify('Exportación completada exitosamente', { type: 'success' });
  } else if (isError) {
    console.log('❌ Export error:', payload);
    setExportProgress({
      jobId: payload.jobId,
      phaseName: 'Failed',
      phaseNumber: payload.totalPhases || 4,
      totalPhases: payload.totalPhases || 4,
      progress: 0,
      message: payload.error || 'Error en la exportación',
      status: 'failed'
    });
    
    notify(`Error en exportación: ${payload.error || 'Error desconocido'}`, { type: 'error' });
  }
};



  const onExport = async () => {
    setFileLoading(true);
    setAsyncExportInfo(null);
    setExportProgress(null);
    
    try {
      let filter = {};
      let cookie_tenant_id = dashStorage.getItem('tenant_id');
      
      // Get filters from localStorage if not using selection
      if (!options.use_selection || !hasSelection) {
        const filters = dashStorage.getItem('RaStore.product.listParams');
        if (filters) {
          const filterObject = JSON.parse(filters);
          if (filterObject.filter) {
            filter = filterObject.filter;
          }
        }
      }

      // Prepare export payload
      const exportPayload: any = {
        ...filter,
        tenant_id: cookie_tenant_id,
        format: options.format,
        export_type: options.export_type,
      };

      // Add filename if provided
      if (options.filename.trim()) {
        exportPayload.filename = options.filename.trim();
      }

      // Add product_ids if using selection
      if (options.use_selection && hasSelection) {
        exportPayload.product_ids = selectedIds;
      }

    /*const response = await axios.post('ecommerce/product/export', exportPayload, {
        responseType: 'arraybuffer'
    });*/
    const response = await axios.post('ecommerce/product/export', exportPayload);

      // Check if response is JSON (async export) or binary data (file download)
      const contentType = response.headers['content-type'];
      debugger;
      if (contentType && contentType.includes('application/json')) {
        // Convert arraybuffer back to JSON for async response
        //const jsonString = new TextDecoder().decode(response.data);
        //const jsonResponse: AsyncExportResponse = JSON.parse(jsonString);
        
        if (response.data.switched_to_async) {
          // Handle async export
          setAsyncExportInfo(response.data);
          notify(`Export queued: ${response.data.message}`, { type: 'info' });
          return; // Don't close dialog, show async info instead
        }
      }
     
    // Handle synchronous export (file download via download_url)
        if (response.data.download_url) {
          // Remove "/api" prefix if present in the download_url
          let downloadUrl = response.data.download_url;
          if (downloadUrl.startsWith('/api/')) {
            downloadUrl = downloadUrl.replace(/^\/api/, '');
          }
          const finalFilename = options.filename.trim() || 'products_export';
          const fileExtension = options.format === 'xlsx' ? 'xlsx' : options.format;

          // Fetch the file from the download_url and save it
          const fileResponse = await axios.get(downloadUrl, { responseType: 'blob' });
          const blob = new Blob([fileResponse.data]);
          saveAs(blob, `${finalFilename}.${fileExtension}`);
        }
      setOpen(false);
      resetForm();
      notify('Export completed successfully', { type: 'success' });
      
    } catch (error: any) {
      console.error('Export error:', error);
      
      // Check if error response contains async export info
      if (error.response && error.response.data) {
        try {
          let errorData;
          
          // Handle different response types
          if (error.response.data instanceof ArrayBuffer) {
            const jsonString = new TextDecoder().decode(error.response.data);
            errorData = JSON.parse(jsonString);
          } else if (typeof error.response.data === 'string') {
            errorData = JSON.parse(error.response.data);
          } else {
            errorData = error.response.data;
          }
          
          if (errorData.switched_to_async) {
            setAsyncExportInfo(errorData);
            notify(`Export queued: ${errorData.message}`, { type: 'info' });
            return;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }
      }
      
      notify('Export failed. Please try again.', { type: 'error' });
    } finally {
      setFileLoading(false);
    }
  };
const handleDownload = async (url: string, filename: string, jobId?: string) => {
  try {
    const downloadUrl = '/ecommerce/product/download-export';
    
    // Make request WITHOUT following redirects to get the S3 signed URL
    const response = await axios.post(downloadUrl, {
      jobId: jobId,
      file: filename
    }, {
      maxRedirects: 0, // Don't follow redirects
      validateStatus: (status) => status >= 200 && status < 400, // Accept 3xx as valid
    });

    // Check if we got a redirect response with a location header
    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      // Open the S3 URL directly - this bypasses CORS since it's a navigation, not an XHR
      window.open(response.headers.location, '_blank');
      notify('Descarga iniciada', { type: 'success' });
      return;
    }

    // Check if response contains a download_url (JSON response)
    if (response.data?.download_url) {
      window.open(response.data.download_url, '_blank');
      notify('Descarga iniciada', { type: 'success' });
      return;
    }

    // If response is a blob (direct file download)
    if (response.data instanceof Blob || response.headers['content-type']?.includes('application/')) {
      const blob = new Blob([response.data]);
      saveAs(blob, filename);
      notify('Archivo descargado exitosamente', { type: 'success' });
      return;
    }

    // Fallback: try to open URL directly if provided in the notification
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
      notify('Descarga iniciada', { type: 'success' });
      return;
    }

    notify('No se pudo obtener el enlace de descarga', { type: 'warning' });
  } catch (error: any) {
    console.error('Download error:', error);
    
    // Check if error contains a redirect URL (some axios versions throw on 3xx)
    if (error.response?.status >= 300 && error.response?.status < 400) {
      const redirectUrl = error.response.headers?.location;
      if (redirectUrl) {
        window.open(redirectUrl, '_blank');
        notify('Descarga iniciada', { type: 'success' });
        return;
      }
    }

    // Fallback: if we have a URL from the notification, try opening it directly
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
      notify('Descarga iniciada (enlace directo)', { type: 'info' });
      return;
    }

    notify('Error al descargar el archivo', { type: 'error' });
  }
};

  const resetForm = () => {
    setOptions({ 
      filename: '', 
      format: 'xlsx', 
      export_type: 'normalized',
      use_selection: false 
    });
    setAsyncExportInfo(null);
    setExportProgress(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const isExportDisabled = fileLoading || !options.format || !options.export_type;

  return (
    <>
      <RAButton
        color="primary"
        component="span"
        label={'Exportar'}
        onClick={() => setOpen(true)}
      >
        <GetAppIcon style={{ fontSize: "20" }} />
      </RAButton>
      
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Exportar Productos
          </Typography>
          
          {/* Show async export info if switched to async */}
          {asyncExportInfo && (
            <Box mb={3}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Exportación en cola:</strong><br />
                  {asyncExportInfo.message}
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Show export progress if available */}
          {exportProgress && (
            <Box mb={3}>
              <Alert 
                severity={exportProgress.status === 'failed' ? 'error' : exportProgress.status === 'completed' ? 'success' : 'info'}
                icon={exportProgress.status === 'failed' ? <ErrorIcon /> : exportProgress.status === 'completed' ? <CheckCircleIcon /> : undefined}
              >
                <Typography variant="body2">
                  <strong>Estado de exportación:</strong><br />
                  {exportProgress.message}
                </Typography>
                {exportProgress.status === 'processing' && (
                  <Box mt={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={exportProgress.progress} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Fase {exportProgress.phaseNumber} de {exportProgress.totalPhases}: {exportProgress.phaseName} ({exportProgress.progress}%)
                    </Typography>
                  </Box>
                )}
              </Alert>
            </Box>
          )}

          {/* Show completed exports with download links */}
          {completedExports.length > 0 && (
            <Box mb={3}>
             
              {completedExports.map((exportItem) => (
                <Box key={exportItem.jobId} mb={1}>
                  {exportItem.downloadUrls.map((file, fileIndex) => (
                    <Button
                                         key={fileIndex}
                      variant="contained"
                      onClick={() => handleDownload(file.url, file.filename, exportItem.jobId)}
                      startIcon={<DownloadIcon />}
                      fullWidth
                    >
                    {file.filename}
                    </Button>
                  ))}
                </Box>
              ))}
            </Box>
          )}
          
          {/* Selection Options */}
          {hasSelection && (
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Productos a exportar</FormLabel>
                <RadioGroup
                  value={options.use_selection ? 'selected' : 'all'}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    use_selection: e.target.value === 'selected' 
                  }))}
                >
                  <FormControlLabel 
                    value="all" 
                    control={<Radio />} 
                    label={`Todos los productos`}
                  />
                  <FormControlLabel 
                    value="selected" 
                    control={<Radio />} 
                    label={`Productos seleccionados (${selectedIds.length} productos)`}
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* Filename Input */}
          <Box mb={3}>
            <TextField 
              fullWidth
              value={options.filename} 
              label="Nombre del archivo (opcional)" 
              placeholder="products_export"
              onChange={(e) => setOptions(prev => ({ 
                ...prev, 
                filename: e.target.value 
              }))} 
            />
          </Box>

          {/* Export Type */}
          <Box mb={3}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Tipo de exportación</FormLabel>
              <RadioGroup
                value={options.export_type}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  export_type: e.target.value 
                }))}
              >
                {EXPORT_TYPES.map((type) => (
                  <FormControlLabel 
                    key={type.value}
                    value={type.value} 
                    control={<Radio />} 
                    label={type.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Format Selection */}
          <Box mb={2}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Formato de archivo</FormLabel>
              <RadioGroup
                value={options.format}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  format: e.target.value 
                }))}
              >
                {EXPORT_FORMATS.map((format) => (
                  <FormControlLabel 
                    key={format.value}
                    value={format.value} 
                    control={<Radio />} 
                    label={format.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Export Summary */}
          {/*<Box 
            p={2} 
            borderRadius={1}
            mt={2}
          >
            <Typography variant="body2" color="textSecondary">
              <strong>Resumen:</strong><br />
              • Productos: {exportCount} productos<br />
              • Tipo: {options.export_type}<br />
              • Formato: {options.format.toUpperCase()}<br />
              {options.filename && `• Archivo: ${options.filename}.${options.format}`}
            </Typography>
          </Box>*/}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={fileLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={onExport}
            disabled={isExportDisabled}
            variant="contained"
            color="primary"
          >
            {fileLoading ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductExport
