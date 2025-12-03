/**
 * Default Not Found Page (404)
 * 
 * Page displayed when a route is not found.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    Container,
    Paper
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface DefaultNotFoundProps {
    title?: string;
    message?: string;
    showHomeButton?: boolean;
    showBackButton?: boolean;
}

const DefaultNotFound: React.FC<DefaultNotFoundProps> = ({
    title = 'Page Not Found',
    message = 'The page you are looking for does not exist or has been moved.',
    showHomeButton = true,
    showBackButton = true,
}) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="sm">
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    mt: 8
                }}
            >
                <ErrorOutlineIcon 
                    color="warning" 
                    sx={{ fontSize: 100, mb: 3 }} 
                />
                
                <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    404
                </Typography>
                
                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>
                
                <Typography variant="body1" color="textSecondary" paragraph>
                    {message}
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {showBackButton && (
                        <Button 
                            variant="outlined" 
                            startIcon={<ArrowBackIcon />}
                            onClick={handleGoBack}
                        >
                            Go Back
                        </Button>
                    )}
                    
                    {showHomeButton && (
                        <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<HomeIcon />}
                            onClick={handleGoHome}
                        >
                            Go to Home
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default DefaultNotFound;
