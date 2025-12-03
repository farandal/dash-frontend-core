/**
 * Default Server Error Page (500)
 * 
 * Page displayed when a server error occurs.
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
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

interface DefaultServerErrorProps {
    title?: string;
    message?: string;
    showHomeButton?: boolean;
    showRetryButton?: boolean;
    onRetry?: () => void;
}

const DefaultServerError: React.FC<DefaultServerErrorProps> = ({
    title = 'Server Error',
    message = 'Something went wrong on our end. Please try again later.',
    showHomeButton = true,
    showRetryButton = true,
    onRetry,
}) => {
    const navigate = useNavigate();

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
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
                <ReportProblemIcon 
                    color="error" 
                    sx={{ fontSize: 100, mb: 3 }} 
                />
                
                <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    500
                </Typography>
                
                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>
                
                <Typography variant="body1" color="textSecondary" paragraph>
                    {message}
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {showRetryButton && (
                        <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={handleRetry}
                        >
                            Try Again
                        </Button>
                    )}
                    
                    {showHomeButton && (
                        <Button 
                            variant="outlined"
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

export default DefaultServerError;
