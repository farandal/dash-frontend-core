import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

interface Props {
    
}

const DashLanding: React.FC<Props> = () => {
  

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome to DASH
            </Typography>
            
        </Box>
    );
};

export default DashLanding;