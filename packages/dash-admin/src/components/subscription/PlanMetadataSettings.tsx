import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect } from "react";
import { useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * PlanMetadataSettings Component
 * 
 * A component for managing subscription plan metadata as key-value pairs.
 * Metadata can store additional configuration or data for a plan.
 */

interface SubscriptionPlan {
    id?: number;
    name?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
}

interface KeyValuePair {
    key: string;
    value: string;
}

/**
 * View mode - Display metadata as a table
 */
const PlanMetadataView: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: SubscriptionPlan = useRecordContext();
    const metadata = record?.metadata || {};
    const entries = Object.entries(metadata);

    if (!entries.length) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No metadata configured
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Key</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

/**
 * List mode - Display metadata count
 */
const PlanMetadataList: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: SubscriptionPlan = useRecordContext();
    const metadata = record?.metadata || {};
    const count = Object.keys(metadata).length;

    if (!count) {
        return <Typography variant="body2" color="text.secondary">—</Typography>;
    }

    return (
        <Typography variant="body2">
            {count} {count === 1 ? 'entry' : 'entries'}
        </Typography>
    );
};

/**
 * Edit/Create mode - Allow adding/editing/removing metadata entries
 */
const PlanMetadataEdit: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: SubscriptionPlan = useRecordContext();
    const { setValue, watch } = useFormContext();
    
    const [pairs, setPairs] = useState<KeyValuePair[]>([]);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [keyError, setKeyError] = useState("");

    // Watch the metadata field for changes
    const watchedMetadata = watch("metadata");

    // Initialize from record or watched value
    useEffect(() => {
        const initialMetadata = watchedMetadata || record?.metadata || {};
        const initialPairs = Object.entries(initialMetadata).map(([key, value]) => ({
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        }));
        setPairs(initialPairs);
    }, [record, watchedMetadata]);

    // Convert pairs to object and update form
    const updateMetadata = (newPairs: KeyValuePair[]) => {
        setPairs(newPairs);
        const metadataObj: Record<string, any> = {};
        newPairs.forEach(({ key, value }) => {
            // Try to parse JSON values
            try {
                metadataObj[key] = JSON.parse(value);
            } catch {
                metadataObj[key] = value;
            }
        });
        setValue("metadata", metadataObj, { shouldDirty: true });
    };

    const handleAddPair = () => {
        const trimmedKey = newKey.trim();
        const trimmedValue = newValue.trim();

        if (!trimmedKey) {
            setKeyError("Key is required");
            return;
        }

        if (pairs.some(p => p.key === trimmedKey)) {
            setKeyError("Key already exists");
            return;
        }

        setKeyError("");
        updateMetadata([...pairs, { key: trimmedKey, value: trimmedValue }]);
        setNewKey("");
        setNewValue("");
    };

    const handleRemovePair = (keyToRemove: string) => {
        updateMetadata(pairs.filter(p => p.key !== keyToRemove));
    };

    const handleUpdateValue = (key: string, newVal: string) => {
        updateMetadata(pairs.map(p => p.key === key ? { ...p, value: newVal } : p));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddPair();
        }
    };

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Plan Metadata
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Add key-value pairs for additional plan configuration
            </Typography>

            {/* Add new pair input */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="flex-start">
                <TextField
                    value={newKey}
                    onChange={(e) => {
                        setNewKey(e.target.value);
                        setKeyError("");
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Key"
                    size="small"
                    error={!!keyError}
                    helperText={keyError}
                    sx={{ flex: 1 }}
                />
                <TextField
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Value"
                    size="small"
                    sx={{ flex: 2 }}
                />
                <IconButton 
                    onClick={handleAddPair} 
                    color="primary"
                    disabled={!newKey.trim()}
                >
                    <AddIcon />
                </IconButton>
            </Stack>

            {/* Display current pairs */}
            {pairs.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width="30%"><strong>Key</strong></TableCell>
                                <TableCell><strong>Value</strong></TableCell>
                                <TableCell width="50px"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pairs.map(({ key, value }) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>
                                        <TextField
                                            value={value}
                                            onChange={(e) => handleUpdateValue(key, e.target.value)}
                                            size="small"
                                            fullWidth
                                            variant="standard"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleRemovePair(key)}
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
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No metadata added yet
                </Typography>
            )}
        </Box>
    );
};

/**
 * Main PlanMetadataSettings component
 */
const PlanMetadataSettings: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
    method, 
    attribute, 
    resourceConfig 
}) => {
    switch (method) {
        case "edit":
        case "create":
            return <PlanMetadataEdit method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        case "view":
            return <PlanMetadataView method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        case "list":
            return <PlanMetadataList method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default PlanMetadataSettings;
