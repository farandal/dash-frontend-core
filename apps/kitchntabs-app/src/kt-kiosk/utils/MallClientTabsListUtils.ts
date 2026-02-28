// Utility functions and constants for MallClientTabsList

import { styled } from '@mui/material/styles';
import { LinearProgress, linearProgressClasses } from '@mui/material';

// Status order for progress calculation (0-100%)
export const STATUS_ORDER = ['CREATED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARED', 'DELIVERED', 'CLOSED'];
export const STATUS_PROGRESS: Record<string, number> = {
    'CREATED': 10,
    'CONFIRMED': 25,
    'IN_PREPARATION': 50,
    'PREPARED': 75,
    'DELIVERED': 90,
    'CLOSED': 100,
    'CANCELLED': 0
};

// Get progress bar color based on status
export const getProgressColor = (status: string): "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit" => {
    switch (status) {
        case 'CREATED': return 'inherit';
        case 'CONFIRMED': return 'primary';
        case 'IN_PREPARATION': return 'warning';
        case 'PREPARED': return 'info';
        case 'DELIVERED': return 'success';
        case 'CLOSED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'primary';
    }
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'CREATED': return 'default';
        case 'CONFIRMED': return 'primary';
        case 'IN_PREPARATION': return 'warning';
        case 'PREPARED': return 'info';
        case 'DELIVERED': return 'success';
        case 'CLOSED': return 'secondary';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

// Status labels for localization
export const STATUS_LABELS: Record<string, string> = {
    'CREATED': 'Creado',
    'CONFIRMED': 'Confirmado',
    'IN_PREPARATION': 'En preparación',
    'PREPARED': 'Preparado',
    'DELIVERED': 'Entregado',
    'CLOSED': 'Cerrado',
    'CANCELLED': 'Cancelado'
};

// Thin progress bar styled component
export const ThinProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 3,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
}));