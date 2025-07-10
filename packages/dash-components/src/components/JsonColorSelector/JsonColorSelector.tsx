import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { 
    Box, 
    Button, 
    IconButton, 
    TextField, 
    Typography, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Chip,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    useColorScheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ChromePicker, RGBColor } from 'react-color';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DashThemeHelperProvider, useDashThemeHelperContext, updateDomCssVariables } from 'dash-default-theme';
import { AuthPersistenceService } from 'dash-admin';

interface KeyValuePair {
    key: string;
    value: string;
    id: string;
}

interface ColorFormat {
    hex: string;
    rgb: RGBColor;
    hsl: { h: number; s: number; l: number; a?: number };
}

type ColorFormatType = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

// Helper function to determine text color based on background
const getContrastColor = (color: string): string => {
    // Handle different color formats
    let r: number, g: number, b: number, a: number = 1;
    
    if (color.startsWith('#')) {
        // Hex color
        const hex = color.replace('#', '');
        if (hex.length === 8) {
            // RGBA hex
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
            a = parseInt(hex.substr(6, 2), 16) / 255;
        } else {
            // RGB hex
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
    } else if (color.startsWith('rgb')) {
        // RGB/RGBA color
        const match = color.match(/rgba?\(([^)]+)\)/);
        if (match) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            [r, g, b, a = 1] = values;
        } else {
            return '#000000';
        }
    } else if (color.startsWith('hsl')) {
        // For HSL, we'll use a simple approach
        return '#000000';
    } else {
        return '#000000';
    }
    
    // Calculate luminance considering alpha
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const effectiveLuminance = luminance * a + (1 - a); // Blend with white background
    
    return effectiveLuminance > 0.5 ? '#000000' : '#ffffff';
};

// Helper function to convert color to different formats
const convertColor = (color: ColorFormat, format: ColorFormatType): string => {
    switch (format) {
        case 'hex':
            return color.hex;
        case 'rgb':
            return `rgb(${Math.round(color.rgb.r)}, ${Math.round(color.rgb.g)}, ${Math.round(color.rgb.b)})`;
        case 'rgba':
            return `rgba(${Math.round(color.rgb.r)}, ${Math.round(color.rgb.g)}, ${Math.round(color.rgb.b)}, ${color.rgb.a || 1})`;
        case 'hsl':
            return `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%)`;
        case 'hsla':
            return `hsla(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%, ${color.hsl.a || 1})`;
        default:
            return color.hex;
    }
};

// Helper function to parse color key and create chips
const parseColorKey = (key: string) => {
    const parts = key.split('--');
    const baseName = parts[0];
    const mode = parts[1];
    
    // Split base name by hyphens for individual chips
    const baseChips = baseName.split('-').filter(part => part.length > 0);
    
    return { baseChips, mode };
};

// Helper function to extract available modes from color keys
const extractAvailableModes = (pairs: KeyValuePair[]): string[] => {
    const modes = new Set<string>();
    
    pairs.forEach(pair => {
        const { mode } = parseColorKey(pair.key);
        if (mode) {
            modes.add(mode);
        }
    });
    
    return Array.from(modes).sort();
};

// Helper function to get mode icon
const getModeIcon = (mode: string | undefined): string => {
    if (!mode) return '';
    
    switch (mode.toLowerCase()) {
        case 'light':
            return '☀️'; // Sun icon
        case 'dark':
            return '🌙'; // Moon icon
        default:
            return mode; // Plain text for other modes
    }
};

// Color palette item component
const ColorPaletteItem: React.FC<{
    pair: KeyValuePair;
    onEdit: (pair: KeyValuePair) => void;
    onDelete: (id: string) => void;
}> = ({ pair, onEdit, onDelete }) => {
    const textColor = getContrastColor(pair.value);
    const { baseChips, mode } = parseColorKey(pair.key);
    const modeIcon = getModeIcon(mode);
    
    return (
        <Box 
            sx={{ 
        aspectRatio: 'unset', // Remove aspect ratio
        height: '30px', // Set fixed height
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
        },
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: pair.value,
        display: 'flex',
        flexDirection: 'row', // Change to row for horizontal layout
        alignItems: 'center',
        justifyContent: 'flex-start', // Align to start
        padding: '0 8px', // Horizontal padding only
        gap: 0.5,
    }}
            onClick={() => onEdit(pair)}
        >
            {/* Base name chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, justifyContent: 'center' }}>
                {baseChips.map((chip, index) => (
                    <Chip
                        key={index}
                        label={chip}
                        size="small"
                        sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#333',
                            '& .MuiChip-label': {
                                padding: '0 4px',
                            },
                        }}
                    />
                ))}
            </Box>
            
            {/* Mode chip/icon */}
            {mode && (
                <Chip
                    label={modeIcon}
                    size="small"
                    sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        '& .MuiChip-label': {
                            padding: '0 4px',
                        },
                    }}
                />
            )}
        </Box>
    );
};

// Color edit dialog component
const ColorEditDialog: React.FC<{
    open: boolean;
    pair: KeyValuePair | null;
    onClose: () => void;
    onSave: (pair: KeyValuePair) => void;
    onDelete: (id: string) => void;
    existingKeys: string[];
     updateSingleDomColor: (key: string, color: string) => void;
}> = ({ open, pair, onClose, onSave, onDelete, existingKeys,updateSingleDomColor }) => {
    const [editedPair, setEditedPair] = useState<KeyValuePair | null>(null);
    const [colorFormat, setColorFormat] = useState<ColorFormatType>('hex');
    const [keyError, setKeyError] = useState<string>('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (pair) {
            setEditedPair({ ...pair });
            // Detect color format
            if (pair.value.startsWith('rgba(')) {
                setColorFormat('rgba');
            } else if (pair.value.startsWith('rgb(')) {
                setColorFormat('rgb');
            } else if (pair.value.startsWith('hsla(')) {
                setColorFormat('hsla');
            } else if (pair.value.startsWith('hsl(')) {
                setColorFormat('hsl');
            } else {
                setColorFormat('hex');
            }
        }
        setKeyError('');
    }, [pair]);

    const handleKeyChange = (newKey: string) => {
        if (!editedPair) return;
        
        const isDuplicate = existingKeys.some(key => key === newKey && newKey !== pair?.key);
        setKeyError(isDuplicate ? 'Key already exists' : '');
        
        setEditedPair({ ...editedPair, key: newKey });
    };

    const handleColorChange = (color: any) => {
        if (!editedPair) return;
        
        const newValue = convertColor(color, colorFormat);
        setEditedPair({ ...editedPair, value: newValue });

         updateSingleDomColor(editedPair.key, newValue);
         
    };

    const handleSave = () => {
        if (!editedPair || keyError || !editedPair.key.trim()) return;
        onSave(editedPair);
        onClose();
    };

    const handleDelete = () => {
        if (!editedPair) return;
        onDelete(editedPair.id);
        onClose();
    };

    if (!editedPair) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { minHeight: 600 }
            }}
        >
            <DialogTitle>
                {pair?.key ? `Edit Color: ${pair.key}` : 'Add New Color'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    {/* Color Name */}
                    <TextField
                        fullWidth
                        label="Color Name"
                        value={editedPair.key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        error={!!keyError}
                        helperText={keyError}
                        placeholder="e.g., primary-color--light, background-dark--dark"
                    />

                    {/* Color Format Selector */}
                    <FormControl fullWidth>
                        <InputLabel>Color Format</InputLabel>
                        <Select
                            value={colorFormat}
                            label="Color Format"
                            onChange={(e) => setColorFormat(e.target.value as ColorFormatType)}
                        >
                            <MenuItem value="hex">HEX</MenuItem>
                            <MenuItem value="rgb">RGB</MenuItem>
                            <MenuItem value="rgba">RGBA (with alpha)</MenuItem>
                            <MenuItem value="hsl">HSL</MenuItem>
                            <MenuItem value="hsla">HSLA (with alpha)</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Color Picker Tabs */}
                    <Box>
                        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                            <Tab label="Color Picker" />
                            <Tab label="Manual Input" />
                        </Tabs>

                        {tabValue === 0 && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <ChromePicker
                                    color={editedPair.value}
                                    onChange={handleColorChange}
                                    disableAlpha={!['rgba', 'hsla'].includes(colorFormat)}
                                />
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label={`Color Value (${colorFormat.toUpperCase()})`}
                                    value={editedPair.value}
                                    onChange={(e) => setEditedPair({ ...editedPair, value: e.target.value })}
                                    placeholder={
                                        colorFormat === 'hex' ? '#ff0000' :
                                        colorFormat === 'rgb' ? 'rgb(255, 0, 0)' :
                                        colorFormat === 'rgba' ? 'rgba(255, 0, 0, 1)' :
                                        colorFormat === 'hsl' ? 'hsl(0, 100%, 50%)' :
                                        'hsla(0, 100%, 50%, 1)'
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        backgroundColor: editedPair.value,
                                                        border: '1px solid #ccc',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Color Preview */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Preview
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                height: 80,
                                backgroundColor: editedPair.value,
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: getContrastColor(editedPair.value),
                                    fontWeight: 'bold',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    padding: '4px 8px',
                                    borderRadius: 1,
                                }}
                            >
                                    {editedPair.key || 'Color Preview'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                {pair?.key && (
                    <Button
                        onClick={handleDelete}
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Delete
                    </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!!keyError || !editedPair.key.trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const JsonEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method, attribute, resourceConfig } = props;

    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();
    
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    const [pairs, setPairs] = useState<KeyValuePair[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedMode, setSelectedMode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRendering, setIsRendering] = useState<boolean>(true);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [editingPair, setEditingPair] = useState<KeyValuePair | null>(null);

    // Throttling refs
    const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdatesRef = useRef<Map<string, { key: string; color: string }>>(new Map());
    
    // Dispatch loading events
    const dispatchLoadingEvent = useCallback((loading: boolean) => {
        window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: loading }));
    }, []);

    // Extract available modes from pairs
    const availableModes = useMemo(() => {
        return extractAvailableModes(pairs);
    }, [pairs]);

    // Filter pairs based on search term and selected mode
    const filteredPairs = useMemo(() => {
        let filtered = pairs;
        
        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(pair => 
                pair.key.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by selected mode
        if (selectedMode) {
            filtered = filtered.filter(pair => {
                const { mode } = parseColorKey(pair.key);
                return mode === selectedMode;
            });
        }
        
        return filtered;
    }, [pairs, searchTerm, selectedMode]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleModeChange = (event: any) => {
        setSelectedMode(event.target.value);
    };

    const handleClearMode = () => {
        setSelectedMode('');
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
        const newPair = { key: '', value: '#000000', id: generateId() };
        setEditingPair(newPair);
        setEditDialogOpen(true);
    };
    
    const handleEditPair = (pair: KeyValuePair) => {
        setEditingPair(pair);
        setEditDialogOpen(true);
    };

    const handleSavePair = (editedPair: KeyValuePair) => {
        const existingIndex = pairs.findIndex(p => p.id === editedPair.id);
        let updatedPairs: KeyValuePair[];
        
        if (existingIndex >= 0) {
            // Update existing pair
            updatedPairs = pairs.map(p => p.id === editedPair.id ? editedPair : p);
        } else {
            // Add new pair
            updatedPairs = [...pairs, editedPair];
        }
        
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
        updateSingleDomColor(editedPair.key, editedPair.value);
    };

    const handleDeletePair = (id: string) => {
        const updatedPairs = pairs.filter(pair => pair.id !== id);
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

    // Batch update for preview only - processes all colors at once
    /*const updateDomColors = (colors: Record<string, any>) => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const themeSuffix = `--${currentTheme}`;
        
        requestAnimationFrame(() => {
            Object.entries(colors).forEach(([key, value]) => {
                if (key.endsWith(themeSuffix)) {
                    const baseKey = key.slice(0, -themeSuffix.length);
                    document.documentElement.style.setProperty(`--${baseKey}`, String(value));
                }
            });
        });
    };*/
    
    
const getTenantSettingsValues = () => {
        const persistedTenantSettings = AuthPersistenceService.getTenantSettings();
        if (persistedTenantSettings) {
            return persistedTenantSettings?.values || {};
        }
        return {}
    };

 
    const handlePreview = (m:string) => {
        const colorsObj = pairs.reduce((acc, pair) => {
            if (pair.key.trim()) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {} as Record<string, any>);
  
        //updateAllDomColors();
        //updateDomColors(colorsObj);
        updateDomCssVariables(m,colorsObj,getTenantSettingsValues());
      
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
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Color Palette'}
            </Typography>
            
            {/* Header Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Button 
                    startIcon={<PreviewIcon />} 
                    variant="contained" 
                    size="small" 
                    onClick={() => handlePreview(document.documentElement.getAttribute('data-theme'))}
                    color="primary"
                >
                    Preview Colors
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

            {/* Search and Filter Controls */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                {/* Search Field */}
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

                {/* Mode Selector */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Mode</InputLabel>
                    <Select
                        value={selectedMode}
                        label="Mode"
                        onChange={handleModeChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <FilterListIcon fontSize="small" />
                            </InputAdornment>
                        }
                        endAdornment={selectedMode && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={handleClearMode}
                                    edge="end"
                                    sx={{ mr: 1 }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )}
                    >
                        <MenuItem value="">
                            <em>All Modes</em>
                        </MenuItem>
                        {availableModes.map((mode) => (
                            <MenuItem key={mode} value={mode}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{getModeIcon(mode)}</span>
                                    <span>{mode}</span>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Results count when filtering */}
            {(searchTerm || selectedMode) && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                        label={`${filteredPairs.length} of ${pairs.length} colors`}
                        size="small"
                        variant="outlined"
                    />
                    {selectedMode && (
                        <Chip 
                            label={`Mode: ${getModeIcon(selectedMode)} ${selectedMode}`}
                            size="small"
                            variant="filled"
                            color="primary"
                            onDelete={handleClearMode}
                        />
                    )}
                    {searchTerm && (
                        <Chip 
                            label={`Search: "${searchTerm}"`}
                            size="small"
                            variant="filled"
                            color="secondary"
                            onDelete={handleClearSearch}
                        />
                    )}
                </Box>
            )}
            
            {/* Color Palette Grid */}
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', // Double the width from 120px to 240px
                gap: 0,
                mb: 2,
                border: '1px solid #e0e0e0',
            }}>
                {filteredPairs.map((pair) => (
                    <ColorPaletteItem
                        key={pair.id}
                        pair={pair}
                        onEdit={handleEditPair}
                        onDelete={handleDeletePair}
                    />
                ))}
            </Box>
            
            {/* Show message when no results found */}
            {(searchTerm || selectedMode) && filteredPairs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No colors found matching your filters
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {searchTerm && (
                            <Button size="small" onClick={handleClearSearch}>
                                Clear search
                            </Button>
                        )}
                        {selectedMode && (
                            <Button size="small" onClick={handleClearMode}>
                                Clear mode filter
                            </Button>
                        )}
                    </Box>
                </Box>
            )}

            {/* Show message when no colors exist */}
            {pairs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        No colors in your palette yet
                    </Typography>
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        onClick={addPair}
                    >
                        Add Your First Color
                    </Button>
                </Box>
            )}
            
            {/* Edit Dialog */}
            <ColorEditDialog
                open={editDialogOpen}
                pair={editingPair}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditingPair(null);
                }}
                onSave={handleSavePair}
                onDelete={handleDeletePair}
                existingKeys={pairs.map(p => p.key)}
                updateSingleDomColor={updateSingleDomColor} 
            />
        </Box>
    );
};

export const JsonView: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { attribute } = props;
    const record = useRecordContext();
    
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedMode, setSelectedMode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRendering, setIsRendering] = useState<boolean>(true);
    const [displayValue, setDisplayValue] = useState<Record<string, any>>({});
   
    // Dispatch loading events
    const dispatchLoadingEvent = useCallback((loading: boolean) => {
        window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: loading }));
    }, []);

    // Convert displayValue to pairs for mode extraction
    const displayPairs = useMemo(() => {
        return Object.entries(displayValue).map(([key, value]) => ({
            key,
            value: String(value),
            id: key
        }));
    }, [displayValue]);

    // Extract available modes from display pairs
    const availableModes = useMemo(() => {
        return extractAvailableModes(displayPairs);
    }, [displayPairs]);

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
            dispatchLoadingEvent(false);
        };
    }, [dispatchLoadingEvent]);
    
    // Filter display values based on search term and selected mode
    const filteredDisplayValue = useMemo(() => {
        let filtered = Object.entries(displayValue);
        
        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(([key]) => 
                key.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by selected mode
        if (selectedMode) {
            filtered = filtered.filter(([key]) => {
                const { mode } = parseColorKey(key);
                return mode === selectedMode;
            });
        }
        
        return filtered.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, any>);
    }, [displayValue, searchTerm, selectedMode]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleModeChange = (event: any) => {
        setSelectedMode(event.target.value);
    };

    const handleClearMode = () => {
        setSelectedMode('');
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
                {attribute.label || 'Color Palette'}
            </Typography>
            
            {Object.keys(displayValue).length > 0 && (
                <>
                    {/* Search and Filter Controls for View Mode */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                        {/* Search Field */}
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

                        {/* Mode Selector */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Mode</InputLabel>
                            <Select
                                value={selectedMode}
                                label="Mode"
                                onChange={handleModeChange}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <FilterListIcon fontSize="small" />
                                    </InputAdornment>
                                }
                                endAdornment={selectedMode && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearMode}
                                            edge="end"
                                            sx={{ mr: 1 }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )}
                            >
                                <MenuItem value="">
                                    <em>All Modes</em>
                                </MenuItem>
                                {availableModes.map((mode) => (
                                    <MenuItem key={mode} value={mode}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{getModeIcon(mode)}</span>
                                            <span>{mode}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Results count when filtering */}
                    {(searchTerm || selectedMode) && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                                label={`${Object.keys(filteredDisplayValue).length} of ${Object.keys(displayValue).length} colors`}
                                size="small"
                                variant="outlined"
                            />
                            {selectedMode && (
                                <Chip 
                                    label={`Mode: ${getModeIcon(selectedMode)} ${selectedMode}`}
                                    size="small"
                                    variant="filled"
                                    color="primary"
                                    onDelete={handleClearMode}
                                />
                            )}
                            {searchTerm && (
                                <Chip 
                                    label={`Search: "${searchTerm}"`}
                                    size="small"
                                    variant="filled"
                                    color="secondary"
                                    onDelete={handleClearSearch}
                                />
                            )}
                        </Box>
                    )}

                      {Object.keys(filteredDisplayValue).length > 0 ? (
                        <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', // Double the width
                                gap: 0,
                                border: '1px solid #e0e0e0',
                            }}>
                                {Object.entries(filteredDisplayValue).map(([key, value]) => {
                                    const { baseChips, mode } = parseColorKey(key);
                                    const modeIcon = getModeIcon(mode);
                                    
                                    return (
                                        <Box 
                                            key={key}
                                            sx={{ 
                                                aspectRatio: 'unset', // Remove aspect ratio
                                                height: '30px', // Set fixed height
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 3,
                                                },
                                                position: 'relative',
                                                overflow: 'hidden',
                                                backgroundColor: value as string,
                                                display: 'flex',
                                                flexDirection: 'row', // Change to row
                                                alignItems: 'center',
                                                justifyContent: 'flex-start', // Align to start
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '0 8px', // Horizontal padding only
                                                gap: 0.5,
                                            }}
                                        >
                                                                    {/* Base name chips */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, justifyContent: 'center' }}>
                                            {baseChips.map((chip, index) => (
                                                <Chip
                                                    key={index}
                                                    label={chip}
                                                    size="small"
                                                    sx={{
                                                        height: 16,
                                                        fontSize: '0.6rem',
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        color: '#fff',
                                                        '& .MuiChip-label': {
                                                            padding: '0 4px',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        
                                        {/* Mode chip/icon */}
                                        {mode && (
                                            <Chip
                                                label={modeIcon}
                                                size="small"
                                                sx={{
                                                    height: 16,
                                                    fontSize: '0.6rem',
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: '#fff',
                                                    '& .MuiChip-label': {
                                                        padding: '0 4px',
                                                    },
                                                }}
                                            />
                                        )}
                                        
                                        {/* Color value - smaller and at bottom */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: getContrastColor(value as string),
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                padding: '1px 4px',
                                                borderRadius: 0.5,
                                                fontSize: '0.5rem',
                                                fontFamily: 'monospace',
                                                textAlign: 'center',
                                                mt: 'auto',
                                            }}
                                        >
                                            {value as string}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="textSecondary">
                                No colors found matching your filters
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                {searchTerm && (
                                    <Button size="small" onClick={handleClearSearch}>
                                        Clear search
                                    </Button>
                                )}
                                {selectedMode && (
                                    <Button size="small" onClick={handleClearMode}>
                                        Clear mode filter
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </>
            )}
            
            {Object.keys(displayValue).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No colors configured in this palette
                    </Typography>
                </Box>
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
                    Initializing color palette...
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
