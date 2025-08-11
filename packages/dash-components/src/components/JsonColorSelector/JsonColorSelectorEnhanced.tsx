import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography,
    Chip,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ColorMapping, KeyValuePair } from './interfaces/interfaces';
import { extractAvailableModes, getContrastColor, getModeIcon, parseColorKey } from './helpers/functions';
import ColorPaletteItem from './components/ColorPaletteItem';
import ImageColorExtractor from './components/ImageColorExtractor';
import ColorEditDialog from './components/ColorEditDialog';
import { updateDomCssVariables } from 'dash-utils';
import { AuthPersistenceService } from 'dash-auth';


// Default color mappings (can be modified later)
const DEFAULT_COLOR_MAPPINGS: ColorMapping = {
    "primary-color": "Primary Color",
    "secondary-color": "Secondary Color",
    "highlight-color": "Highlight Color",
    "contrast-color": "Contrast Color",
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
    const [extractedColors, setExtractedColors] = useState<number[][]>([]); // Add this state

    // File input ref for CSS import
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Throttling refs
    const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdatesRef = useRef<Map<string, { key: string; color: string }>>(new Map());

    // Dispatch loading events
    const dispatchLoadingEvent = useCallback((loading: boolean) => {
        window.dispatchEvent(new MessageEvent('auto-admin-loading-state', { data: loading }));
    }, []);

    const handleColorsExtracted = useCallback((colors: number[][]) => {
        setExtractedColors(colors);
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

    // Export colors as CSS variables
    const handleExportCSS = useCallback(() => {
        try {
            const cssContent = generateCSSContent(pairs);
            const blob = new Blob([cssContent], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'color-variables.css';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('CSS variables exported successfully');
        } catch (error) {
            console.error('Error exporting CSS variables:', error);
        }
    }, [pairs]);

    // Import colors from CSS file
    const handleImportCSS = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Handle file selection for CSS import
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const cssContent = e.target?.result as string;
                const importedPairs = parseCSSContent(cssContent);
                
                if (importedPairs.length > 0) {
                    // Merge with existing pairs, with imported pairs taking precedence
                    const mergedPairs = mergePairs(pairs, importedPairs);
                    setPairs(mergedPairs);
                    updateFormValue(mergedPairs);
                    console.log(`Imported ${importedPairs.length} color variables from CSS`);
                } else {
                    console.warn('No valid CSS variables found in the imported file');
                }
            } catch (error) {
                console.error('Error importing CSS file:', error);
            }
        };
        
        reader.readAsText(file);
        // Reset file input
        event.target.value = '';
    }, [pairs]);

    // Generate CSS content from pairs
    const generateCSSContent = (colorPairs: KeyValuePair[]): string => {
        const cssLines: string[] = [
            '/* Color Variables - Generated by JsonColorSelector */',
            '/* Import this file or copy these variables to your CSS */',
            '',
            ':root {'
        ];

        // Group by mode for better organization
        const groupedPairs = colorPairs.reduce((acc, pair) => {
            if (!pair.key.trim()) return acc;
            
            const { mode } = parseColorKey(pair.key);
            const groupKey = mode || 'default';
            
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(pair);
            return acc;
        }, {} as Record<string, KeyValuePair[]>);

        // Add CSS variables grouped by mode
        Object.entries(groupedPairs).forEach(([mode, modePairs]) => {
            if (modePairs.length > 0) {
                cssLines.push(`  /* ${mode} mode colors */`);
                modePairs.forEach(pair => {
                    const cssVarName = pair.key.startsWith('--') ? pair.key : `--${pair.key}`;
                    cssLines.push(`  ${cssVarName}: ${pair.value};`);
                });
                cssLines.push('');
            }
        });

        cssLines.push('}');
        cssLines.push('');
        cssLines.push('/* Usage example: */');
        cssLines.push('/* .my-element { background-color: var(--primary-color); } */');

        return cssLines.join('\n');
    };

    // Parse CSS content to extract color variables
    const parseCSSContent = (cssContent: string): KeyValuePair[] => {
        const pairs: KeyValuePair[] = [];
        
        // Remove comments and normalize whitespace
        const cleanCSS = cssContent
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Match CSS custom properties (variables)
        const variableRegex = /--([^:]+):\s*([^;]+);/g;
        let match;

        while ((match = variableRegex.exec(cleanCSS)) !== null) {
            const [, name, value] = match;
            const cleanName = name.trim();
            const cleanValue = value.trim();
            
            // Only import if it looks like a color value
            if (isColorValue(cleanValue)) {
                pairs.push({
                    key: cleanName,
                    value: cleanValue,
                    id: generateId()
                });
            }
        }

        return pairs;
    };

    // Check if a value looks like a color
    const isColorValue = (value: string): boolean => {
        const colorPatterns = [
            /^#[0-9a-fA-F]{3,8}$/, // Hex colors
            /^rgb\(/i, // RGB colors
            /^rgba\(/i, // RGBA colors
            /^hsl\(/i, // HSL colors
            /^hsla\(/i, // HSLA colors
            /^(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey)$/i // Named colors
        ];
        
        return colorPatterns.some(pattern => pattern.test(value.trim()));
    };

    // Merge imported pairs with existing pairs
    const mergePairs = (existingPairs: KeyValuePair[], importedPairs: KeyValuePair[]): KeyValuePair[] => {
        const merged = [...existingPairs];
        
        importedPairs.forEach(importedPair => {
            const existingIndex = merged.findIndex(pair => pair.key === importedPair.key);
            if (existingIndex >= 0) {
                // Update existing pair
                merged[existingIndex] = { ...merged[existingIndex], value: importedPair.value };
            } else {
                // Add new pair
                merged.push(importedPair);
            }
        });
        
        return merged;
    };

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

    // Handle colors update from ImageColorExtractor
    const handleColorsUpdate = (newPairs: KeyValuePair[]) => {
        setPairs(newPairs);
        updateFormValue(newPairs);
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
    const updateDomColors = (colors: Record<string, any>) => {
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
    };

    const handlePreview = useCallback((m: string) => {
        const colorsObj = pairs.reduce((acc, pair) => {
            if (pair.key.trim()) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {} as Record<string, any>);

        // Update CSS variables first
        updateDomCssVariables(m, colorsObj,getTenantSettingsValues());
    }, [pairs]); // Make sure pairs is in the dependency array


    const syncPairsFromForm = useCallback(() => {
        try {
            let currentFormValue: Record<string, any> = {};
            
            if (isNestedSetting) {
                const currentSettings = getValues('settings') || {};
                currentFormValue = getNestedValue(currentSettings, settingsPath) || {};
            } else {
                currentFormValue = getValues(attributePath) || {};
            }
            
            return currentFormValue;
        } catch (error) {
            console.error('Error syncing pairs from form values:', error);
            return {};
        }
    }, [getValues, isNestedSetting, settingsPath, attributePath]);


    const getTenantSettingsValues = () => {
            const persistedTenantSettings = AuthPersistenceService.getTenantSettings();
            if (persistedTenantSettings) {
                return persistedTenantSettings?.values || {};
            }
            return {}
        };


    useEffect(() => {
        const handleThemeSwitch = (event: CustomEvent<{ mode: string }>) => {
            console.log('Theme switch event received:', event.detail.mode);
            
            // Get current colors directly from form instead of relying on pairs state
            const currentColors = syncPairsFromForm();
            
            console.log('Current colors from form:', currentColors); // Debug log
           
            // Update CSS variables with current form values
            updateDomCssVariables(event.detail.mode, currentColors,getTenantSettingsValues());
        };

        window.addEventListener('dash-theme-mode-switched', handleThemeSwitch as EventListener);

        return () => {
            window.removeEventListener('dash-theme-mode-switched', handleThemeSwitch as EventListener);
        };
    }, [syncPairsFromForm]);

     
        const updateFormValue = (currentPairs: KeyValuePair[]) => {
            const obj = currentPairs.reduce((acc, pair) => {
                if (pair.key.trim()) {
                    acc[pair.key] = pair.value;
                }
                return acc;
            }, {} as Record<string, any>);

            if (isNestedSetting) {
                const currentSettings = getValues('settings') || {};
                const updatedSettings = setNestedValue({ ...currentSettings }, settingsPath, obj);
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

                {/* Hidden file input for CSS import */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".css"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {/* Image Color Extractor - Updated */}
                <ImageColorExtractor
                    onColorsExtracted={handleColorsExtracted}
                    onColorsUpdate={handleColorsUpdate}
                    existingPairs={pairs}
                />

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

                {/* Header Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                            startIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                            onClick={handleExportCSS}
                            color="secondary"
                            disabled={pairs.length === 0}
                        >
                            Export CSS
                        </Button>
                        <Button
                            startIcon={<UploadIcon />}
                            variant="outlined"
                            size="small"
                            onClick={handleImportCSS}
                            color="secondary"
                        >
                            Import CSS
                        </Button>
                    </Box>
                    <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        size="small"
                        onClick={addPair}
                    >
                        Add Color
                    </Button>
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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

                {/* Edit Dialog - Updated with extracted colors */}
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
                    extractedColors={extractedColors} // Pass extracted colors
                />
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
            case 'list':
            default:
                return <>Not implemented</>;
        }
    };

    export default JsonColorSelector;