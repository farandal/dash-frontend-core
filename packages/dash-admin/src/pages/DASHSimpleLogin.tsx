import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
    Button as LoadingButton,
    Link,
    IconButton,
    InputAdornment,
    TextField,
    Box,
    Card,
    CardContent
} from '@mui/material';
import { useNavigate } from 'react-router';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

// TODO: These sound assets need to be made available from kt-pages or passed as props
// import successSource from '@app/assets/sounds/success.mp3';
// import errorSource from '@app/assets/sounds/error.mp3';
const successSource = '';
const errorSource = '';

import {DASHAppConstants} from 'dash-constants';
import DASHAuthenticationService from '../contexts/auth/DASHAuthenticationService';

interface DASHLightWeightLoginProps {
    [key: string]: any;
}

const DASHLightWeightLogin: React.FC<DASHLightWeightLoginProps> = (props) => {
    
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const validateEmail = (value) => {
        return EMAIL_REGEX.test(value);
    };

    const form = useForm();
    const navigate = useNavigate();
    const [loginLoading, setLoginLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    // Custom notification function
    const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Temporary fallback
        if (type === 'error') {
            alert(message);
        }
    };

    async function onSubmit(data, _e) {
        const password = data.password;
        setLoginLoading(true);
        
        try {
            console.log('Attempting login with DASHAuthenticationService...');
            
            // Use DASHAuthenticationService for login
            const loginResponse = await DASHAuthenticationService.login({
                username: data.email,
                password: password,
                redirect: window.location.pathname
            });

            console.log('Login response:', loginResponse);

            if (loginResponse.success) {
                console.log('Login successful!');
                
                if(!!DASHAppConstants.system.LOGIN_SOUNDS) {
                    const audio = new Audio(successSource);
                    audio.load();
                    audio.play();
                }

                setLoginLoading(false);

                // Handle redirect if provided by the service
                if (loginResponse.redirectAfterLogin) {
                    console.log('Redirecting to:', loginResponse.redirectAfterLogin);
                    navigate(loginResponse.redirectAfterLogin);
                } else {
                    navigate('/');
                }
            } else {
                throw new Error(loginResponse.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if(!!DASHAppConstants.system.LOGIN_SOUNDS) {
                const audio = new Audio(errorSource);
                audio.load();
                audio.play();
            }
            
            setLoginLoading(false);
            // @ts-ignore - Error handling for unknown error types
            let eMessage = 'Credenciales inválidas';
            // @ts-ignore - error.response may not exist on unknown error type
            if (error && error.response && error.response.data && error.response.data.message) {
                // @ts-ignore - error.response.data.message access
                eMessage = error.response.data.message;
            // @ts-ignore - error.error may not exist on unknown error type
            } else if (error && error.error) {
                // @ts-ignore - error.error access
                eMessage = error.error;
            // @ts-ignore - error.message may not exist on unknown error type
            } else if (error && error.message) {
                // @ts-ignore - error.message access
                eMessage = error.message;
            }
            
            showNotification(eMessage, 'error');
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                //minHeight: '100vh',
               
                pt: 20
            }}
        >
            <Card
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    boxShadow: 3
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit(onSubmit)} className='dash-app-login-form'>
                        {/* Title */}
                        {/*<Box sx={{ mb: 1.5, textAlign: 'center' }}>
                            <h1 
                                className='dash-app-login-form-title'
                                style={{ 
                                    margin: 0,
                                    fontSize: '1.75rem',
                                    marginBottom: '0.5rem',
                                    fontWeight: 500
                                }}
                            >
                                Ingresar
                            </h1>
                        </Box>*/}

                        {/* Email Field */}
                        <Box sx={{ mb: 1.5 }}>
                            <TextField
                                label='Email'
                                placeholder='Email'
                                required
                                fullWidth
                                {...register('email', { validate: validateEmail })}
                                className='dash-app-form-item-input'
                                size="small"
                                variant="outlined"
                            />
                            {errors.email && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.25 }}>
                                    {/* @ts-ignore - FieldError message handling */}
                                    {errors.email.message || "Email inválido"}
                                </Box>
                            )}
                        </Box>

                        {/* Password Field */}
                        <Box sx={{ mb: 1.5 }}>
                            <TextField
                                label='Contraseña'
                                placeholder='Contraseña'
                                fullWidth
                                {...register('password')}
                                className='dash-app-form-item-input'
                                size="small"
                                variant="outlined"
                                slotProps={{
                                    input: {
                                        autoComplete: 'password',
                                        type: showNewPassword ? 'text' : 'password',
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    aria-label='toggle password visibility'
                                                    onClick={handleClickShowNewPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge='end'
                                                    size="small"
                                                >
                                                    {showNewPassword ? (
                                                        <VisibilityOff fontSize="small" />
                                                    ) : (
                                                        <Visibility fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                            {errors.password && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.25 }}>
                                    {/* @ts-ignore - FieldError message handling */}
                                    {errors.password.message || "Contraseña Inválida"}
                                </Box>
                            )}
                        </Box>

                        {/* Reset Password Link */}
                        <Box sx={{ mb: 1.5, textAlign: 'right' }}>
                            <Link
                                className='link link--secondary'
                                href='/reset-password'
                                sx={{ fontSize: '0.875rem' }}
                            >
                                Resetear contraseña
                            </Link>
                        </Box>

                        {/* Login Button */}
                        <Box sx={{ mb: 0.5 }}>
                            <LoadingButton
                                fullWidth
                                size="medium"
                                className='submit'
                                type='submit'
                                loading={loginLoading}
                                variant='contained'
                                sx={{ py: 1 }}
                            >
                                Ingresar
                            </LoadingButton>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DASHLightWeightLogin;
