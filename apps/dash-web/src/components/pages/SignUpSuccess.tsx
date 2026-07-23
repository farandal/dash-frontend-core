import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslate } from '../hooks/usePolyglotTranslation';

const SignUpSuccess = (props) => {
    const translate = useTranslate();
    const location = useLocation();
    const navigate = useNavigate();
    const { email, planName } = location.state || {};

    const displayPlanName = planName || translate('signup.success.defaultPlanName', { defaultValue: 'Trial' });

    return (
        <Box className='dash-signup-success'>
            <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="60vh"
                textAlign="center"
            >
                <Card sx={{ maxWidth: 500, width: '100%', mt: 30, mb: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <CheckCircleIcon 
                            sx={{ fontSize: 64, color: 'success.main', mb: 2 }} 
                        />
                        
                        <Typography variant="h4" gutterBottom color="success.main">
                            {translate('signup.success.title')}
                        </Typography>
                        
                        <Typography variant="body1" paragraph>
                            {translate('signup.success.welcome', { planName: displayPlanName })}
                        </Typography>

                        {email && (
                            <Alert 
                                severity="info" 
                                icon={<EmailIcon />}
                                sx={{ mb: 3, textAlign: 'left' }}
                            >
                                <Typography variant="body2">
                                    {translate('signup.success.verificationSent', { email: email })}
                                </Typography>
                            </Alert>
                        )}

                        <Typography variant="body2" color="textSecondary" paragraph>
                            {translate('signup.success.description')}
                        </Typography>

                        <Box mt={3}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{ mr: 2 }}
                            >
                                {translate('signup.success.loginButton')}
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/')}
                            >
                                {translate('signup.success.home_button')}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default SignUpSuccess;
