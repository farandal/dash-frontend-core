/**
 * Default SignUp Success Page
 * 
 * Success page displayed after successful registration.
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Container 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EmailIcon from '@mui/icons-material/Email';

import FullLayoutMarkup from 'dash-admin/src/default-theme/FullLayoutMarkup';

interface SignUpSuccessState {
    email?: string;
    planName?: string;
}

interface DefaultSignUpSuccessPageProps {
    panelSettings?: {
        horizontalLogo?: string;
        loginBackground?: string;
    };
}

const DefaultSignUpSuccessPage: React.FC<DefaultSignUpSuccessPageProps> = (props) => {
    const { panelSettings } = props;
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as SignUpSuccessState;

    return (
        <FullLayoutMarkup 
            className='dash-signup-success' 
            logo={panelSettings?.horizontalLogo} 
            loginBackground={panelSettings?.loginBackground}
        >
            <Container maxWidth="sm">
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        borderRadius: 2
                    }}
                >
                    <CheckCircleOutlineIcon 
                        color="success" 
                        sx={{ fontSize: 80, mb: 2 }} 
                    />
                    
                    <Typography variant="h4" component="h1" gutterBottom>
                        Account Created Successfully!
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" sx={{
                        marginBottom: "16px"
                    }}>
                        Thank you for signing up{state?.planName ? ` for the ${state.planName} plan` : ''}.
                    </Typography>

                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: 'info.light',
                            borderRadius: 1,
                            p: 2,
                            my: 3
                        }}
                    >
                        <EmailIcon sx={{ mr: 1, color: 'info.dark' }} />
                        <Typography variant="body2" sx={{
                            color: "info.dark"
                        }}>
                            We've sent a verification email to <strong>{state?.email || 'your email address'}</strong>.
                            Please check your inbox and verify your email to complete the registration.
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{
                        marginBottom: "16px"
                    }}>
                        If you don't see the email, please check your spam folder or request a new verification email.
                    </Typography>

                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large"
                            onClick={() => navigate('/login')}
                            fullWidth
                        >
                            Go to Login
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/')}
                            fullWidth
                        >
                            Back to Home
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </FullLayoutMarkup>
    );
};

export default DefaultSignUpSuccessPage;
