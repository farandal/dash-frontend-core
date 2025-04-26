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
    Paper 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';

interface KeyValuePair {
    key: string;
    value: string;
    id: string; // For React key prop
}

export const JsonEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method, attribute, resourceConfig } = props;
    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();
    
    // Extract the nested path from the attribute
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    // State for key-value pairs
    const [pairs, setPairs] = useState<KeyValuePair[]>([]);
    const [keyError, setKeyError] = useState<{[key: string]: string}>({});
    
    // Initialize the component with the current value
    useEffect(() => {
        let initialValue: Record<string, any> = {};
        
        if (isNestedSetting && record?.settings) {
            // For nested settings, get from record.settings
            const settings = record.settings || {};
            initialValue = getNestedValue(settings, settingsPath) || {};
        } else if (record?.[attributePath]) {
            // For direct attributes
            initialValue = record[attributePath] || {};
        }
        
        // Convert object to array of key-value pairs
        const initialPairs = Object.entries(initialValue).map(([key, value]) => ({
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            id: generateId()
        }));
        
        setPairs(initialPairs);
    }, [record, attributePath]);
    
    // Helper function to get a nested value from an object
    const getNestedValue = (obj: any, path: string): any => {
        if (!path) return obj;
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : {}), obj);
    };
    
    // Helper function to set a nested value in an object
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
    
    // Generate a unique ID for React keys
    const generateId = (): string => {
        return Math.random().toString(36).substring(2, 11);
    };
    
    // Add a new empty key-value pair
    const addPair = () => {
        setPairs([...pairs, { key: '', value: '', id: generateId() }]);
    };
    
    // Remove a key-value pair
    const removePair = (id: string) => {
        setPairs(pairs.filter(pair => pair.id !== id));
        updateFormValue(pairs.filter(pair => pair.id !== id));
    };
    
    // Handle key change
    const handleKeyChange = (id: string, newKey: string) => {
        // Check for duplicate keys
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
    
    // Handle value change
    const handleValueChange = (id: string, newValue: string) => {
        const updatedPairs = pairs.map(pair => 
            pair.id === id ? { ...pair, value: newValue } : pair
        );
        
        setPairs(updatedPairs);
        updateFormValue(updatedPairs);
    };
    
    // Update the form value
    const updateFormValue = (currentPairs: KeyValuePair[]) => {
        // Convert array of pairs to object
        const obj = currentPairs.reduce((acc, pair) => {
            if (pair.key.trim()) {
                let parsedValue: any = pair.value;
                
                // Try to parse JSON values
                try {
                    if (pair.value.trim().startsWith('{') || 
                        pair.value.trim().startsWith('[') ||
                        pair.value.trim() === 'true' ||
                        pair.value.trim() === 'false' ||
                        !isNaN(Number(pair.value.trim()))) {
                        parsedValue = JSON.parse(pair.value);
                    }
                } catch (e) {
                    // If parsing fails, use the string value
                }
                
                acc[pair.key] = parsedValue;
            }
            return acc;
        }, {} as Record<string, any>);
        
        // Update the form
        if (isNestedSetting) {
            const currentSettings = getValues('settings') || {};
            const updatedSettings = setNestedValue({...currentSettings}, settingsPath, obj);
            setValue('settings', updatedSettings, { shouldDirty: true });
        } else {
            setValue(attributePath, obj, { shouldDirty: true });
        }
    };
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Settings Editor'}
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width="40%">Key</TableCell>
                            <TableCell width="50%">Value</TableCell>
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
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={pair.value}
                                        onChange={(e) => handleValueChange(pair.id, e.target.value)}
                                    />
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
                +
            </Button>
            
            
        </Box>
    );
};

export const JsonView: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { attribute } = props;
    const record = useRecordContext();
    
    // Extract the nested path from the attribute
    const attributePath = attribute.attribute;
    const isNestedSetting = attributePath.startsWith('settings.');
    const settingsPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;
    
    // Get the value to display
    let displayValue: Record<string, any> = {};
    
    if (isNestedSetting && record?.settings) {
        // For nested settings
        const settings = record.settings || {};
        if (settingsPath) {
            const keys = settingsPath.split('.');
            displayValue = keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : {}), settings);
        } else {
            displayValue = settings;
        }
    } else if (record?.[attributePath]) {
        // For direct attributes
        displayValue = record[attributePath];
    }
    
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {attribute.label || 'Settings'}
            </Typography>
            
            {Object.keys(displayValue).length > 0 ? (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width="40%">Key</TableCell>
                                <TableCell width="60%">Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(displayValue).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>
                                        {typeof value === 'object' 
                                            ? JSON.stringify(value) 
                                            : String(value)
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No settings configured
                </Typography>
            )}
        </Box>
    );
};

const Json = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
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

export default Json;
