import React, { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react';
import { 
    useRecordContext, 
    useEditContext,
    SearchInput,
    SelectInput,
} from 'react-admin';
import { useController, useFormContext } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { 
    Box,
    Chip,
    CircularProgress,
    Button,
    Typography,
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Divider,
} from '@mui/material';
import { 
    SelectAll as SelectAllIcon, 
    DeselectOutlined as DeselectAllIcon,
} from '@mui/icons-material';
import { useSystemRequestsCache } from '../../contexts/SystemRequestsCache';

interface IPermissionItem {
    group: string;
    name: string;
    route_name: string;
    checked?: boolean;
    id?: string; // For React rendering key
}

// Memoized row component to prevent unnecessary re-renders
const PermissionRow = memo<{
    permission: IPermissionItem;
    onToggle: (routeName: string) => void;
}>(({ permission, onToggle }) => {
    return (
        <TableRow hover>
            <TableCell padding="checkbox">
                <Checkbox
                    checked={permission.checked || false}
                    onChange={() => onToggle(permission.route_name)}
                    sx={{ cursor: 'pointer' }}
                />
            </TableCell>
            <TableCell>
                <Chip 
                    label={permission.group} 
                    size="small" 
                    variant="outlined"
                />
            </TableCell>
            <TableCell>{permission.name}</TableCell>
            <TableCell>
                <Typography 
                    variant="body2" 
                    sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                >
                    {permission.route_name}
                </Typography>
            </TableCell>
        </TableRow>
    );
}, (prevProps, nextProps) => {
    // Only re-render if checked state changes for this specific row
    return prevProps.permission.checked === nextProps.permission.checked &&
           prevProps.permission.route_name === nextProps.permission.route_name;
});

const PermissionsSelectorListBase: React.FC<IDashAutoAdminCustomFieldComponent & { record: any }> = ({
    method,
    attribute,
    resourceConfig,
    record = null
}) => {
    const form = useFormContext();

    // Controllers for both permission_objects and permissions fields
    const permissionObjectsController = useController({ name: 'permission_objects' });
    const permissionsController = useController({ name: 'permissions' });

    // Use Map for O(1) lookup performance
    const [permissionsMap, setPermissionsMap] = useState<Map<string, IPermissionItem>>(new Map());
    const [filteredData, setFilteredData] = useState<IPermissionItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    
    // Debounce timer for form sync
    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { formats: availablePermissions, loading } = useSystemRequestsCache();

    // Initialize permissions map from available permissions and role data
    useEffect(() => {
        if (!loading && availablePermissions && record) {
            const perms = Array.isArray(availablePermissions.data)
                ? availablePermissions.data
                : Array.isArray(availablePermissions)
                    ? availablePermissions
                    : [];

            if (perms.length > 0) {
                const initialPermissionObjects = record.permission_objects || [];
                const checkedRouteNames = new Set(
                    initialPermissionObjects.map((obj: IPermissionItem) => obj.route_name)
                );
                
                const newMap = new Map<string, IPermissionItem>();
                perms.forEach((p: IPermissionItem) => {
                    newMap.set(p.route_name, {
                        ...p,
                        id: p.route_name,
                        checked: checkedRouteNames.has(p.route_name)
                    });
                });

                setPermissionsMap(newMap);
            }
        }
    }, [availablePermissions, record, loading]);

    // Convert map to array for display (memoized)
    const statePermissions = useMemo(() => {
        return Array.from(permissionsMap.values());
    }, [permissionsMap]);

    // Apply filters (memoized)
    useEffect(() => {
        let filtered = statePermissions;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.route_name.toLowerCase().includes(searchLower) ||
                p.group.toLowerCase().includes(searchLower)
            );
        }

        if (groupFilter) {
            filtered = filtered.filter(p => p.group === groupFilter);
        }

        setFilteredData(filtered);
        setPage(0); // Reset to first page when filters change
    }, [statePermissions, searchTerm, groupFilter]);

    // Debounced form sync - only sync after 300ms of no changes
    useEffect(() => {
        if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
        }

        syncTimerRef.current = setTimeout(() => {
            if (statePermissions.length === 0) return;
            
            const checkedPermissions = statePermissions.filter(p => p.checked);
            
            permissionObjectsController.field.onChange(checkedPermissions);
            permissionsController.field.onChange(checkedPermissions.map(p => p.route_name));
        }, 300);

        return () => {
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statePermissions]);

    // Optimized toggle using Map for O(1) update
    const handleTogglePermission = useCallback((routeName: string) => {
        setPermissionsMap(prev => {
            const newMap = new Map(prev);
            const permission = newMap.get(routeName);
            if (permission) {
                newMap.set(routeName, { ...permission, checked: !permission.checked });
            }
            return newMap;
        });
    }, []);

    // Optimized Select all using Map
    const handleSelectAll = useCallback(() => {
        setPermissionsMap(prev => {
            const newMap = new Map(prev);
            newMap.forEach((permission, key) => {
                newMap.set(key, { ...permission, checked: true });
            });
            return newMap;
        });
    }, []);

    // Optimized Deselect all using Map
    const handleDeselectAll = useCallback(() => {
        setPermissionsMap(prev => {
            const newMap = new Map(prev);
            newMap.forEach((permission, key) => {
                newMap.set(key, { ...permission, checked: false });
            });
            return newMap;
        });
    }, []);

    // Select all from current filtered results only
    const handleSelectAllFiltered = useCallback(() => {
        const filteredRouteNames = new Set(filteredData.map(p => p.route_name));
        setPermissionsMap(prev => {
            const newMap = new Map(prev);
            newMap.forEach((permission, key) => {
                if (filteredRouteNames.has(key)) {
                    newMap.set(key, { ...permission, checked: true });
                }
            });
            return newMap;
        });
    }, [filteredData]);

    // Deselect all from current filtered results only
    const handleDeselectAllFiltered = useCallback(() => {
        const filteredRouteNames = new Set(filteredData.map(p => p.route_name));
        setPermissionsMap(prev => {
            const newMap = new Map(prev);
            newMap.forEach((permission, key) => {
                if (filteredRouteNames.has(key)) {
                    newMap.set(key, { ...permission, checked: false });
                }
            });
            return newMap;
        });
    }, [filteredData]);

    // Get unique groups for filter (memoized)
    const uniqueGroups = useMemo(() => {
        const groups = new Set<string>();
        permissionsMap.forEach(p => groups.add(p.group));
        return Array.from(groups).sort();
    }, [permissionsMap]);

    // Statistics (memoized)
    const statistics = useMemo(() => {
        let selected = 0;
        permissionsMap.forEach(p => {
            if (p.checked) selected++;
        });
        
        const total = permissionsMap.size;
        return {
            total,
            selected,
            isAllSelected: selected === total && total > 0,
            isNoneSelected: selected === 0
        };
    }, [permissionsMap]);

    // Filtered statistics (memoized)
    const filteredStatistics = useMemo(() => {
        const filteredRouteNames = new Set(filteredData.map(p => p.route_name));
        let filteredSelected = 0;
        permissionsMap.forEach((p, key) => {
            if (filteredRouteNames.has(key) && p.checked) filteredSelected++;
        });
        const filteredTotal = filteredData.length;
        return {
            total: filteredTotal,
            selected: filteredSelected,
            isAllSelected: filteredSelected === filteredTotal && filteredTotal > 0,
            isNoneSelected: filteredSelected === 0
        };
    }, [filteredData, permissionsMap]);

    // Check if there's an active filter
    const hasActiveFilter = searchTerm !== '' || groupFilter !== '';

    // Paginated data
    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, page, rowsPerPage]);

    // Wait for data to be ready
    if (loading || !record || !statePermissions.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
         
            {/* Global Toolbar */}
            <Paper elevation={1} sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Permissions Selection
                        </Typography>
                        <Chip
                            label={`${statistics.selected} / ${statistics.total} selected`}
                            color={statistics.isAllSelected ? 'success' : statistics.selected > 0 ? 'warning' : 'default'}
                            variant="outlined"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {hasActiveFilter && (
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={<SelectAllIcon />}
                                    onClick={handleSelectAllFiltered}
                                    disabled={filteredStatistics.isAllSelected}
                                    size="small"
                                    color="primary"
                                >
                                    Select Filtered ({filteredStatistics.total})
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DeselectAllIcon />}
                                    onClick={handleDeselectAllFiltered}
                                    disabled={filteredStatistics.isNoneSelected}
                                    size="small"
                                    color="secondary"
                                >
                                    Deselect Filtered
                                </Button>
                                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                            </>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<SelectAllIcon />}
                            onClick={handleSelectAll}
                            disabled={statistics.isAllSelected}
                            size="small"
                        >
                            Select All
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DeselectAllIcon />}
                            onClick={handleDeselectAll}
                            disabled={statistics.isNoneSelected}
                            size="small"
                        >
                            Deselect All
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <SearchInput 
                        source="q" 
                        placeholder="Search permissions" 
                        alwaysOn
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                    {uniqueGroups && uniqueGroups.length > 0 && (
                        <SelectInput 
                            source="group" 
                            choices={uniqueGroups.map(g => ({ id: g, name: g }))}
                            alwaysOn
                            emptyText="All Groups"
                            onChange={(e: any) => setGroupFilter(e.target.value)}
                        />
                    )}
                </Box>
            </Paper>

            {/* Permissions Table */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">Enabled</TableCell>
                            <TableCell>Group</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Route Name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((permission) => (
                                <PermissionRow
                                    key={permission.route_name}
                                    permission={permission}
                                    onToggle={handleTogglePermission}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        No permissions found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredData.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </TableContainer>
        </Box>
    );
};

const PermissionsSelectorListEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { record: contextRecord, isPending, isLoading } = useEditContext();
    if (isPending || isLoading) return <CircularProgress />;
    return <PermissionsSelectorListBase {...props} record={contextRecord} />;
};

const PermissionsSelectorListCreate: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    return <PermissionsSelectorListBase {...props} record={{}} />;
};

const PermissionsSelectorList: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method } = props;
    
    switch (method) {
        case 'edit':
            return <PermissionsSelectorListEdit {...props} />;
        case 'create':
            return <PermissionsSelectorListCreate {...props} />;
        default:
            return null;
    }
};

export default PermissionsSelectorList;
