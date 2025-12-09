import React from 'react';
import {
    BulkDeleteButton,
    BulkExportButton,
    useListContext,
    Button,
    useNotify,
    useUnselectAll,
    useRefresh,
    useDataProvider,
    useResourceContext
} from 'react-admin';
import { GetApp, Delete } from '@mui/icons-material';
import { Fragment } from 'react';
import { saveAs } from 'file-saver';
import { useAxios } from 'dash-axios-hook';

interface ExportResponse {
    message: string;
    export_id: string;
    filename: string;
    file_size: number;
    cash_counts_count: number;
    download_url: string;
    email_sent_to: string;
}

const CashCountListBulkActions = () => {
    const { selectedIds } = useListContext();
    const notify = useNotify();
    const unselectAll = useUnselectAll('tab/cashcount');
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const resource = useResourceContext();
    const axios = useAxios();

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
            
            console.log('Bulk export - Original download URL:', downloadUrl);
            console.log('Bulk export - Secure download URL:', secureDownloadUrl);

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

    const handleBulkExport = async () => {
        if (selectedIds.length === 0) {
            notify('No items selected for export', { type: 'warning' });
            return;
        }

        try {
            const exportParams = {
                cash_count_ids: selectedIds,
                format: 'xlsx',
                requested_by: 'bulk_action',
                sync: true // Execute synchronously for immediate download
            };

            // Use axios directly for better control over the response
            const response = await axios.post(`${resource}/export`, exportParams);

            if (response.data) {
                const exportData: ExportResponse = response.data;
                
                notify(`Export completed successfully for ${selectedIds.length} cash counts`, { 
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
                
                unselectAll();
            }
        } catch (error: any) {
            console.error('Bulk export failed:', error);
            
            let errorMessage = 'Bulk export failed';
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            notify(errorMessage, { type: 'error' });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            notify('No items selected for deletion', { type: 'warning' });
            return;
        }

        // Check if any selected cash counts are not closed
        try {
            // You might want to add a validation endpoint or check this client-side
            // For now, we'll let the backend handle the validation
            
            notify('Bulk delete functionality not yet implemented', { type: 'info' });
            
            // TODO: Implement bulk delete functionality
            // This would require a backend endpoint for bulk operations
            
        } catch (error: any) {
            notify('Bulk delete failed: ' + (error.response?.data?.message || error.message), { type: 'error' });
        }
    };

    return (
        <Fragment>
            <Button
                onClick={handleBulkExport}
                label={`Export ${selectedIds.length} items`}
                disabled={selectedIds.length === 0}
                variant="text"
                color="primary"
            >
                <GetApp />
            </Button>
            
            {/* Bulk Delete Button - Commented out until implemented */}
            {/* 
            <Button
                onClick={handleBulkDelete}
                label={`Delete ${selectedIds.length} items`}
                disabled={selectedIds.length === 0}
                variant="text"
                color="error"
            >
                <Delete />
            </Button>
            */}
            
            {/* Alternative: Use the built-in BulkDeleteButton with custom props */}
            {/* 
            <BulkDeleteButton 
                mutationMode="pessimistic"
                confirmTitle="Delete Cash Counts"
                confirmContent="Are you sure you want to delete these cash counts? This action cannot be undone. Only draft cash counts can be deleted."
                disabled={selectedIds.length === 0}
            />
            */}
        </Fragment>
    );
};

export default CashCountListBulkActions;
