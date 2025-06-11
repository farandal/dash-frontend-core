import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { 
    Box, 
    Button, 
    IconButton, 
    TextField, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Popover,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PreviewIcon from '@mui/icons-material/Preview';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ChromePicker } from 'react-color';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface KeyValuePair {
    key: string;
    value: string;
    id: string;
}

export const JsonEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method, attribute, resourceConfig } = props;

    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();
    
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    const [pairs, setPairs] = useState<KeyValuePair[]>([]);
    const [keyError, setKeyError] = useState<{[key: string]: string}>({});
    const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
    const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRendering, setIsRendering] = useState<boolean>(true);

    // Throttling refs
    const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdatesRef = useRef<Map<string, { key: string; color: string }>>(new Map());
    
    // Dispatch loading events
    const dispatchLoadingEvent = useCallback((loading: boolean) => {
        window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: loading }));
    }, []);

    // Filter pairs based on search term
    const filteredPairs = useMemo(() => {
        if (!searchTerm.trim()) {
            return pairs;
        }
        return pairs.filter(pair => 
            pair.key.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pairs, searchTerm]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };
    
    // Initial data loading effect
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            dispatchLoadingEvent(true);
            
            try {
                let initialValue: Record<string, any> = {};
                let defaultValues: Record<string, any> = {};
             
                try {
                    defaultValues = attribute?.default_value || {};
                } catch (e) {
                    defaultValues = {};
                }
                
                if (isNestedSetting && record?.settings) {
                    const settings = record.settings || {};
                    initialValue = { ...defaultValues, ...getNestedValue(settings, settingsPath) };
                } else if (record?.[attributePath]) {
                    initialValue = { ...defaultValues, ...record[attributePath] };
                } else {
                    initialValue = defaultValues;
                }
                
                const initialPairs = Object.entries(initialValue).map(([key, value]) => ({
                    key,
                    value: String(value),
                    id: generateId()
                }));
                
                setPairs(initialPairs);
                
                // Simulate processing time for large datasets
                if (initialPairs.length > 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [record, attributePath]);

    // Rendering completion effect
    useEffect(() => {
        if (!isLoading && pairs.length >= 0) {
            setIsRendering(true);
            
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsRendering(false);
                    dispatchLoadingEvent(false);
                });
            });
        }
    }, [isLoading, pairs.length, dispatchLoadingEvent]);

    // Cleanup throttle timeout on unmount
    useEffect(() => {
        return () => {
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
            }
            // Ensure loading state is cleared on unmount
            dispatchLoadingEvent(false);
        };
    }, [dispatchLoadingEvent]);
    
    const getNestedValue = (obj: any, path: string): any => {
        if (!path) return obj;
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : {}), obj);
    };
    
    const setNestedValue = (obj: any, path: string, value: any): any => {
        if (!path) return value;
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((o, key) => {
            if (o[key] === undefined) o[key] = {};
            return o[key];
        }, obj);
        
        if (lastKey) {
            lastObj[lastKey] = value;
        }
        return obj;
    };
    
    const generateId = (): string => {
        return Math.random().toString(36).substring(2, 11);
    };
    
    const addPair = () => {
        setPairs([...pairs, { key: '', value: '#000000', id: generateId() }]);
    };
    
    const removePair = (id: string) => {
        const updatedPairs = pairs.filter(pair => pair.id !== id);
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };
    
    const handleKeyChange = (id: string, newKey: string) => {
        const isDuplicate = pairs.some(pair => pair.id !== id && pair.key === newKey);
        
        if (isDuplicate) {
            setKeyError({...keyError, [id]: 'Duplicate key'});
        } else {
            setKeyError({...keyError, [id]: ''});
        }
        
        const updatedPairs = pairs.map(pair => 
            pair.id === id ? { ...pair, key: newKey } : pair
        );
        
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };
    
    // Update only a single DOM color property
    const updateSingleDomColor = (key: string, color: string) => {
        if (!key.trim()) return;
        
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const themeSuffix = `--${currentTheme}`;
        
        if (key.endsWith(themeSuffix)) {
            const baseKey = key.slice(0, -themeSuffix.length);
            document.documentElement.style.setProperty(`--${baseKey}`, color);
        }
    };

    // Throttled DOM update function
    const flushPendingDomUpdates = useCallback(() => {
        if (pendingUpdatesRef.current.size > 0) {
            // Process all pending updates
            pendingUpdatesRef.current.forEach(({ key, color }) => {
                updateSingleDomColor(key, color);
            });
            
            // Clear pending updates
            pendingUpdatesRef.current.clear();
        }
        
        // Clear the timeout reference
        throttleTimeoutRef.current = null;
    }, []);

    // Throttled color change handler
    const handleColorChange = (id: string, newColor: string) => {
        // Update state immediately for UI responsiveness
        const updatedPairs = pairs.map(pair => 
            pair.id === id ? { ...pair, value: newColor } : pair
        );
        
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
        
        // Add to pending DOM updates
        const changedPair = updatedPairs.find(pair => pair.id === id);
        if (changedPair && changedPair.key.trim()) {
            pendingUpdatesRef.current.set(id, {
                key: changedPair.key,
                color: newColor
            });
            
            // Throttle DOM updates to every 500ms
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
            }
            
            throttleTimeoutRef.current = setTimeout(flushPendingDomUpdates, 500);
        }
    };

    const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setColorPickerAnchor(event.currentTarget);
        setSelectedPairId(id);
    };

    const handleColorPickerClose = () => {
        setColorPickerAnchor(null);
        setSelectedPairId(null);
        
        // Flush any pending updates when closing color picker
        if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
            flushPendingDomUpdates();
        }
    };
    
    // Batch update for preview only - processes all colors at once
    const updateDomColors = (colors: Record<string, any>) => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const themeSuffix = `--${currentTheme}`;
        
        // Use requestAnimationFrame for better performance with batch updates
        requestAnimationFrame(() => {
            Object.entries(colors).forEach(([key, value]) => {
                if (key.endsWith(themeSuffix)) {
                    const baseKey = key.slice(0, -themeSuffix.length);
                    document.documentElement.style.setProperty(`--${baseKey}`, String(value));
                }
            });
        });
    };

    // Preview function - flushes pending updates and then does batch update
    const handlePreview = () => {
        // First, flush any pending throttled updates
        if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
            flushPendingDomUpdates();
        }
        
        const colorsObj = pairs.reduce((acc, pair) => {
            if (pair.key.trim()) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {} as Record<string, any>);
        
        // Batch update all colors for preview
        updateDomColors(colorsObj);
    };

    const updateFormValue = (currentPairs: KeyValuePair[]) => {
        const obj = currentPairs.reduce((acc, pair) => {
            if (pair.key.trim()) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {} as Record<string, any>);
        
        if (isNestedSetting) {
            const currentSettings = getValues('settings') || {};
            const updatedSettings = setNestedValue({...currentSettings}, settingsPath, obj);
            setValue('settings', updatedSettings, { shouldDirty: true });
        } else {
            setValue(attributePath, obj, { shouldDirty: true });
        }
    };

    // Show loading state while component is initializing or rendering
    if (isLoading || isRendering) {
        return (
            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="textSecondary">
                    {isLoading ? 'Loading color settings...' : 'Rendering colors...'}
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1">
                {attribute.label || 'Color Settings'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Button 
                    startIcon={<PreviewIcon />} 
                    variant="contained" 
                    size="small" 
                    onClick={handlePreview}
                    color="primary"
                >
                    Preview
                </Button>
                <Button 
                    startIcon={<AddIcon />} 
                    variant="outlined" 
                    size="small" 
                    onClick={addPair}
                >
                    Add Color
                </Button>
            </Box>

            {/* Search Field */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search colors by name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={handleClearSearch}
                                    edge="end"
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Results count when searching */}
            {searchTerm && (
                <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                    Showing {filteredPairs.length} of {pairs.length} colors
                </Typography>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                {filteredPairs.map((pair) => (
                    <Box
                        key={pair.id}
                        sx={{
                            position: 'relative',
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: pair.value,
                            minHeight: 100,
                            boxShadow: '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            value={pair.key}
                            onChange={(e) => handleKeyChange(pair.id, e.target.value)}
                            error={!!keyError[pair.id]}
                            helperText={keyError[pair.id]}
                            sx={{
                                '& .MuiInputBase-root': {
                                    bgcolor: 'background.paper',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            value={pair.value}
                            sx={{ mt: 1 }}
                            slotProps={{ 
                                input: { 
                                    readOnly: true,
                                    sx: { 
                                        bgcolor: 'background.paper'
                                    }
                                }
                            }}
                        />
                        <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
                            <IconButton
                                size="small"
                                onClick={(e) => handleColorPickerOpen(e, pair.id)}
                                sx={{ 
                                    bgcolor: 'white',
                                    color: pair.value,
                                    '&:hover': { bgcolor: 'background.paper' }
                                }}
                            >
                                <ColorLensIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={() => removePair(pair.id)}
                                color="error"
                                sx={{ 
                                    bgcolor: 'white',
                                    color: 'red',
                                    '&:hover': { bgcolor: 'background.paper' }
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                ))}
            </Box>
            
            {/* Show message when no results found */}
            {searchTerm && filteredPairs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No colors found matching "{searchTerm}"
                    </Typography>
                </Box>
            )}
            
            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleColorPickerClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <ChromePicker
                    color={pairs.find(p => p.id === selectedPairId)?.value || '#000000'}
                    onChange={(color) => {
                        if (selectedPairId) {
                            handleColorChange(selectedPairId, color.hex);
                        }
                    }}
                />
            </Popover>
        </Box>
    );
};

// Helper function to determine text color based on background
const getContrastColor = (hexcolor: string) => {
    // Remove the # if present
    const hex = hexcolor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const JsonView: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { attribute, default_value } = props;
    const record = useRecordContext();
    
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRendering, setIsRendering] = useState<boolean>(true);
    const [displayValue, setDisplayValue] = useState<Record<string, any>>({});

    // Dispatch loading events
    const dispatchLoadingEvent = useCallback((loading: boolean) => {
        window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: loading }));
    }, []);

    // Initial data loading effect
    useEffect(() => {
        const loadViewData = async () => {
            setIsLoading(true);
            dispatchLoadingEvent(true);
            
            try {
                let viewValue: Record<string, any> = {};
                let defaultValues: Record<string, any> = {};

                try {
                    defaultValues = attribute?.default_value || {};
                } catch (e) {
                    defaultValues = {};
                }
                
                if (isNestedSetting && record?.settings) {
                    const settings = record.settings || {};
                    if (settingsPath) {
                        const keys = settingsPath.split('.');
                        viewValue = { ...defaultValues, ...keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : {}), settings) };
                    } else {
                        viewValue = { ...defaultValues, ...settings };
                    }
                } else if (record?.[attributePath]) {
                    viewValue = { ...defaultValues, ...record[attributePath] };
                } else {
                    viewValue = defaultValues;
                }

                setDisplayValue(viewValue);
                
                // Simulate processing time for large datasets
                if (Object.keys(viewValue).length > 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('Error loading view data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadViewData();
    }, [record, attributePath, attribute, isNestedSetting, settingsPath]);

    // Rendering completion effect
    useEffect(() => {
        if (!isLoading && Object.keys(displayValue).length >= 0) {
            setIsRendering(true);
            
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsRendering(false);
                    dispatchLoadingEvent(false);
                });
            });
        }
    }, [isLoading, displayValue, dispatchLoadingEvent]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            // Ensure loading state is cleared on unmount
            dispatchLoadingEvent(false);
        };
    }, [dispatchLoadingEvent]);
    
    // Filter display values based on search term
    const filteredDisplayValue = useMemo(() => {
        if (!searchTerm.trim()) {
            return displayValue;
        }
        return Object.entries(displayValue).reduce((acc, [key, value]) => {
            if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
    }, [displayValue, searchTerm]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Show loading state while component is initializing or rendering
    if (isLoading || isRendering) {
        return (
            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="textSecondary">
                    {isLoading ? 'Loading color settings...' : 'Rendering colors...'}
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Color Settings'}
            </Typography>
            
            {Object.keys(displayValue).length > 0 && (
                <>
                    {/* Search Field for View Mode */}
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search colors by name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSearch}
                                            edge="end"
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Results count when searching */}
                    {searchTerm && (
                        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                            Showing {Object.keys(filteredDisplayValue).length} of {Object.keys(displayValue).length} colors
                        </Typography>
                    )}

                    {Object.keys(filteredDisplayValue).length > 0 ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2, p: 2 }}>
                            {Object.entries(filteredDisplayValue).map(([key, value]) => (
                                <Box
                                    key={key}
                                    sx={{
                                        position: 'relative',
                                        height: 100,
                                        borderRadius: 1,
                                        backgroundColor: value as string,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        p: 1,
                                        boxShadow: '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: getContrastColor(value as string),
                                            fontWeight: 'bold',
                                            width: '100%',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {key}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            color: getContrastColor(value as string),
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {value as string}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="textSecondary">
                                No colors found matching "{searchTerm}"
                            </Typography>
                        </Box>
                    )}
                </>
            )}
            
            {Object.keys(displayValue).length === 0 && (
                <Typography variant="body2" color="textSecondary">
                    No colors configured
                </Typography>
            )}
        </Box>
    );
};

const JsonColorSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const [componentLoading, setComponentLoading] = useState(true);

    // Dispatch loading event when component mounts
    useEffect(() => {
        window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: true }));
        
        // Set a small timeout to allow component to initialize
        const timer = setTimeout(() => {
            setComponentLoading(false);
        }, 50);

        return () => {
            clearTimeout(timer);
            // Ensure loading state is cleared on unmount
            window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: false }));
        };
    }, []);

    // Show initial loading state
    if (componentLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                <Typography variant="body2" color="textSecondary">
                    Initializing color selector...
                </Typography>
            </Box>
        );
    }

    switch (method) {
        case 'edit':
            return <JsonEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'create':
            return <JsonEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'view':
            return <JsonView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default JsonColorSelector;
