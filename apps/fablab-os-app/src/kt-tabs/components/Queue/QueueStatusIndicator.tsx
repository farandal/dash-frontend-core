import React from 'react';
import { Chip, CircularProgress, Box } from '@mui/material';
import QueueIcon from '@mui/icons-material/Queue';

interface QueueStatusIndicatorProps {
  queueSize: number;
  isProcessing: boolean;
}

const QueueStatusIndicator: React.FC<QueueStatusIndicatorProps> = ({ 
  queueSize, 
  isProcessing 
}) => {
  if (!isProcessing) return null;
  
  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 16, 
      right: 16, 
      zIndex: 1500,
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
      <Chip
        icon={<QueueIcon />}
        label={`Processing ${queueSize} operation(s)`}
        color="primary"
        sx={{ fontWeight: 'bold' }}
      />
      <CircularProgress size={24} />
    </Box>
  );
};

export default QueueStatusIndicator;