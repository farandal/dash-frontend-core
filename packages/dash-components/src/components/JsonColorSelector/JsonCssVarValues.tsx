import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { 
    Box, 
    Button, 
    IconButton, 
    TextField, 
    Typography, 
    Card,
    CardContent,
    Chip,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface KeyValuePair {
    key: string;
    value: string;
    id: string;
}

type ValueType = 'string' | 'number' | 'boolean' | 'json';

// Helper function to detect value type
const detectValueType = (value: string): ValueType => {
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) return 'json';
    return 'string';
};

// Helper function to format value for display
const formatValueForDisplay = (value: string, maxLength: number = 30): string => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
};

// Inline editable value item component
const ValueItem: React.FC<{
    pair: KeyValuePair;
    onUpdate: (pair: KeyValuePair) => void;
    onDelete: (id: string) => void;
    existingKeys: string[];
}> = ({ pair, onUpdate, onDelete, existingKeys }) => {
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [isEditingValue, setIsEditingValue] = useState(false);
    const [editKey, setEditKey] = useState(pair.key);
    const [editValue, setEditValue] = useState(pair.value);
    const [keyError, setKeyError] = useState('');
    const [valueError, setValueError] = useState('');

    const valueType = detectValueType(pair.value);
    
    // Color coding for different value types
    const getTypeColor = (type: ValueType) => {
        switch (type) {
            case 'string': return '#2196f3'; // Blue
            case 'number': return '#4caf50'; // Green
            case 'boolean': return '#ff9800'; // Orange
            case 'json': return '#9c27b0'; // Purple
            default: return '#757575'; // Grey
        }
    };

    const validateKey = (key: string) => {
        const isDuplicate = existingKeys.some(k => k === key && key !== pair.key);
        setKeyError(isDuplicate ? 'Key already exists' : '');
        return !isDuplicate && key.trim() !== '';
    };

    const validateValue = (value: string, type: ValueType) => {
        let error = '';
        if (type === 'number' && isNaN(Number(value)) && value.trim() !== '') {
            error = 'Invalid number format';
        } else if (type === 'boolean' && !['true', 'false'].includes(value.toLowerCase())) {
            error = 'Boolean must be "true" or "false"';
        } else if (type === 'json') {
            try {
                JSON.parse(value);
            } catch (e) {
                error = 'Invalid JSON format';
            }
        }
        setValueError(error);
        return !error;
    };

    const handleKeySubmit = () => {
        if (validateKey(editKey)) {
            onUpdate({ ...pair, key: editKey });
            setIsEditingKey(false);
        }
    };

    const handleValueSubmit = () => {
        const currentType = detectValueType(editValue);
        if (validateValue(editValue, currentType)) {
            onUpdate({ ...pair, value: editValue });
            setIsEditingValue(false);
        }
    };

    const handleKeyCancel = () => {
        setEditKey(pair.key);
        setKeyError('');
        setIsEditingKey(false);
    };

    const handleValueCancel = () => {
        setEditValue(pair.value);
        setValueError('');
        setIsEditingValue(false);
    };

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                mb: 1,
                //border: `2px solid ${getTypeColor(valueType)}`,
                '&:hover': {
                    boxShadow: 2,
                },
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Key Section */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                            Key
                        </Typography>
                        {isEditingKey ? (
                            <TextField
                                fullWidth
                                size="small"
                                value={editKey}
                                onChange={(e) => {
                                    setEditKey(e.target.value);
                                    validateKey(e.target.value);
                                }}
                                error={!!keyError}
                                helperText={keyError}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleKeySubmit();
                                    if (e.key === 'Escape') handleKeyCancel();
                                }}
                                onBlur={handleKeySubmit}
                                autoFocus
                            />
                        ) : (
                            <Box
                                onClick={() => setIsEditingKey(true)}
                                sx={{
                                    cursor: 'pointer',
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.08)',
                                    },
                                    minHeight: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {pair.key || 'Click to add key'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Value Section */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                                Value
                            </Typography>
                            <Chip
                                label={valueType.toUpperCase()}
                                size="small"
                                sx={{
                                    height: 16,
                                    fontSize: '0.6rem',
                                    backgroundColor: getTypeColor(valueType),
                                    color: '#fff',
                                    '& .MuiChip-label': {
                                        padding: '0 4px',
                                    },
                                }}
                            />
                        </Box>
                        {isEditingValue ? (
                            <TextField
                                fullWidth
                                size="small"
                                value={editValue}
                                onChange={(e) => {
                                    setEditValue(e.target.value);
                                    const currentType = detectValueType(e.target.value);
                                    validateValue(e.target.value, currentType);
                                }}
                                error={!!valueError}
                                helperText={valueError}
                                multiline={valueType === 'json'}
                                rows={valueType === 'json' ? 3 : 1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && valueType !== 'json') {
                                        e.preventDefault();
                                        handleValueSubmit();
                                    }
                                    if (e.key === 'Escape') handleValueCancel();
                                }}
                                onBlur={handleValueSubmit}
                                autoFocus
                            />
                        ) : (
                            <Box
                                onClick={() => setIsEditingValue(true)}
                                sx={{
                                    cursor: 'pointer',
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.08)',
                                    },
                                    minHeight: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all',
                                    }}
                                    title={pair.value} // Show full value on hover
                                >
                                    {formatValueForDisplay(pair.value) || 'Click to add value'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            size="small"
                            onClick={() => onDelete(pair.id)}
                            color="error"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export const JsonEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { attribute } = props;

    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();
    
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    const [pairs, setPairs] = useState<KeyValuePair[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Filter pairs based on search term
    const filteredPairs = useMemo(() => {
        if (!searchTerm.trim()) return pairs;
        
        return pairs.filter(pair => 
            pair.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pair.value.toLowerCase().includes(searchTerm.toLowerCase())
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
                
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [record, attributePath]);
    
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
        const newPair = { key: '', value: '', id: generateId() };
        const updatedPairs = [...pairs, newPair];
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };
    
    const handleUpdatePair = (updatedPair: KeyValuePair) => {
        const updatedPairs = pairs.map(p => p.id === updatedPair.id ? updatedPair : p);
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };

    const handleDeletePair = (id: string) => {
        const updatedPairs = pairs.filter(pair => pair.id !== id);
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };

    const updateFormValue = (currentPairs: KeyValuePair[]) => {
        const obj = currentPairs.reduce((acc, pair) => {
            if (pair.key.trim()) {
                // Parse value based on detected type
                const valueType = detectValueType(pair.value);
                let parsedValue: any = pair.value;
                
                try {
                    switch (valueType) {
                        case 'number':
                            parsedValue = Number(pair.value);
                            break;
                        case 'boolean':
                            parsedValue = pair.value.toLowerCase() === 'true';
                            break;
                        case 'json':
                            parsedValue
                            parsedValue = JSON.parse(pair.value);
                            break;
                        case 'string':
                        default:
                            parsedValue = pair.value;
                            break;
                    }
                } catch (e) {
                    // If parsing fails, use string value
                    parsedValue = pair.value;
                }
                
                acc[pair.key] = parsedValue;
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

    // Show loading state while component is initializing
    if (isLoading) {
        return (
            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="textSecondary">
                    Loading values...
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Key-Value Pairs'}
            </Typography>

            {/* Header Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Button 
                    startIcon={<AddIcon />} 
                    variant="outlined" 
                    size="small" 
                    onClick={addPair}
                >
                    Add Pair
                </Button>
            </Box>

            {/* Search Control */}
            {pairs.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by key or value..."
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
                </Box>
            )}

            {/* Results count when filtering */}
            {searchTerm && (
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label={`${filteredPairs.length} of ${pairs.length} pairs`}
                        size="small"
                        variant="outlined"
                        onDelete={handleClearSearch}
                    />
                </Box>
            )}

            {/* Values List */}
            <Box sx={{ mb: 2 }}>
                {filteredPairs.map((pair) => (
                    <ValueItem
                        key={pair.id}
                        pair={pair}
                        onUpdate={handleUpdatePair}
                        onDelete={handleDeletePair}
                        existingKeys={pairs.map(p => p.key)}
                    />
                ))}
            </Box>

            {/* Show message when no results found */}
            {searchTerm && filteredPairs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No pairs found matching your search
                    </Typography>
                    <Button size="small" onClick={handleClearSearch} sx={{ mt: 1 }}>
                        Clear search
                    </Button>
                </Box>
            )}

            {/* Show message when no values exist */}
            {pairs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        No key-value pairs configured yet
                    </Typography>
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        onClick={addPair}
                    >
                        Add Your First Pair
                    </Button>
                </Box>
            )}
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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [displayValue, setDisplayValue] = useState<Record<string, any>>({});

    // Convert displayValue to pairs for filtering
    const displayPairs = useMemo(() => {
        return Object.entries(displayValue).map(([key, value]) => ({
            key,
            value: String(value),
            id: key
        }));
    }, [displayValue]);

     // Initial data loading effect
    useEffect(() => {
        const loadViewData = async () => {
            setIsLoading(true);
            
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
                
            } catch (error) {
                console.error('Error loading view data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadViewData();
    }, [record, attributePath, attribute, isNestedSetting, settingsPath]);
    
    // Filter display values based on search term
    const filteredDisplayValue = useMemo(() => {
        if (!searchTerm.trim()) return displayValue;
        
        return Object.entries(displayValue)
            .filter(([key, value]) => 
                key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, any>);
    }, [displayValue, searchTerm]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Show loading state while component is initializing
    if (isLoading) {
        return (
            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="textSecondary">
                    Loading values...
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Key-Value Pairs'}
            </Typography>

            {Object.keys(displayValue).length > 0 && (
                <>
                    {/* Search Control for View Mode */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by key or value..."
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
                    </Box>

                    {/* Results count when filtering */}
                    {searchTerm && (
                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={`${Object.keys(filteredDisplayValue).length} of ${Object.keys(displayValue).length} pairs`}
                                size="small"
                                variant="outlined"
                                onDelete={handleClearSearch}
                            />
                        </Box>
                    )}

                    {Object.keys(filteredDisplayValue).length > 0 ? (
                        <Box sx={{ mb: 2 }}>
                            {Object.entries(filteredDisplayValue).map(([key, value]) => {
                                const valueType = detectValueType(String(value));
                                
                                // Color coding for different value types
                                const getTypeColor = (type: ValueType) => {
                                    switch (type) {
                                        case 'string': return '#2196f3'; // Blue
                                        case 'number': return '#4caf50'; // Green
                                        case 'boolean': return '#ff9800'; // Orange
                                        case 'json': return '#9c27b0'; // Purple
                                        default: return '#757575'; // Grey
                                    }
                                };
                                
                                return (
                                    <Card 
                                        key={key}
                                        variant="outlined" 
                                        sx={{ 
                                            mb: 1,
                                            border: `2px solid ${getTypeColor(valueType)}`,
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                {/* Key Section */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                                                        Key
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 1,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            minHeight: 24,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                wordBreak: 'break-all',
                                                            }}
                                                        >
                                                            {key}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Value Section */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            Value
                                                        </Typography>
                                                        <Chip
                                                            label={valueType.toUpperCase()}
                                                            size="small"
                                                            sx={{
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                backgroundColor: getTypeColor(valueType),
                                                                color: '#fff',
                                                                '& .MuiChip-label': {
                                                                    padding: '0 4px',
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 1,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            minHeight: 24,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                wordBreak: 'break-all',
                                                            }}
                                                            title={String(value)} // Show full value on hover
                                                        >
                                                            {formatValueForDisplay(String(value))}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="textSecondary">
                                No pairs found matching your search
                            </Typography>
                            <Button size="small" onClick={handleClearSearch} sx={{ mt: 1 }}>
                                Clear search
                            </Button>
                        </Box>
                    )}
                </>
            )}

            {Object.keys(displayValue).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No key-value pairs configured
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

const JsonCssVarValues = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const [componentLoading, setComponentLoading] = useState(true);

    // Set a small timeout to allow component to initialize
    useEffect(() => {
        const timer = setTimeout(() => {
            setComponentLoading(false);
        }, 50);

        return () => {
            clearTimeout(timer);
        };
    }, [
    ]);

    // Show initial loading state
    if (componentLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                <Typography variant="body2" color="textSecondary">
                    Initializing key-value editor...
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

export default JsonCssVarValues;
