import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useRecordContext, useRefresh, CheckboxGroupInput, Loading, useEditContext, useGetOne } from 'react-admin';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useAxios } from 'dash-axios-hook';
import { 
    Grid,
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Box,
    Chip,
    Divider,
    Stack,
    Toolbar,
    Paper,
    TextField,
    InputAdornment,
    CircularProgress,
    IconButton
} from '@mui/material';
import { 
    SelectAll as SelectAllIcon, 
    DeselectOutlined as DeselectAllIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';

import {useAvailablePermissionsFormats} from "./AvailablePermissionsContext";
import { useSystemRequestsCache } from '../../contexts/SystemRequestsCache';
import { NotFound } from 'dash-components';


interface IPermissionItem {
    group: string;
    name: string;
    route_name: string;
    checked?: boolean;
}

// Styles for HTML checkboxes
const checkboxStyles = {
    checkbox: {
        marginRight: '8px',
        cursor: 'pointer',
        accentColor: '#1976d2'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '4px 0',
        margin: 0,
        userSelect: 'none' as const
    },
    selectAllLabel: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        margin: 0,
        userSelect: 'none' as const
    }
};

const PermissionsSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    method,
    attribute,
}) => {
    const record = useRecordContext();
    const [permissions, setPermissions] = useState<IPermissionItem[][]>([]);

    useEffect(() => {

        if (record?.permissions) {
        
            const groupedPermissions = record.permissions.reduce((acc, permission) => {
                const group = acc.find(g => g[0]?.group === permission.group);
                if (group) {
                    group.push(permission);
                } else {
                    acc.push([permission]);
                }
                return acc;
            }, [] as any[]);
            setPermissions(groupedPermissions);
        }
    }, [record?.permissions]);

    if (!record?.permissions || record.permissions.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No permissions assigned
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Assigned Permissions ({record.permissions.length})
            </Typography>
            <Grid container spacing={3}>
                {permissions?.map((tab, index) => (
                    <Grid xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                        {tab[0]?.group.charAt(0).toUpperCase() + tab[0]?.group.slice(1)}
                                    </Typography>
                                    <Chip 
                                        label={tab.length}
                                        size="small"
                                        color="primary"
                                    />
                                </Box>
                                <Stack spacing={0.5}>
                                    {tab.map((item, i) => (
                                        <Typography key={i} variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                            • {item.name.split('.').pop()}
                                        </Typography>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// Utility for deep equality check (comparing by route_name instead of name)
function arePermissionsEqual(a: IPermissionItem[], b: IPermissionItem[]) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    const aRouteNames = a.map(p => p.route_name).sort();
    const bRouteNames = b.map(p => p.route_name).sort();
    return aRouteNames.every((routeName, idx) => routeName === bRouteNames[idx]);
}

const INITIAL_ITEMS_COUNT = 6;

const PermissionsSelectorBase: React.FC<IDashAutoAdminCustomFieldComponent & { record: any }> = ({
    method,
    attribute,
    resourceConfig,
    record = null
}) => {
    const [permissionsData, setPermissionsData] = useState<IPermissionItem[][]>([]);
    const [parsedValues, setParsedValues] = useState<IPermissionItem[]>([]);
    const [expandedCards, setExpandedCards] = useState<{ [key: number]: boolean }>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [groupSearchTerm, setGroupSearchTerm] = useState<string>('');
    const [itemSearchTerm, setItemSearchTerm] = useState<string>('');
    const [debouncedGroupSearch, setDebouncedGroupSearch] = useState<string>('');
    const [debouncedItemSearch, setDebouncedItemSearch] = useState<string>('');
    
    const groupSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const axios = useAxios();
    const refresh = useRefresh();
    const form = useFormContext();
    const formState = useFormState();

    // Controllers for both permission_objects and permissions fields
    const permissionObjectsController = useController({ name: 'permission_objects' });
    const permissionsController = useController({ name: 'permissions' });

    // Local state for selected permissions (array of permission objects)
    const [statePermissions, setStatePermissions] = useState<IPermissionItem[]>([]);

    const { formats: availablePermissions, loading } = useSystemRequestsCache();

    // Group permissions by their group
    const groupPermissions = useCallback((permissions: IPermissionItem[]) => {
        return permissions.reduce((acc, permission) => {
            const group = acc.find(g => g[0]?.group === permission.group);
            if (group) {
                group.push(permission);
            } else {
                acc.push([permission]);
            }
            return acc;
        }, [] as IPermissionItem[][]);
    }, []);

    // --- Debounced search logic (improved for UX) ---
    useEffect(() => {
        if (groupSearchTimeoutRef.current) clearTimeout(groupSearchTimeoutRef.current);
        groupSearchTimeoutRef.current = setTimeout(() => {
            setDebouncedGroupSearch(groupSearchTerm);
        }, 500);
        return () => { if (groupSearchTimeoutRef.current) clearTimeout(groupSearchTimeoutRef.current); };
    }, [groupSearchTerm]);
    useEffect(() => {
        if (itemSearchTimeoutRef.current) clearTimeout(itemSearchTimeoutRef.current);
        itemSearchTimeoutRef.current = setTimeout(() => {
            setDebouncedItemSearch(itemSearchTerm);
        }, 500);
        return () => { if (itemSearchTimeoutRef.current) clearTimeout(itemSearchTimeoutRef.current); };
    }, [itemSearchTerm]);

    // Initialize permissions from available permissions
    useEffect(() => {
        if (!isInitialized && availablePermissions) {
            const perms = Array.isArray(availablePermissions.data)
                ? availablePermissions.data
                : Array.isArray(availablePermissions)
                    ? availablePermissions
                    : [];
            if (perms.length > 0) {
                const groupedPerms = groupPermissions(perms);
                setPermissionsData(groupedPerms);
                // Initialize all cards as collapsed by default
                const initialExpandedState = groupedPerms.reduce((acc, _, index) => {
                    acc[index] = false;
                    return acc;
                }, {} as { [key: number]: boolean });
                setExpandedCards(initialExpandedState);
            }
            setIsInitialized(true);
        }
    }, [availablePermissions, isInitialized, groupPermissions]);

    // --- FIX: Remove field.onChange from useEffect that watches parsedValues ---
    // Only set parsedValues and call field.onChange when the record changes (external update)
    useEffect(() => {
        if (!loading && record && record.id && permissionsData.length > 0) {
            const initialPermissionObjects = record.permission_objects || [];
            // Only update if different
            if (!arePermissionsEqual(initialPermissionObjects, statePermissions)) {
                setStatePermissions(initialPermissionObjects);
            }
        }
    // Only run when record or permissionsData changes
    }, [permissionsData, record?.permissions, record?.permission_objects, record?.id, loading]);

    // When initializing statePermissions from backend, only consider a permission checked if it is present in permission_objects
    useEffect(() => {
        if (!loading && record && record.id && permissionsData.length > 0) {
            const initialPermissionObjects = record.permission_objects || [];
            // Only permissions present in permission_objects are checked
            // Compare by route_name since that's the unique identifier
            const checkedRouteNames = new Set(initialPermissionObjects.map(obj => obj.route_name));
            const initialChecked = permissionsData.flat().map(p => ({
                ...p,
                checked: checkedRouteNames.has(p.route_name)
            }));
            // Only update if different
            if (
                statePermissions.length !== initialChecked.length ||
                statePermissions.some((p, i) => p.route_name !== initialChecked[i].route_name || p.checked !== initialChecked[i].checked)
            ) {
                setStatePermissions(initialChecked);
            }
        }
    // Only run when record or permissionsData changes
    }, [permissionsData, record?.permissions, record?.permission_objects, record?.id, loading]);

    // Sync statePermissions to form fields
    useEffect(() => {
        if (!statePermissions) return;
        // Always update permission_objects with the array of permission objects (with checked: true)
        permissionObjectsController.field.onChange(statePermissions.map(p => ({ ...p, checked: true })));
        // Optionally update permissions with just the route_names
        permissionsController.field.onChange(statePermissions.map(p => p.route_name));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statePermissions]);

    // Update the handleTogglePermission function to be more explicit about checked status
    const handleTogglePermission = useCallback((permission: IPermissionItem) => {
        setStatePermissions(prev => prev.map(p =>
            p.route_name === permission.route_name ? { ...p, checked: !p.checked } : p
        ));
    }, []);

    // Handle toggling all permissions in a group
    const handleToggleGroup = useCallback((groupPermissions: IPermissionItem[]) => {
        setStatePermissions(prev => {
            const allSelected = groupPermissions.every(p => prev.find(sel => sel.route_name === p.route_name && sel.checked));
            return prev.map(p =>
                groupPermissions.some(gp => gp.route_name === p.route_name)
                    ? { ...p, checked: !allSelected }
                    : p
            );
        });
    }, []);

    // Select all: set checked: true for all
    const handleSelectAll = useCallback(() => {
        console.log('Selecting all permissions', permissionsData.flat().length);
        setStatePermissions(prev => 
            prev.map(p => ({ ...p, checked: true }))
        );
    }, []);

    // Deselect all: set checked: false for all
    const handleDeselectAll = useCallback(() => {
        setStatePermissions(prev => prev.map(p => ({ ...p, checked: false })));
    }, []);

    // When syncing to form fields, make sure we're only sending checked permissions
    useEffect(() => {
        if (!statePermissions) return;
        
        // CHANGED: Only include permissions that have checked=true
        const checkedPermissions = statePermissions.filter(p => p.checked);
        
        // Update permission_objects with ONLY the checked permissions
        permissionObjectsController.field.onChange(checkedPermissions);
        
        // Update permissions field with just the route_names of checked permissions
        permissionsController.field.onChange(
            checkedPermissions.map(p => p.route_name)
        );
        
        // Log what we're sending to the form (for debugging)
        console.log('Syncing permissions to form:', {
            totalPermissions: statePermissions.length,
            checkedPermissions: checkedPermissions.length,
            selectedCount: statePermissions.filter(p => p.checked).length,
            firstFew: checkedPermissions.slice(0, 3).map(p => p.name)
        });
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statePermissions]);

    // --- Filtered permissions with search summary ---
    const filteredPermissions = useMemo(() => {
        let filtered = permissionsData;
        if (debouncedGroupSearch.trim()) {
            const groupSearchLower = debouncedGroupSearch.toLowerCase().trim();
            filtered = filtered.filter(tab => tab[0]?.group.toLowerCase().includes(groupSearchLower));
        }
        if (debouncedItemSearch.trim()) {
            const itemSearchLower = debouncedItemSearch.toLowerCase().trim();
            filtered = filtered.map(tab => tab.filter(item =>
                item.name.toLowerCase().includes(itemSearchLower) ||
                item.name.split('.').pop()?.toLowerCase().includes(itemSearchLower)
            )).filter(tab => tab.length > 0);
        }
        return filtered;
    }, [permissionsData, debouncedGroupSearch, debouncedItemSearch]);

    // --- UI statistics ---
    const totalPermissions = permissionsData.flat().length;
    const selectedPermissions = statePermissions.filter(p => p.checked).length;
    const isAllSelected = selectedPermissions === totalPermissions;
    const isNoneSelected = selectedPermissions === 0;
    const hasActiveSearch = !!debouncedGroupSearch.trim() || !!debouncedItemSearch.trim();
    const filteredGroupsCount = filteredPermissions.length;
    const totalFilteredItems = filteredPermissions.reduce((sum, group) => sum + group.length, 0);

    // --- Clear search handlers ---
    const handleClearGroupSearch = useCallback(() => setGroupSearchTerm(''), []);
    const handleClearItemSearch = useCallback(() => setItemSearchTerm(''), []);
    const handleClearAllSearches = useCallback(() => {
        setGroupSearchTerm('');
        setItemSearchTerm('');
        setDebouncedGroupSearch('');
        setDebouncedItemSearch('');
    }, []);

    // --- Utility: Check if all permissions in a group are selected ---
    const isGroupSelected = useCallback((groupPermissions: IPermissionItem[]) => {
        return groupPermissions.every(p =>
            statePermissions.find(sel => sel.name === p.name && sel.checked)
        );
    }, [statePermissions]);

    // --- Utility: Count selected permissions in a group ---
    const getSelectedCount = useCallback((groupPermissions: IPermissionItem[]) => {
        return groupPermissions.filter(p =>
            statePermissions.find(sel => sel.name === p.name && sel.checked)
        ).length;
    }, [statePermissions]);

    // --- Utility: Check if a single permission is selected ---
    const isPermissionSelected = useCallback((permission: IPermissionItem) => {
        const found = statePermissions.find(p => p.name === permission.name);
        return !!found?.checked;
    }, [statePermissions]);

    if(!statePermissions) return <CircularProgress />;
    if (!permissionsData || !permissionsData.length) return <CircularProgress />;
    if (!record) return <CircularProgress />;

    return (
        <Box sx={{ p: 2 }}>
            {/* --- Global Toolbar --- */}
            <Paper elevation={1} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                <Toolbar sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '64px !important',
                    px: 3,
                    bgcolor: 'background.default'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Permissions Selection
                        </Typography>
                        <Chip
                            label={`${selectedPermissions} / ${totalPermissions} selected`}
                            color={isAllSelected ? 'success' : selectedPermissions > 0 ? 'warning' : 'default'}
                            variant="outlined"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<SelectAllIcon />}
                            onClick={handleSelectAll}
                            disabled={isAllSelected}
                            size="small"
                            sx={{ textTransform: 'none' }}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DeselectAllIcon />}
                            onClick={handleDeselectAll}
                            disabled={isNoneSelected}
                            size="small"
                            color="secondary"
                            sx={{ textTransform: 'none' }}
                        >
                            Deselect All
                        </Button>
                    </Box>
                </Toolbar>
            </Paper>

            {/* --- Search & Filter Panel --- */}
            <Paper elevation={1} sx={{ mb: 3, p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <FilterIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Search & Filter
                    </Typography>
                    {hasActiveSearch && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={handleClearAllSearches}
                            startIcon={<ClearIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Clear All Filters
                        </Button>
                    )}
                </Box>
                <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search by Group Name"
                            placeholder="e.g., user, admin, system..."
                            value={groupSearchTerm}
                            onChange={e => setGroupSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: groupSearchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleClearGroupSearch}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search by Permission Name"
                            placeholder="e.g., create, edit, delete, view..."
                            value={itemSearchTerm}
                            onChange={e => setItemSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: itemSearchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleClearItemSearch}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>
                {hasActiveSearch && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Search Results:</strong> {filteredGroupsCount} group{filteredGroupsCount !== 1 ? 's' : ''} 
                            {' '}({totalFilteredItems} permission{totalFilteredItems !== 1 ? 's' : ''}) 
                            {' '}of {permissionsData.length} total groups ({totalPermissions} total permissions)
                        </Typography>
                        {debouncedGroupSearch && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                                • Group filter: "{debouncedGroupSearch}"
                            </Typography>
                        )}
                        {debouncedItemSearch && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                                • Permission filter: "{debouncedItemSearch}"
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>

            {/* --- No Results Message --- */}
            {hasActiveSearch && filteredPermissions.length === 0 && (
                <Paper sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.default',
                    border: '1px dashed',
                    borderColor: 'divider'
                }}>
                    <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No permissions found
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                        No permissions match your search criteria
                        {debouncedGroupSearch && ` for group "${debouncedGroupSearch}"`}
                        {debouncedItemSearch && ` for permission "${debouncedItemSearch}"`}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClearAllSearches}
                        startIcon={<ClearIcon />}
                    >
                        Clear All Filters
                    </Button>
                </Paper>
            )}

            {/* --- Permissions Grid --- */}
            {filteredPermissions.length > 0 && (
                <Grid container spacing={3}>
                    {filteredPermissions.map((group, groupIndex) => {
                        const groupLabel = group[0]?.group || 'Other';
                        const isExpanded = expandedCards[groupIndex] || false;
                        const groupSelectedCount = getSelectedCount(group);
                        const isAllSelectedInGroup = isGroupSelected(group);
                        const hasMoreItems = group.length > INITIAL_ITEMS_COUNT;
                        const visibleItems = isExpanded ? group : group.slice(0, INITIAL_ITEMS_COUNT);
                        const remainingCount = group.length - INITIAL_ITEMS_COUNT;
                        return (
                            <Grid xs={12} md={4} key={groupIndex}>
                                <Card variant="outlined" sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: 3,
                                        borderColor: 'primary.main'
                                    },
                                    ...(hasActiveSearch && {
                                        border: '2px solid',
                                        borderColor: 'primary.light',
                                        bgcolor: 'primary.50'
                                    })
                                }}>
                                    <CardContent sx={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: 2,
                                        '&:last-child': { pb: 2 }
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mb: 2,
                                            minHeight: '32px'
                                        }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
                                                {groupLabel}
                                            </Typography>
                                            <Chip
                                                label={`${groupSelectedCount}/${group.length}`}
                                                size="small"
                                                color={isAllSelectedInGroup ? "primary" : groupSelectedCount > 0 ? "warning" : "default"}
                                                sx={{ fontSize: '0.75rem', height: 24, mr: 1 }}
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <label style={checkboxStyles.selectAllLabel}>
                                                <input
                                                    type="checkbox"
                                                    style={checkboxStyles.checkbox}
                                                    checked={isAllSelectedInGroup}
                                                    onChange={() => handleToggleGroup(group)}
                                                />
                                                Select all {groupLabel} permissions
                                            </label>
                                            <Divider sx={{ mt: 1 }} />
                                        </Box>
                                        <Box sx={{ flexGrow: 1, mb: hasMoreItems ? 2 : 0 }}>
                                            <Stack spacing={0.5}>
                                                {visibleItems.map((permission, permIndex) => {
                                                    const displayName = permission.name.split('.').pop();
                                                    const isChecked = isPermissionSelected(permission);
                                                    const shouldHighlight = debouncedItemSearch &&
                                                        (permission.name.toLowerCase().includes(debouncedItemSearch.toLowerCase()) ||
                                                        displayName?.toLowerCase().includes(debouncedItemSearch.toLowerCase()));
                                                    return (
                                                        <Box key={permIndex}>
                                                            <label style={checkboxStyles.checkboxLabel}>
                                                                <input
                                                                    type="checkbox"
                                                                    style={checkboxStyles.checkbox}
                                                                    checked={isChecked}
                                                                    onChange={() => handleTogglePermission(permission)}
                                                                />
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontSize: '0.8rem',
                                                                            lineHeight: 1.3,
                                                                            ...(shouldHighlight && {
                                                                                bgcolor: 'warning.light',
                                                                                color: 'warning.contrastText',
                                                                                px: 0.5,
                                                                                borderRadius: 0.5,
                                                                                fontWeight: 600
                                                                            })
                                                                        }}
                                                                    >
                                                                        {displayName}
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        sx={{ 
                                                                            color: 'text.disabled', 
                                                                            fontSize: '0.7rem', 
                                                                            ml: 0,
                                                                            display: 'block',
                                                                            maxWidth: '100%',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {permission.name}
                                                                    </Typography>
                                                                </Box>
                                                            </label>
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        </Box>
                                        {hasMoreItems && (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mt: 'auto',
                                                pt: 1,
                                                borderTop: '1px solid',
                                                borderColor: 'divider'
                                            }}>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => setExpandedCards(prev => ({
                                                        ...prev,
                                                        [groupIndex]: !isExpanded
                                                    }))}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        minHeight: '28px',
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    {isExpanded
                                                        ? 'Show Less ▲'
                                                        : `Show ${remainingCount} More ▼`
                                                    }
                                                </Button>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

const PermissionsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { record: contextRecord, resource, isPending,isLoading} = useEditContext();
    if (isPending || isLoading) return <CircularProgress />;
    return <PermissionsSelectorBase {...props} record={contextRecord} />;
};

const PermissionsSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    return <PermissionsSelectorBase {...props} record={{}} />;
};

const PermissionsSelector = ({
    method,
    attribute,
    resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {

    switch (method) {
        case 'edit':
            return <PermissionsSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'create':
            return <PermissionsSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'view':
            return <><NotFound/></>
            //<PermissionsSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default PermissionsSelector;