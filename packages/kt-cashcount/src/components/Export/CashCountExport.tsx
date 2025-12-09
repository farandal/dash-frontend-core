import React, { useState } from "react";
import {
  Button,
  useNotify,
  useDataProvider,
  useResourceContext,
  useListContext
} from "react-admin";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip
} from "@mui/material";
import { useDialog } from "dash-dialog";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { saveAs } from 'file-saver';
import { useAxios } from 'dash-axios-hook';

interface ExportFormData {
  format: 'xlsx' | 'csv';
  period_start?: string;
  period_end?: string;
  cash_count_ids?: number[];
}

interface ExportResponse {
  message: string;
  export_id: string;
  filename: string;
  file_size: number;
  cash_counts_count: number;
  download_url: string;
  email_sent_to: string;
}

const CashCountExport: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const resource = useResourceContext();
  const listContext = useListContext();
  const axios = useAxios();
  
  const { control, handleSubmit, reset, watch, setValue } = useForm<ExportFormData>({
    defaultValues: {
      format: 'xlsx',
      period_start: '',
      period_end: '',
      cash_count_ids: []
    }
  });

  const selectedIds = listContext?.selectedIds || [];
  const hasSelectedItems = selectedIds.length > 0;

  const formatOptions = [
    { id: 'xlsx', name: 'Excel (.xlsx)' },
    { id: 'csv', name: 'CSV (.csv)' }
  ];

  const handleOpen = () => {
    // Pre-populate selected IDs if any
    if (hasSelectedItems) {
      setValue('cash_count_ids', selectedIds as number[]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  // Helper function to ensure HTTPS protocol
  const ensureHttps = (url: string): string => {
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  };

  const downloadFile = async (downloadUrl: string, filename: string) => {
    try {
      // Ensure the download URL uses the same protocol as the current page
      const secureDownloadUrl = ensureHttps(downloadUrl);
      
      console.log('Original download URL:', downloadUrl);
      console.log('Secure download URL:', secureDownloadUrl);

      const response = await axios.get(secureDownloadUrl, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      saveAs(blob, filename);
      
      notify('File downloaded successfully!', { type: 'success' });
    } catch (error: any) {
      console.error('Download failed:', error);
      notify('Failed to download file: ' + (error.response?.data?.message || error.message), { type: 'error' });
    }
  };

  const onSubmit = async (data: ExportFormData) => {
    setIsExporting(true);
    
    try {
      // Prepare export parameters
      const exportParams: any = {
        format: data.format,
        requested_by: 'frontend',
        sync: true // Default sync to true as requested
      };

      // Add filters if specified
      if (data.period_start) {
        exportParams.period_start = data.period_start;
      }
      
      if (data.period_end) {
        exportParams.period_end = data.period_end;
      }
      
      if (data.cash_count_ids && data.cash_count_ids.length > 0) {
        exportParams.cash_count_ids = data.cash_count_ids;
      }

      // Use axios directly instead of dataProvider for better control
      const response = await axios.post(`${resource}/export`, exportParams);

      if (response.data) {
        const exportData: ExportResponse = response.data;
        
        notify('Export completed successfully!', { 
          type: 'success' 
        });
        
        // Show additional info
        if (exportData.cash_counts_count) {
          notify(`Exported ${exportData.cash_counts_count} cash counts`, { 
            type: 'info' 
          });
        }

        // Show email notification
        if (exportData.email_sent_to) {
          notify(`Email sent to: ${exportData.email_sent_to}`, { 
            type: 'info' 
          });
        }
        
        // Trigger download if download URL is provided
        if (exportData.download_url && exportData.filename) {
          await downloadFile(exportData.download_url, exportData.filename);
        }
        
        handleClose();
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      
      let errorMessage = 'Export failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notify(errorMessage, { type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const useSelectedOnly = () => {
    if (hasSelectedItems) {
      setValue('cash_count_ids', selectedIds as number[]);
      // Clear other filters when using selected items
      setValue('period_start', '');
      setValue('period_end', '');
    }
  };

  const clearSelection = () => {
    setValue('cash_count_ids', []);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        label="Export"
        variant="text"
        color="primary"
      >
        <GetAppIcon />
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Export Cash Counts</Typography>
            <Button onClick={handleClose}>
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Export Format */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="format"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Export Format</InputLabel>
                      <Select {...field} label="Export Format">
                        {formatOptions.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Selected Items Section */}
              {hasSelectedItems && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Items ({selectedIds.length})
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Button
                        onClick={useSelectedOnly}
                        variant="outlined"
                        size="small"
                      >
                        Export Selected Only
                      </Button>
                      <Button
                        onClick={clearSelection}
                        variant="text"
                        size="small"
                      >
                        Clear Selection
                      </Button>
                    </Box>
                    {watch('cash_count_ids')?.length > 0 && (
                      <Box mt={1}>
                        <Chip 
                          label={`${watch('cash_count_ids')?.length} items selected`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Filters Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Filters (leave empty to export all closed cash counts from last 30 days)
                </Typography>
              </Grid>

              {/* Period Start */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="period_start"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Period Start"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      disabled={watch('cash_count_ids')?.length > 0}
                    />
                  )}
                />
              </Grid>

              {/* Period End */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="period_end"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Period End"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      disabled={watch('cash_count_ids')?.length > 0}
                    />
                  )}
                />
              </Grid>

              {/* Export Info */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">
                    <strong>Export Information:</strong>
                    <br />
                    • <strong>Excel (.xlsx):</strong> Full featured export with multiple sheets
                    <br />
                    • <strong>CSV (.csv):</strong> Simple format for data analysis
                    <br />
                    • <strong>Status Filter:</strong> Only closed cash counts will be exported
                    <br />
                    • <strong>Download:</strong> File will be downloaded automatically when ready
                    <br />
                    • <strong>Email:</strong> You will also receive an email with the export file
                    <br />
                    • <strong>Default Period:</strong> If no filters are specified, exports last 30 days
                  </Typography>
                </Box>
              </Grid>

              {/* Export Summary */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Export Summary:</strong>
                    <br />
                    • Format: {watch('format')?.toUpperCase()}
                    <br />
                    • Items: {watch('cash_count_ids')?.length > 0 
                      ? `${watch('cash_count_ids')?.length} selected cash counts` 
                      : 'All closed cash counts (filtered by date range)'}
                    <br />
                    • Period: {watch('period_start') || watch('period_end') 
                      ? `${watch('period_start') || 'Start'} to ${watch('period_end') || 'End'}`
                      : 'Last 30 days (default)'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleClose}
              variant="text"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isExporting}
              color="primary"
            >
              {isExporting ? 'Exporting...' : 'Export & Download'}
              <GetAppIcon sx={{ ml: 1 }} />
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default CashCountExport;
