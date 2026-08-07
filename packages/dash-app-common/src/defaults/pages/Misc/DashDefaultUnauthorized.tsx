/**
 * Default Unauthorized Page (403)
 * 
 * Page displayed when a user lacks permission to access a resource.
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
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';

interface DefaultUnauthorizedProps {
    title?: string;
    message?: string;
    showHomeButton?: boolean;
    showBackButton?: boolean;
    showLoginButton?: boolean;
    isLoggedIn?: boolean;
}

const DefaultUnauthorized: React.FC<DefaultUnauthorizedProps> = ({
    title = 'Access Denied',
    message = 'You do not have permission to access this page.',
    showHomeButton = true,
    showBackButton = true,
    showLoginButton = true,
    isLoggedIn = false,
}) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoLogin = () => {
        navigate('/login');
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
                <LockIcon 
                    color="error" 
                    sx={{ fontSize: 100, mb: 3 }} 
                />
                
                <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    403
                </Typography>
                
                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>
                
                <Typography variant="body1" color="textSecondary" sx={{
                    marginBottom: "16px"
                }}>
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
                    
                    {showLoginButton && !isLoggedIn && (
                        <Button 
                            variant="outlined" 
                            color="primary"
                            startIcon={<LoginIcon />}
                            onClick={handleGoLogin}
                        >
                            Login
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default DefaultUnauthorized;
