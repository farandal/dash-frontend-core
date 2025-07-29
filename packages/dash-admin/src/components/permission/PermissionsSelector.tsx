import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useRecordContext, useRefresh, CheckboxGroupInput, Loading, useEditContext } from 'react-admin';
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
    InputAdornment
} from '@mui/material';
import { 
    SelectAll as SelectAllIcon, 
    DeselectOutlined as DeselectAllIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';

interface IPermissions {
    group: string;
    name: string;
}

interface IPermissionItem {
    group: string;
    name: string;
    checked?: boolean;
    value?: string;
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
    _method,
    _attribute,
}) => {
    const record = useRecordContext();
    const [permissions, setPermissions] = useState<IPermissions[][]>([]);

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
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
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

const PermissionsSelectorBase: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    _method,
    _attribute,
    _resourceConfig,
    record = null
}) => {
    const [permissionsData, setPermissionsData] = useState<IPermissions[][]>([]);
    const [parsedValues, setParsedValues] = useState<IPermissionItem[]>([]);
    const [expandedCards, setExpandedCards] = useState<{ [key: number]: boolean }>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [groupSearchTerm, setGroupSearchTerm] = useState<string>('');
    const [itemSearchTerm, setItemSearchTerm] = useState<string>('');
    // Add debounced search states
    const [debouncedGroupSearch, setDebouncedGroupSearch] = useState<string>('');
    const [debouncedItemSearch, setDebouncedItemSearch] = useState<string>('');
    
    // Add refs for timeout management
    const groupSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const itemSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const axios = useAxios();
    const refresh = useRefresh();
    const form = useFormContext();
    const formState = useFormState();

    const permissionObjectsController = useController({
        name: 'permission_objects',
    });

    const permissionsController = useController({
        name: 'permissions',
    });

    // Number of items to show initially (before expand)
    const INITIAL_ITEMS_COUNT = 6;

    // Memoize the groupPermissionsData function
    const groupPermissionsData = useCallback((permissionItems: IPermissionItem[]) => {
        return permissionItems.reduce((acc, item) => {
            const group = acc.find(g => g[0].group === item.group);
            if (group) {
                const nameExists = group.some(existingItem => existingItem.name === item.name);
                if (!nameExists) {
                    group.push(item);
                }
            } else {
                acc.push([item]);
            }
            return acc;
        }, [] as IPermissionItem[][]);
    }, []);

    // Debounce group search
    useEffect(() => {
        if (groupSearchTimeoutRef.current) {
            clearTimeout(groupSearchTimeoutRef.current);
        }

        groupSearchTimeoutRef.current = setTimeout(() => {
            // Only update if search term has 3+ characters or is empty (to allow clearing)
            if (groupSearchTerm.length >= 3 || groupSearchTerm.length === 0) {
                setDebouncedGroupSearch(groupSearchTerm);
            }
        }, 1000);

        return () => {
            if (groupSearchTimeoutRef.current) {
                clearTimeout(groupSearchTimeoutRef.current);
            }
        };
    }, [groupSearchTerm]);

    // Debounce item search
    useEffect(() => {
        if (itemSearchTimeoutRef.current) {
            clearTimeout(itemSearchTimeoutRef.current);
        }

        itemSearchTimeoutRef.current = setTimeout(() => {
            // Only update if search term has 3+ characters or is empty (to allow clearing)
            if (itemSearchTerm.length >= 3 || itemSearchTerm.length === 0) {
                setDebouncedItemSearch(itemSearchTerm);
            }
        }, 1000);

        return () => {
            if (itemSearchTimeoutRef.current) {
                clearTimeout(itemSearchTimeoutRef.current);
            }
        };
    }, [itemSearchTerm]);

    // Filter permissions based on debounced search terms
    const filteredPermissionsData = useMemo(() => {
        let filtered = permissionsData;

        // First filter by group name if debounced group search term exists and has 3+ chars
        if (debouncedGroupSearch.trim() && debouncedGroupSearch.length >= 3) {
            const groupSearchLower = debouncedGroupSearch.toLowerCase().trim();
            filtered = filtered.filter(tab => {
                const groupName = tab[0]?.group.toLowerCase();
                return groupName.includes(groupSearchLower);
            });
        }

        // Then filter items within each group if debounced item search term exists and has 3+ chars
        if (debouncedItemSearch.trim() && debouncedItemSearch.length >= 3) {
            const itemSearchLower = debouncedItemSearch.toLowerCase().trim();
            filtered = filtered.map(tab => {
                const filteredItems = tab.filter(permission => {
                    const permissionName = permission.name.toLowerCase();
                    const shortName = permission.name.split('.').pop()?.toLowerCase() || '';
                    return permissionName.includes(itemSearchLower) || shortName.includes(itemSearchLower);
                });
                return filteredItems;
            }).filter(tab => tab.length > 0); // Remove groups with no matching items
        }

        return filtered;
    }, [permissionsData, debouncedGroupSearch, debouncedItemSearch]);

    // Fetch permissions - FIXED: Stable function reference
    const getPermissions = useCallback(async () => {
        try {
            const { data } = await axios.get('system/permissions/availablePermissions');
            setPermissionsData(groupPermissionsData(data));
            setIsInitialized(true);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }
    }, [ groupPermissionsData]);

    // FIXED: Only fetch permissions once on mount
    useEffect(() => {
        if (!isInitialized) {
            getPermissions();
        }
    }, [getPermissions, isInitialized]);

    // Handle form submission success - FIXED: Remove refresh that causes infinite loop
    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            // Don't refresh here as it causes infinite loop
            // The parent component should handle post-save actions
        }
    }, [formState.isSubmitSuccessful]);

    // Initialize parsed values from record - FIXED: Correct field access and dependencies
    useEffect(() => {
        if (record && record.id && permissionsData.length > 0) {
            // Check multiple possible field names for permissions
            const recordPermissions = record.permissions || record.permission_objects || [];
            
            if (recordPermissions.length > 0) {
                const checked = permissionsData.map((tab) => {
                    return tab.map((permission) => {
                        // Check against different possible field structures
                        const isChecked = recordPermissions.some((element) => {
                            // Handle different permission record structures
                            if (typeof element === 'string') {
                                return element === permission.name;
                            }
                            // Handle object with route_name field
                            if (element.route_name) {
                                return element.route_name === permission.name;
                            }
                            // Handle object with name field
                            if (element.name) {
                                return element.name === permission.name;
                            }
                            return false;
                        });
                        
                        return {
                            group: permission.group,
                            name: permission.name,
                            checked: isChecked,
                        };
                    });
                });

                const parsedCheckedFiltered: IPermissionItem[] = [];
                checked.forEach((checkedItem) => {
                    checkedItem.forEach((item) => {
                        if (item.checked) {
                            parsedCheckedFiltered.push({
                                group: item.group,
                                name: item.name,
                                checked: true,
                                value: JSON.stringify(item),
                            });
                        }
                    });
                });

                setParsedValues(parsedCheckedFiltered);
            } else {
                setParsedValues([]);
            }
        } else if (!record?.id) {
            setParsedValues([]);
        }
    }, [permissionsData, record?.permissions, record?.permission_objects, record?.id]);

    // Toggle card expansion
    const toggleCard = useCallback((index: number) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    }, []);

    // Handle search input changes
    const handleGroupSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setGroupSearchTerm(event.target.value);
    }, []);

    const handleItemSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setItemSearchTerm(event.target.value);
    }, []);

    // Clear search functions - updated to clear debounced values
    const handleClearGroupSearch = useCallback(() => {
        setGroupSearchTerm('');
        setDebouncedGroupSearch('');
        if (groupSearchTimeoutRef.current) {
            clearTimeout(groupSearchTimeoutRef.current);
        }
    }, []);

    const handleClearItemSearch = useCallback(() => {
        setItemSearchTerm('');
        setDebouncedItemSearch('');
        if (itemSearchTimeoutRef.current) {
            clearTimeout(itemSearchTimeoutRef.current);
        }
    }, []);

    const handleClearAllSearches = useCallback(() => {
        setGroupSearchTerm('');
        setItemSearchTerm('');
        setDebouncedGroupSearch('');
        setDebouncedItemSearch('');
        if (groupSearchTimeoutRef.current) {
            clearTimeout(groupSearchTimeoutRef.current);
        }
        if (itemSearchTimeoutRef.current) {
            clearTimeout(itemSearchTimeoutRef.current);
        }
    }, []);



// Update the handlePermissionToggle function to preserve all existing selections
const handlePermissionToggle = useCallback((permission: IPermissionItem, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    
    const isChecked = event.target.checked;
    form.setValue('dirty', true, { shouldDirty: true });

    console.log(`Toggling permission: ${permission.name}, checked: ${isChecked}`);

    setParsedValues(prev => {
        let newValues;
        if (isChecked) {
            // Add permission if not already present
            const exists = prev.some(p => p.name === permission.name);
            if (!exists) {
                newValues = [...prev, {
                    group: permission.group,
                    name: permission.name,
                    checked: true,
                    value: JSON.stringify(permission),
                }];
            } else {
                newValues = prev;
            }
        } else {
            // Remove permission
            newValues = prev.filter(p => p.name !== permission.name);
        }
        
        console.log('Updated permissions:', newValues.map(p => p.name));
        
        // Update both form controllers
        permissionObjectsController.field.onChange(newValues);
        permissionsController.field.onChange(newValues.map(p => p.name));
        return newValues;
    });
}, [form, permissionObjectsController, permissionsController]);

// Update the handleSelectAllGroup function to preserve non-group selections
const handleSelectAllGroup = useCallback((tab: IPermissionItem[], event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    
    const isChecked = event.target.checked;
    form.setValue('dirty', true, { shouldDirty: true });

    console.log(`Select all group: ${tab[0]?.group}, checked: ${isChecked}`);

    setParsedValues(prev => {
        let newValues;
        
        // Get the original full group (not filtered)
        const originalIndex = permissionsData.findIndex(originalTab => 
            originalTab[0]?.group === tab[0]?.group
        );
        const originalGroup = permissionsData[originalIndex] || tab;
        
        if (isChecked) {
            // Add all permissions from the ORIGINAL group (not just filtered ones)
            const groupPermissions = originalGroup.map(item => ({
                checked: true,
                group: item.group,
                name: item.name,
                value: JSON.stringify(item),
            }));
            
            // Remove existing permissions from this group and add new ones
            const filtered = prev.filter(p => p.group !== tab[0]?.group);
            newValues = [...filtered, ...groupPermissions];
        } else {
            // Remove all permissions from this group (including hidden ones)
            newValues = prev.filter(p => p.group !== tab[0]?.group);
        }
        
        console.log('Updated permissions after group selection:', newValues.map(p => p.name));
        
        // Update both form controllers
        permissionObjectsController.field.onChange(newValues);
        permissionsController.field.onChange(newValues.map(p => p.name));
        return newValues;
    });
}, [form, permissionObjectsController, permissionsController]);

// Update the handleSelectAllPermissions function to ensure it works with all permissions
const handleSelectAllPermissions = useCallback(() => {
    form.setValue('dirty', true, { shouldDirty: true });
    
    // Use ALL permissions from permissionsData, not filtered ones
    const allPermissions = permissionsData.flat().map(permission => ({
        group: permission.group,
        name: permission.name,
        checked: true,
        value: JSON.stringify(permission),
    }));
    
    setParsedValues(allPermissions);
    permissionObjectsController.field.onChange(allPermissions);
    permissionsController.field.onChange(allPermissions.map(p => p.name));
}, [form, permissionsData, permissionObjectsController]);

// Update the handleDeselectAllPermissions function
const handleDeselectAllPermissions = useCallback(() => {
    form.setValue('dirty', true, { shouldDirty: true });
    
    setParsedValues([]);
    permissionObjectsController.field.onChange([]);
    permissionsController.field.onChange([]);
}, [form, permissionObjectsController, permissionsController]);









    if (!permissionsData || !permissionsData.length) return <Loading />;
    if (record === null) return <Loading />;

    // Calculate statistics for the toolbar
    const totalPermissions = permissionsData.flat().length;
    const selectedPermissions = parsedValues.length;
    const isAllSelected = selectedPermissions === totalPermissions;
    const isNoneSelected = selectedPermissions === 0;

    // Check if any search is active - updated to use debounced values
    const hasActiveSearch = debouncedGroupSearch.trim() || debouncedItemSearch.trim();
    const filteredGroupsCount = filteredPermissionsData.length;
    const totalFilteredItems = filteredPermissionsData.reduce((sum, group) => sum + group.length, 0);

    return (
        <Box sx={{ p: 2 }}>
            {/* Global Selection Toolbar */}
            <Paper 
                elevation={1} 
                sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Toolbar 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        minHeight: '64px !important',
                        px: 3,
                        bgcolor: 'background.default'
                    }}
                >
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
                            onClick={handleSelectAllPermissions}
                            disabled={isAllSelected}
                            size="small"
                            sx={{ textTransform: 'none' }}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DeselectAllIcon />}
                            onClick={handleDeselectAllPermissions}
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

            {/* Search Inputs */}
            <Paper 
                elevation={1} 
                sx={{ 
                    mb: 3, 
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}
            >
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
                    {/* Group Search */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search by Group Name"
                            placeholder="e.g., user, admin, system... (min 3 chars)"
                            value={groupSearchTerm}
                            onChange={handleGroupSearchChange}
                            helperText={
                                groupSearchTerm.length > 0 && groupSearchTerm.length < 3 
                                    ? `Type ${3 - groupSearchTerm.length} more character${3 - groupSearchTerm.length !== 1 ? 's' : ''} to search`
                                    : groupSearchTerm.length >= 3 && groupSearchTerm !== debouncedGroupSearch
                                    ? "Searching..."
                                    : ""
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: groupSearchTerm && (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small"
                                            onClick={handleClearGroupSearch}
                                            sx={{ 
                                                minWidth: 'auto',
                                                p: 0.5,
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'text.primary',
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </Button>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                },
                            }}
                        />
                    </Grid>

                    {/* Item Search */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search by Permission Name"
                            placeholder="e.g., create, edit, delete, view... (min 3 chars)"
                            value={itemSearchTerm}
                            onChange={handleItemSearchChange}
                            helperText={
                                itemSearchTerm.length > 0 && itemSearchTerm.length < 3 
                                    ? `Type ${3 - itemSearchTerm.length} more character${3 - itemSearchTerm.length !== 1 ? 's' : ''} to search`
                                    : itemSearchTerm.length >= 3 && itemSearchTerm !== debouncedItemSearch
                                    ? "Searching..."
                                    : ""
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: itemSearchTerm && (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small"
                                            onClick={handleClearItemSearch}
                                            sx={{ 
                                                minWidth: 'auto',
                                                p: 0.5,
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'text.primary',
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </Button>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                },
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Search Results Summary */}
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
                        {/* Show typing indicator */}
                        {(groupSearchTerm !== debouncedGroupSearch || itemSearchTerm !== debouncedItemSearch) && (
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                • Updating results...
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>

            {/* No Results Message */}
            {hasActiveSearch && filteredPermissionsData.length === 0 && (
                <Paper 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        border: '1px dashed',
                        borderColor: 'divider'
                    }}
                >
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

            {/* Permissions Grid */}
            {filteredPermissionsData.length > 0 && (
                <Grid container spacing={3}>
                    {filteredPermissionsData.map((tab, index) => {
                        // Find the original index for expanded cards state
                        const originalIndex = permissionsData.findIndex(originalTab => 
                            originalTab[0]?.group === tab[0]?.group
                        );
                        
                        const isExpanded = expandedCards[originalIndex] || false;
                        const groupPermissions = parsedValues.filter(p => p.group === tab[0].group);
                        
                        // For "select all" checkbox, we need to check against the original full group
                        const originalGroup = permissionsData[originalIndex] || tab;
                        const isAllSelectedInOriginalGroup = groupPermissions.length === originalGroup.length;
                        
                        // For display purposes, use filtered items
                        const hasMoreItems = tab.length > INITIAL_ITEMS_COUNT;
                        const visibleItems = isExpanded ? tab : tab.slice(0, INITIAL_ITEMS_COUNT);
                        const remainingCount = tab.length - INITIAL_ITEMS_COUNT;

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${tab[0]?.group}-${index}`}>
                                <Card 
                                    variant="outlined" 
                                    sx={{ 
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            boxShadow: 3,
                                            borderColor: 'primary.main'
                                        },
                                        // Highlight if search is active
                                        ...(hasActiveSearch && {
                                            border: '2px solid',
                                            borderColor: 'primary.light',
                                            bgcolor: 'primary.50'
                                        })
                                    }}
                                >
                                    <CardContent sx={{ 
                                        flexGrow: 1, 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        p: 2,
                                        '&:last-child': { pb: 2 }
                                    }}>
                                        {/* Card Header */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            mb: 2,
                                            minHeight: '32px'
                                        }}>
                                            <Typography 
                                                variant="subtitle1" 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    lineHeight: 1.2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flex: 1,
                                                    mr: 1
                                                }}
                                            >
                                                  {tab[0]?.group.charAt(0).toUpperCase() + tab[0]?.group.slice(1)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Chip 
                                                    label={`${groupPermissions.length}/${originalGroup.length}`}
                                                    size="small"
                                                    color={isAllSelectedInOriginalGroup ? 'success' : groupPermissions.length > 0 ? 'warning' : 'default'}
                                                    sx={{ fontSize: '0.75rem', height: 24 }}
                                                />
                                                {debouncedItemSearch && tab.length !== originalGroup.length && (
                                                    <Chip 
                                                        label={`${tab.length} shown`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{ fontSize: '0.7rem', height: 24 }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                        
                                        {/* Select All Checkbox */}
                                        <Box sx={{ mb: 2 }}>
                                            <label style={checkboxStyles.selectAllLabel}>
                                                <input
                                                    type="checkbox"
                                                    style={checkboxStyles.checkbox}
                                                    checked={isAllSelectedInOriginalGroup}
                                                    onChange={(event) => handleSelectAllGroup(originalGroup, event)}
                                                />
                                                Seleccionar Todos
                                                {debouncedItemSearch && tab.length !== originalGroup.length && (
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ ml: 1, color: 'text.secondary' }}
                                                    >
                                                        (all {originalGroup.length})
                                                    </Typography>
                                                )}
                                            </label>
                                            <Divider sx={{ mt: 1 }} />
                                        </Box>
                                        
                                        {/* Permissions List */}
                                        <Box sx={{ flexGrow: 1, mb: hasMoreItems ? 2 : 0 }}>
                                            <Grid container spacing={1}>
                                                {visibleItems.map((permission, i) => {
                                                    const isChecked = parsedValues.some(p => p.name === permission.name);
                                                    const permissionDisplayName = permission.name.split('.').pop();
                                                    
                                                    // Highlight matching text if item search is active - updated to use debounced search
                                                    const shouldHighlight = debouncedItemSearch && (
                                                        permission.name.toLowerCase().includes(debouncedItemSearch.toLowerCase()) ||
                                                        permissionDisplayName?.toLowerCase().includes(debouncedItemSearch.toLowerCase())
                                                    );

                                                    return (
                                                        <Grid size={12} key={i}>
                                                            <label style={checkboxStyles.checkboxLabel}>
                                                                <input
                                                                    type="checkbox"
                                                                    style={checkboxStyles.checkbox}
                                                                    checked={isChecked}
                                                                    onChange={(event) => handlePermissionToggle(permission, event)}
                                                                />
                                                                <Typography 
                                                                    variant="caption" 
                                                                    sx={{ 
                                                                        fontSize: '0.8rem',
                                                                        lineHeight: 1.3,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        ...(shouldHighlight && {
                                                                            bgcolor: 'warning.light',
                                                                            color: 'warning.contrastText',
                                                                            px: 0.5,
                                                                            borderRadius: 0.5,
                                                                            fontWeight: 600
                                                                        })
                                                                    }}
                                                                >
                                                                    {permissionDisplayName}
                                                                </Typography>
                                                            </label>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Box>
                                        
                                        {/* Expand/Collapse Button - Fixed at bottom */}
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
                                                    onClick={() => toggleCard(originalIndex)}
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

            {/* Hidden CheckboxGroupInput for form integration */}
            <Box sx={{ display: 'none' }}>
                <CheckboxGroupInput
                    source="permission_objects"
                    parse={(raw) => {
                        try {
                            const _return: IPermissionItem[] = [];
                            raw.forEach((permission) => {
                                const name = permission;
                                let found: IPermissionItem | undefined;
                                permissionsData.some((_tab) => {
                                    const founded = _tab.find((toFind) => toFind.name === name);
                                    if (founded) {
                                        found = {
                                            group: founded.group,
                                            name: founded.name
                                        };
                                        return true;
                                    }
                                    return false;
                                });
                                if (found) {
                                    _return.push(found);
                                }
                            });
                            return _return;
                        } catch (error) {
                            console.log(error);
                            return raw;
                        }
                    }}
                    format={() => {
                        try {
                            return parsedValues.map((item) => item.name);
                        } catch (error) {
                            console.log(error);
                            return [];
                        }
                    }}
                    choices={permissionsData.flat().map((item, i) => ({
                        ...item,
                        value: item.name,
                        id: `${item.group}_${item.name}_${i}`,
                    }))}
                    optionText={(record) => record.name.split('.').pop()}
                    optionValue="name"
                />
            </Box>
        </Box>
    );
};

const PermissionsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { record } = useEditContext();
    return <PermissionsSelectorBase {...props} record={record} />;
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
            return <PermissionsSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default PermissionsSelector;
