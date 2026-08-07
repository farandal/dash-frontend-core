import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect } from "react";
import { useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import {
    Box,
    Chip,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * PlanFeaturesSettings Component
 * 
 * A component for managing subscription plan features as an array of strings.
 * Features represent capabilities or modules that are enabled for a plan.
 */

interface SubscriptionPlan {
    id?: number;
    name?: string;
    features?: string[];
    [key: string]: any;
}

/**
 * View mode - Display features as a list
 */
const PlanFeaturesView: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: SubscriptionPlan = useRecordContext();
    const features = record?.features || [];

    if (!features.length) {
        return (
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    py: 2
                }}>No features configured
                            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableBody>
                    {features.map((feature, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Chip 
                                    label={feature} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

/**
 * List mode - Display features as chips
 */
const PlanFeaturesList: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: SubscriptionPlan = useRecordContext();
    const features = record?.features || [];

    if (!features.length) {
        return (
            <Typography variant="body2" sx={{
                color: "text.secondary"
            }}>—</Typography>
        );
    }

    return (
        <Stack direction="row" spacing={0.5} useFlexGap sx={{
            flexWrap: "wrap"
        }}>
            {features.slice(0, 3).map((feature, index) => (
                <Chip 
                    key={index} 
                    label={feature} 
                    size="small" 
                    variant="outlined" 
                />
            ))}
            {features.length > 3 && (
                <Chip 
                    label={`+${features.length - 3}`} 
                    size="small" 
                    color="default" 
                />
            )}
        </Stack>
    );
};

/**
 * Edit/Create mode - Allow adding/removing features
 */
const PlanFeaturesEdit: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: SubscriptionPlan = useRecordContext();
    const { setValue, watch } = useFormContext();
    
    const [newFeature, setNewFeature] = useState("");
    const [features, setFeatures] = useState<string[]>([]);

    // Watch the features field for changes
    const watchedFeatures = watch("features");

    // Initialize features from record or watched value
    useEffect(() => {
        const initialFeatures = watchedFeatures || record?.features || [];
        setFeatures(Array.isArray(initialFeatures) ? initialFeatures : []);
    }, [record, watchedFeatures]);

    // Update form when features change
    const updateFeatures = (newFeatures: string[]) => {
        setFeatures(newFeatures);
        setValue("features", newFeatures, { shouldDirty: true });
    };

    const handleAddFeature = () => {
        const trimmedFeature = newFeature.trim();
        if (trimmedFeature && !features.includes(trimmedFeature)) {
            updateFeatures([...features, trimmedFeature]);
            setNewFeature("");
        }
    };

    const handleRemoveFeature = (featureToRemove: string) => {
        updateFeatures(features.filter(f => f !== featureToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddFeature();
        }
    };

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Plan Features
            </Typography>
            <Typography
                variant="caption"
                sx={{
                    color: "text.secondary",
                    display: "block",
                    mb: 2
                }}>
                Add feature keys that are enabled for this plan (e.g., "api_access", "custom_branding")
            </Typography>

            {/* Add new feature input */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter feature key..."
                    size="small"
                    fullWidth
                />
                <IconButton 
                    onClick={handleAddFeature} 
                    color="primary"
                    disabled={!newFeature.trim()}
                >
                    <AddIcon />
                </IconButton>
            </Stack>

            {/* Display current features */}
            {features.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 1 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{
                        flexWrap: "wrap"
                    }}>
                        {features.map((feature, index) => (
                            <Chip
                                key={index}
                                label={feature}
                                onDelete={() => handleRemoveFeature(feature)}
                                deleteIcon={<DeleteIcon />}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                </Paper>
            ) : (
                <Typography variant="body2" sx={{
                    color: "text.secondary"
                }}>
                    No features added yet
                </Typography>
            )}
        </Box>
    );
};

/**
 * Main PlanFeaturesSettings component
 */
const PlanFeaturesSettings: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
    method, 
    attribute, 
    resourceConfig 
}) => {
    switch (method) {
        case "edit":
        case "create":
            return <PlanFeaturesEdit method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        case "view":
            return <PlanFeaturesView method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        case "list":
            return <PlanFeaturesList method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default PlanFeaturesSettings;
