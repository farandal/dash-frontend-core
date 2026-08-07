import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useRecordContext, useInput } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    const { field } = useInput({ source: 'features' });
    const [newFeature, setNewFeature] = useState('');
    const [features, setFeatures] = useState<string[]>(record?.features || []);

    const handleAddFeature = () => {
        if (newFeature.trim() && !features.includes(newFeature.trim())) {
            const updatedFeatures = [...features, newFeature.trim()];
            setFeatures(updatedFeatures);
            field.onChange(updatedFeatures);
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (featureToRemove: string) => {
        const updatedFeatures = features.filter(feature => feature !== featureToRemove);
        setFeatures(updatedFeatures);
        field.onChange(updatedFeatures);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddFeature();
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Características del Plan
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2
                }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Nueva característica"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: Acceso ilimitado, Soporte 24/7"
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddFeature}
                    disabled={!newFeature.trim()}
                >
                    Agregar
                </Button>
            </Box>

            {features.length > 0 ? (
                <Paper variant="outlined">
                    <List dense>
                        {features.map((feature, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={feature} />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() => handleRemoveFeature(feature)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ) : (
                <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                    No hay características definidas para este plan
                </Typography>
            )}

            <Box sx={{
                mt: 2
            }}>
                <Typography variant="body2" color="textSecondary">
                    Las características se mostrarán a los usuarios al seleccionar este plan de suscripción.
                </Typography>
            </Box>
        </Box>
    );
};

const ViewComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    const features = record?.features || [];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Características del Plan
            </Typography>
            
            {features.length > 0 ? (
                <Paper variant="outlined">
                    <List dense>
                        {features.map((feature: string, index: number) => (
                            <ListItem key={index}>
                                <ListItemText primary={feature} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ) : (
                <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                    No hay características definidas para este plan
                </Typography>
            )}
        </Box>
    );
};

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    return <>{record?.features?.length || 0} características</>;
};

const SubscriptionPlanFeatures = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <EditComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "view":
            return <ViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return <></>;
    }
};

export default SubscriptionPlanFeatures;