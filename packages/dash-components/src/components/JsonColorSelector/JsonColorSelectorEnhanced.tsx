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
    Grid,
    Pagination,
    Card,
    Link,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ColorMapping, KeyValuePair } from './interfaces/interfaces';
import { extractAvailableModes, getContrastColor, getModeIcon, parseColorKey } from './helpers/functions';
import ImageColorExtractor from './components/ImageColorExtractor';
import ColorEditDialog from './components/ColorEditDialog';
import BasicColorSelector from './components/BasicColorSelector';
import {
    BasicPalette,
    ThemeMode,
    basesFromImagePalette,
    deriveBrandPairs,
    extractBases,
} from './helpers/paletteDerivation';
import { updateDomCssVariables } from 'dash-utils';
import { AuthPersistenceService } from 'dash-auth';


// Feature flags for pagination behavior
const JSON_COLOR_SELECTOR_PAGINATION_ENABLED: boolean = false;
const JSON_COLOR_SELECTOR_PAGINATION_SHOW_ALL: boolean = false;

// AI theme generation (OpenAI via backend theme-generator endpoint) is opt-in.
// Enable per-field via the setting format's componentProps: { aiThemeEnabled: true }.
const JSON_COLOR_SELECTOR_AI_ENABLED_DEFAULT: boolean = false;

// Default color mappings (can be modified later)
const DEFAULT_COLOR_MAPPINGS: ColorMapping = {
    "primary-color": "Primary Color",
    "secondary-color": "Secondary Color",
    "highlight-color": "Highlight Color",
    "contrast-color": "Contrast Color",
};


// Local Color Palette Item Component with new design
const LocalColorPaletteItem: React.FC<{
    pair: KeyValuePair;
    onEdit: (pair: KeyValuePair) => void;
    onDelete: (id: string) => void;
}> = ({ pair, onEdit, onDelete }) => {
    const textColor = getContrastColor(pair.value);
    const { baseChips, mode } = parseColorKey(pair.key);
    const modeIcon = getModeIcon(mode);
    
    return (
        <Card
            onClick={() => onEdit(pair)}
            elevation={1}
             sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'stretch', // Ensure stretch for full height
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                },
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                height: 80, // Fixed height for consistency
                backgroundColor: 'background.paper',
            }}
        >
            {/* Left Color Box */}
            <Box
                sx={{
                    width: 80, // Fixed square width
                    backgroundColor: pair.value,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Hover Edit Icon Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <EditIcon sx={{ color: '#fff' }} />
                </Box>
            </Box>

            {/* Right Details Section */}
            <Box sx={{ 
                flexGrow: 1, 
                p: 1.5, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                overflow: 'hidden'
            }}>
                 <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                     <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'text.secondary' }}>
                        {pair.value}
                    </Typography>
                     {mode && (
                        <Chip
                            label={mode}
                            size="small"
                            icon={<span style={{ marginLeft: 6, fontSize: '0.8rem' }}>{modeIcon}</span>}
                            sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { padding: '0 6px' },
                            }}
                        />
                    )}
                 </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {baseChips.map((chip, index) => (
                        <Chip
                            key={index}
                            label={chip}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                maxWidth: '100%',
                                '& .MuiChip-label': {
                                    padding: '0 6px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                },
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Card>
    );
};

export const JsonEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method, attribute, resourceConfig } = props;

    // AI theme generation is opt-in: settable per-field via componentProps.aiThemeEnabled
    const aiThemeEnabled: boolean =
        (props as any).aiThemeEnabled ??
        (attribute as any)?.componentProps?.aiThemeEnabled ??
        JSON_COLOR_SELECTOR_AI_ENABLED_DEFAULT;

    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();

    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;

    const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');
    const [pairs, setPairs] = useState<KeyValuePair[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedMode, setSelectedMode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRendering, setIsRendering] = useState<boolean>(true);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [editingPair, setEditingPair] = useState<KeyValuePair | null>(null);
    const [extractedColors, setExtractedColors] = useState<number[][]>([]); // Add this state
    
    // Pagination state
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(50);
    const [showAll, setShowAll] = useState<boolean>(!JSON_COLOR_SELECTOR_PAGINATION_ENABLED);

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
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(1);
    };

    const handleModeChange = (event: any) => {
        setSelectedMode(event.target.value);
        setPage(1);
    };

    const handleClearMode = () => {
        setSelectedMode('');
        setPage(1);
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

    // ------------------------------------------------------------------
    // Basic mode: 5 base colors per mode, full brand palette derived locally
    // ------------------------------------------------------------------

    const colorsRecord = useMemo(() => {
        return pairs.reduce((acc, pair) => {
            if (pair.key.trim()) acc[pair.key] = pair.value;
            return acc;
        }, {} as Record<string, string>);
    }, [pairs]);

    const lightBases = useMemo(() => extractBases(colorsRecord, 'light'), [colorsRecord]);
    const darkBases = useMemo(() => extractBases(colorsRecord, 'dark'), [colorsRecord]);

    // Derive the brand palette from the given bases and merge it over current pairs.
    // Neutral greyscale and semantic alert keys are untouched by design.
    const applyBases = useCallback((light: BasicPalette, dark: BasicPalette) => {
        const derived = deriveBrandPairs(light, dark);
        const derivedPairs: KeyValuePair[] = Object.entries(derived).map(([key, value]) => ({
            key,
            value,
            id: generateId(),
        }));
        const merged = mergePairs(pairs, derivedPairs);
        setPairs(merged);
        updateFormValue(merged);
    }, [pairs]);

    const handleBaseChange = useCallback((mode: ThemeMode, key: keyof BasicPalette, color: string) => {
        const nextLight = mode === 'light' ? { ...lightBases, [key]: color } : lightBases;
        const nextDark = mode === 'dark' ? { ...darkBases, [key]: color } : darkBases;
        applyBases(nextLight, nextDark);
    }, [lightBases, darkBases, applyBases]);

    // Local (no-AI) image palette → base colors prefill
    const handleApplyLocalPalette = useCallback((palette: number[][]) => {
        if (!palette || palette.length === 0) return;
        const { light, dark } = basesFromImagePalette(palette);
        applyBases(light, dark);
    }, [applyBases]);

    // Update only a single DOM color property
    const updateSingleDomColor = useCallback((key: string, color: string) => {
        if (!key.trim()) return;
      
        requestAnimationFrame(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || '';
            const themeSuffix = currentTheme ? `--${currentTheme}` : '';

            if (themeSuffix && key.endsWith(themeSuffix)) {
                const baseKey = key.slice(0, -themeSuffix.length);
                document.documentElement.style.setProperty(`--${baseKey}`, color);
                document.documentElement.style.setProperty(`--${baseKey}${themeSuffix}`, color);
            } else {
                // Fallback: update the variable directly if it doesn't match the current theme suffix
                // This handles global variables or keys being edited that don't adhere to the specific suffix
                const varName = key.startsWith('--') ? key : `--${key}`;
                document.documentElement.style.setProperty(varName, color);
            }
        });
    }, []);

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

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1">
                        {attribute.label || 'Color Palette'}
                    </Typography>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        size="small"
                        onChange={(_, value) => value && setViewMode(value)}
                    >
                        <ToggleButton value="basic">Basic</ToggleButton>
                        <ToggleButton value="advanced">Advanced</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Hidden file input for CSS import */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".css"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {/* Image Color Extractor — always sits above the preview cards, so the
                    workflow reads top-to-bottom: source image first, derived theme below. */}
                <ImageColorExtractor
                    onColorsExtracted={handleColorsExtracted}
                    onColorsUpdate={handleColorsUpdate}
                    existingPairs={pairs}
                    aiEnabled={aiThemeEnabled}
                    onApplyLocal={handleApplyLocalPalette}
                />

                {/* Basic mode: 5 base colors per mode, brand palette derived locally */}
                {viewMode === 'basic' && (
                    <>
                        <BasicColorSelector
                            lightBases={lightBases}
                            darkBases={darkBases}
                            onBaseChange={handleBaseChange}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 480 }}>
                                Changing a base color regenerates the derived brand palette (sidebar, buttons, links, tables).
                                Neutral backgrounds and alert colors are preserved — fine-tune any specific value in Advanced mode.
                            </Typography>
                            <Button
                                startIcon={<PreviewIcon />}
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => handlePreview(document.documentElement.getAttribute('data-theme'))}
                            >
                                Preview Colors
                            </Button>
                        </Box>
                    </>
                )}

                {viewMode === 'advanced' && (<>
                {/* Search and Filter Controls */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    {/* Search Field */}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search colors by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        slotProps={{
                            input: {
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
                            }
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
                                label={`Mode: ${selectedMode}`}
                                size="small"
                                variant="filled"
                                color="primary"
                                onDelete={handleClearMode}
                                avatar={<span style={{ paddingLeft: 6 }}>{getModeIcon(selectedMode)}</span>}
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

                {/* Color Payload Grid with Pagination */}
                <Box sx={{ flexGrow: 1, my: 2 }}>
                     {isRendering ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                            <Typography>Rendering Grid...</Typography>
                        </Box>
                    ) : filteredPairs.length > 0 ? (
                        <>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: 2,
                                width: '100%'
                            }}>
                                {(showAll
                                    ? filteredPairs
                                    : filteredPairs.slice((page - 1) * pageSize, page * pageSize)
                                ).map((pair) => (
                                    <Box key={pair.id} sx={{ minWidth: 0 }}>
                                        <LocalColorPaletteItem
                                            pair={pair}
                                            onEdit={handleEditPair}
                                            onDelete={handleDeletePair}
                                        />
                                    </Box>
                                ))}
                            </Box>
                            
                            {/* Pagination Controls - only when pagination is enabled and not showing all */}
                            {JSON_COLOR_SELECTOR_PAGINATION_ENABLED && !showAll && filteredPairs.length > pageSize && (
                                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Pagination 
                                        count={Math.ceil(filteredPairs.length / pageSize)} 
                                        page={page} 
                                        onChange={(_, value) => setPage(value)}
                                        color="primary"
                                        size="large"
                                        showFirstButton 
                                        showLastButton
                                    />

                                    {/* Show All button */}
                                    {JSON_COLOR_SELECTOR_PAGINATION_SHOW_ALL && (
                                        <Link
                                            component="button"
                                            variant="body2"
                                            underline="always"
                                            onClick={() => setShowAll(true)}
                                            sx={{ mt: 0.5, fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            Show all
                                        </Link>
                                    )}
                                </Box>
                            )}
                            
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                                {showAll
                                    ? `Showing all ${filteredPairs.length} colors`
                                    : `Showing ${Math.min((page - 1) * pageSize + 1, filteredPairs.length)} - ${Math.min(page * pageSize, filteredPairs.length)} of ${filteredPairs.length} colors`
                                }
                            </Typography>

                            {/* Show paginated link when showing all and pagination is enabled */}
                            {JSON_COLOR_SELECTOR_PAGINATION_ENABLED && showAll && filteredPairs.length > pageSize && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                    <Link
                                        component="button"
                                        variant="body2"
                                        underline="always"
                                        onClick={() => { setShowAll(false); setPage(1); }}
                                        sx={{ fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        Show paginated
                                    </Link>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box sx={{ 
                            p: 4, 
                            textAlign: 'center', 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            border: '1px dashed #ccc' 
                        }}>
                            <Typography color="textSecondary">
                                No colors found using current filters.
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedMode('');
                                        setPage(1);
                                    }}
                                >
                                    Clear filters
                                </Link>
                            </Box>
                        </Box>
                    )}
                </Box>


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
                </>)}

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