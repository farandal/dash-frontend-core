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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { ChromePicker } from 'react-color';
import { useState, useEffect } from 'react';

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

    
    
    useEffect(() => {
        let initialValue: Record<string, any> = {};
        let defaultValues: Record<string, any> = {};
     
        try {
            defaultValues = JSON.parse(attribute?.metadata?.default_value  || '{}');
           
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
        setPairs([...pairs, { key: '', value: '#000000', id: generateId() }]);
    };
    
    const removePair = (id: string) => {
        setPairs(pairs.filter(pair => pair.id !== id));
        updateFormValue(pairs.filter(pair => pair.id !== id));
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
    
    const handleColorChange = (id: string, newColor: string) => {
        const updatedPairs = pairs.map(pair => 
            pair.id === id ? { ...pair, value: newColor } : pair
        );
        
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };

    const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setColorPickerAnchor(event.currentTarget);
        setSelectedPairId(id);
    };

    const handleColorPickerClose = () => {
        setColorPickerAnchor(null);
        setSelectedPairId(null);
    };
    
    const updateDomColors = (colors) => {
        Object.entries(colors).forEach(([key, value]) => {
            console.log(`--${key}`, String(value))
            document.documentElement.style.setProperty(`--${key}`, String(value));
        });
    }

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
            
            updateDomColors(updatedSettings.colors)
            
            setValue('settings', updatedSettings, { shouldDirty: true });
        } else {
            setValue(attributePath, obj, { shouldDirty: true });
        }
    };
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Color Settings'}
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width="40%">Key</TableCell>
                            <TableCell width="50%">Color</TableCell>
                            <TableCell width="10%" align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pairs.map((pair) => (
                            <TableRow key={pair.id}>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={pair.key}
                                        onChange={(e) => handleKeyChange(pair.id, e.target.value)}
                                        error={!!keyError[pair.id]}
                                        helperText={keyError[pair.id]}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 1,
                                                border: '2px solid #ccc',
                                                backgroundColor: pair.value
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={pair.value}
                                            InputProps={{ 
                                                readOnly: true,
                                                sx: { 
                                                    backgroundColor: pair.value,
                                                    '& input': {
                                                        color: getContrastColor(pair.value),
                                                    }
                                                }
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleColorPickerOpen(e, pair.id)}
                                        >
                                            <ColorLensIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => removePair(pair.id)}
                                        color="error"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                size="small" 
                onClick={addPair}
            >
                Add Color
            </Button>

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
    
    let displayValue: Record<string, any> = {};
    let defaultValues: Record<string, any> = {};

    try {
        defaultValues = JSON.parse(default_value || '{}');
    } catch (e) {
        defaultValues = {};
    }
    
    if (isNestedSetting && record?.settings) {
        const settings = record.settings || {};
        if (settingsPath) {
            const keys = settingsPath.split('.');
            displayValue = { ...defaultValues, ...keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : {}), settings) };
        } else {
            displayValue = { ...defaultValues, ...settings };
        }
    } else if (record?.[attributePath]) {
        displayValue = { ...defaultValues, ...record[attributePath] };
    } else {
        displayValue = defaultValues;
    }
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Color Settings'}
            </Typography>
            
            {Object.keys(displayValue).length > 0 ? (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width="40%">Key</TableCell>
                                <TableCell width="60%">Color</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(displayValue).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 1,
                                                    border: '2px solid #ccc',
                                                    backgroundColor: value as string
                                                }}
                                            />
                                            {String(value)}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No colors configured
                </Typography>
            )}
        </Box>
    );
};

const JsonColorSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case 'edit':
            return <><JsonEdit attribute={attribute} method={method} resourceConfig={resourceConfig}  /></>;
        case 'create':
            return <JsonEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case 'view':
            return <JsonView attribute={attribute} method={method} resourceConfig={resourceConfig}  />;
        default:
            return null;
    }
};

export default JsonColorSelector;