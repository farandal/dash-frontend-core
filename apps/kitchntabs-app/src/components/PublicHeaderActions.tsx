import React, {  } from 'react';
import { PropsWithChildren } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from './hooks/usePolyglotTranslation';

const PublicHeaderActions: React.FC<PropsWithChildren> = (props) => {
    
    const translate = useTranslate();
    const navigate = useNavigate();
    
    // Only keep header actions here, notifications are handled by NotificationsCenter
    // Temporarily removed, because look&feel reasons, and because the login is at Home now. 
    return <></>
    return  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button onClick={() => navigate('/login')}>{translate('common.login')}</Button>
            </Box>
};

export default PublicHeaderActions; 