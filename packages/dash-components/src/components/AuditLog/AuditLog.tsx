import React, { useState, useMemo, useCallback } from "react";
import { useRecordContext, useGetList, Loading } from "react-admin";
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Tooltip,
} from "@mui/material";
import {
    DataGrid as MUIGrid,
    GridColDef,
    GridRowParams,
    GridPaginationModel,
    GridToolbarContainer,
    GridToolbarExport,
} from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";

/**
 * AuditLog Component (Generic)
 *
 * A reusable component that displays audit logs (activity logs) for any model.
 * Uses Spatie Activity Log data from the backend.
 *
 * Features:
 * - Paginated DataGrid with sorting
 * - Export functionality (CSV, Print)
 * - JSON detail dialog for viewing full log properties
 * - Works with any model that has audit logging enabled
 *
 * @example
 * // In your schema file:
 * import { AuditLog } from 'dash-components';
 *
 * const myModelSchema = [
 *   // ... other fields
 *   {
 *     tab: 'Audit',
 *     attribute: 'audit_logs',
 *     label: 'Audit Logs',
 *     type: Array,
 *     inList: false,
 *     inEdit: true,
 *     inShow: true,
 *     inCreate: false,
 *     readOnly: true,
 *     custom: true,
 *     component: AuditLog,
 *   },
 * ];
 */

/**
 * Props interface for the AuditLog component
 * Compatible with dash-auto-admin custom field components
 */
export interface AuditLogProps {
    /** The resource configuration from dash-auto-admin */
    resourceConfig?: {
        model?: string;
        [key: string]: any;
    };
    /** The current mode: 'create', 'edit', 'view', 'list' */
    method?: 'create' | 'edit' | 'view' | 'list' | 'show';
    /** Optional custom resource path override */
    resource?: string;
    /** Any additional props */
    [key: string]: any;
}

/**
 * Activity log record interface from Spatie Activity Log
 */
export interface ActivityLogRecord {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    causer_name?: string;
    properties: Record<string, any>;
    event: string | null;
    batch_uuid: string | null;
    created_at: string;
    updated_at: string;
}

interface DialogState {
    open: boolean;
    log: ActivityLogRecord | null;
}

/**
 * Custom toolbar with export functionality
 */
const AuditToolbar: React.FC = () => {
    return (
        <GridToolbarContainer>
            <GridToolbarExport
                csvOptions={{
                    fileName: 'audit-logs-export',
                    delimiter: ',',
                    utf8WithBom: true,
                }}
                printOptions={{
                    hideFooter: true,
                    hideToolbar: true,
                }}
            />
        </GridToolbarContainer>
    );
};

/**
 * JSON Viewer Dialog for audit log details
 */
interface JsonDialogProps {
    open: boolean;
    log: ActivityLogRecord | null;
    onClose: () => void;
}

const AuditJsonDialog: React.FC<JsonDialogProps> = ({ open, log, onClose }) => {
    if (!log) return null;

    const formatJson = (obj: any): string => {
        try {
            return JSON.stringify(obj, null, 2);
        } catch {
            return String(obj);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="audit-log-dialog-title"
        >
            <DialogTitle id="audit-log-dialog-title">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Audit Log Details - {log.event || log.description}
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Event Information
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Typography variant="body2">
                            <strong>ID:</strong> {log.id}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Event:</strong> {log.event || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Description:</strong> {log.description}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Log Name:</strong> {log.log_name}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Created At:</strong> {new Date(log.created_at).toLocaleString()}
                        </Typography>
                        {log.causer_name && (
                            <Typography variant="body2">
                                <strong>Changed By:</strong> {log.causer_name}
                            </Typography>
                        )}
                    </Paper>
                </Box>

                <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                        Properties (JSON)
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            mt: 1,
                            bgcolor: 'grey.900',
                            color: 'grey.100',
                            maxHeight: 400,
                            overflow: 'auto',
                        }}
                    >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {formatJson(log.properties)}
                        </pre>
                    </Paper>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/**
 * Get event color chip based on event type
 */
const getEventChip = (event: string | null, logName?: string): React.ReactNode => {
    const eventLower = (event || '').toLowerCase();
    let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';

    switch (eventLower) {
        case 'created':
            color = 'success';
            break;
        case 'updated':
            color = 'warning';
            break;
        case 'deleted':
            color = 'error';
            break;
        case 'restored':
            color = 'info';
            break;
        default:
            color = 'default';
    }

    return (
        <Chip
            label={event || 'N/A'}
            color={color}
            size="small"
            variant="outlined"
        />
    );
};

/**
 * View mode - Display audit logs as a DataGrid
 */
const AuditLogView: React.FC<AuditLogProps> = ({ resourceConfig, resource: resourceOverride }) => {
    const record = useRecordContext();
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        log: null,
    });

    // Build the audit endpoint URL - uses resource override, resourceConfig model, or default
    const baseResource = resourceOverride || resourceConfig?.model || '';
    const auditResource = `${baseResource}/audit`;

    const { data, total, isLoading, error } = useGetList<ActivityLogRecord>(
        auditResource,
        {
            pagination: {
                page: paginationModel.page + 1,
                perPage: paginationModel.pageSize,
            },
            sort: { field: 'created_at', order: 'DESC' },
            filter: { subject_id: record?.id },
        },
        { enabled: !!record?.id, refetchOnWindowFocus: false }
    );

    const handleViewLog = useCallback((log: ActivityLogRecord) => {
        setDialogState({ open: true, log });
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogState({ open: false, log: null });
    }, []);

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                type: 'number',
                width: 80,
            },
            {
                field: 'event',
                headerName: 'Event',
                width: 120,
                renderCell: (params) => getEventChip(params.value),
            },
            {
                field: 'description',
                headerName: 'Description',
                flex: 1,
                minWidth: 200,
            },
            {
                field: 'causer_name',
                headerName: 'Changed By',
                width: 150,
                valueGetter: (value, row) => row.causer_name || 'System',
            },
            {
                field: 'created_at',
                headerName: 'Date',
                width: 180,
                valueFormatter: (value) =>
                    value ? new Date(value).toLocaleString() : '',
            },
            {
                field: 'actions',
                headerName: 'Actions',
                type: 'actions',
                width: 100,
                getActions: (params: GridRowParams<ActivityLogRecord>) => [
                    <Tooltip title="View Details" key="view">
                        <IconButton
                            size="small"
                            onClick={() => handleViewLog(params.row)}
                            color="primary"
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>,
                ],
            },
        ],
        [handleViewLog]
    );

    if (!record?.id) {
        return (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                    Save the record first to view audit logs
                </Typography>
            </Paper>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography color="error">
                    Error loading audit logs: {(error as any)?.message || 'Unknown error'}
                </Typography>
            </Paper>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                    No audit logs available for this record
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Paper variant="outlined">
                    <MUIGrid
                        rows={data}
                        columns={columns}
                        rowCount={total || 0}
                        loading={isLoading}
                        pageSizeOptions={[5, 10, 25, 50]}
                        paginationModel={paginationModel}
                        paginationMode="server"
                        onPaginationModelChange={setPaginationModel}
                        disableRowSelectionOnClick
                        autoHeight
                        slots={{
                            toolbar: AuditToolbar,
                        }}
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                        }}
                    />
                </Paper>
            </Box>

            <AuditJsonDialog
                open={dialogState.open}
                log={dialogState.log}
                onClose={handleCloseDialog}
            />
        </>
    );
};

/**
 * Edit mode - Same as view mode for audit logs (read-only)
 */
const AuditLogEdit: React.FC<AuditLogProps> = (props) => {
    return <AuditLogView {...props} />;
};

/**
 * List mode - Display placeholder (audit logs viewed in detail)
 */
const AuditLogList: React.FC<AuditLogProps> = () => {
    return (
        <Typography variant="body2" color="text.secondary">
            —
        </Typography>
    );
};

/**
 * Main Component - Routes to appropriate view based on method
 *
 * @param props - Component props including resourceConfig and method
 * @returns The appropriate audit log view component
 */
const AuditLog: React.FC<AuditLogProps> = (props) => {
    const { method } = props;

    switch (method) {
        case 'view':
        case 'show':
            return <AuditLogView {...props} />;
        case 'edit':
            return <AuditLogEdit {...props} />;
        case 'list':
            return <AuditLogList {...props} />;
        case 'create':
            // No audit logs for new records
            return (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                        Audit logs will be available after the record is created
                    </Typography>
                </Paper>
            );
        default:
            return <AuditLogView {...props} />;
    }
};

export default AuditLog;
