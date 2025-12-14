import React, { lazy, Suspense } from 'react';
import { QrCode } from '@mui/icons-material';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { CircularProgress, Box } from '@mui/material';

// Lazy load the QR Generator to reduce initial bundle size
const MallQRGenerator = lazy(() => import('./components/MallQRGenerator'));

// Wrapper component for lazy-loaded QR Generator
const LazyMallQRGenerator = () => (
    <Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
        </Box>
    }>
        <MallQRGenerator />
    </Suspense>
);

const MallAppResources: IDashAutoAdminResourceConfig[] = [
    {
        group: "Mall",
        roles: ["*"],
        component: ResourceTemplate,
        model: "qr",
        redirect: "/qr",
        label: "Ordena Aquí!",
        schema: [],
        icon: <QrCode />,
        listComponent: LazyMallQRGenerator,
        toolbarCreateButton: { enabled: false },
        view: false,
        create: false,
        edit: false,
    },
];

export default MallAppResources;
