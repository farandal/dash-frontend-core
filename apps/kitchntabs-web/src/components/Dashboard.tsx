/**
 * Dashboard Component
 * 
 * This component renders at the root path ("/") for authenticated users.
 * Pass this to KitchnTabsWebPrivateApp's `dashboard` prop to prevent
 * react-admin from redirecting "/" to the first resource.
 */
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuthenticated, useTranslate } from 'react-admin';


const Dashboard: React.FC = () => {
    // Ensure user is authenticated
    useAuthenticated();
    const translate = useTranslate();

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {translate('dashboard.title')}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    {translate('dashboard.welcome')}
                </Typography>
            </Paper>


        


        </Box>
    );
};

export default Dashboard;
