import React, { createRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useNotify, useTranslate } from 'react-admin';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { 
    Grid, 
    IconButton, 
    TextField, 
    Typography, 
    Box,
    Divider,
    Alert,
    useTheme,
    useMediaQuery,
    CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import {DASHAdminSystemConstants} from 'dash-constants';
import { RutValidator } from 'dash-admin/src/utils/validators';

interface SignUpFormData {
    email: string;
    public_name: string; // Business name
    public_id: string;   // RUT
    name: string;
    lastname: string;
    password: string;
    password_confirmation: string;
    phone: string;
    'g-recaptcha-response'?: string;
}

/**
 * Componente de página de registro que maneja el registro de usuarios con selección de plan de suscripción
 * e integración con autenticación de Google
 */
const SignUpPage = (props) => {

    const {panelSettings} = props;
    const translate = useTranslate();

    const enableRecaptcha: boolean = DASHAdminSystemConstants.system.RECAPTCHA_ENABLED;
    const enableGoogleSignup: boolean = DASHAdminSystemConstants.system.GOOGLE_SIGNUP !== false;
    const recaptchaRef = createRef<ReCAPTCHA>();
    const [recpatcha, setRecaptcha] = useState(null);
    const [loading, setLoading] = useState(false);
    const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

    // Add responsive breakpoints
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const dispatch = useDispatch();
    const dialog = useDialog();
    const dict = React.useContext(DictionaryContext);
    const navigate = useNavigate();
    const form = useForm<SignUpFormData>();
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
        setValue,
        watch
    } = form;
    const axios = useAxios();
    const notify = useNotify();

    const watchedEmail = watch('email');

    const onChangeRecaptcha = (value: string) => {
        clearErrors('g-recaptcha-response');
        setRecaptcha(value);
    };

    useEffect(() => {
        dispatch(
            DASH_REDUX_ACTIONS.updatePage({
                title: null,
            }),
        );
    }, []);

    const googleClientId: string = DASHAdminSystemConstants.system.GOOGLE_CLIENT_ID;

    /**
     * Handle successful Google OAuth login
     * Sends credential to backend for verification and trial registration
     */
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!enableGoogleSignup) {
            notify(translate('signup.googleSignupDisabled'), { type: 'warning' });
            return;
        }

        try {
            setGoogleAuthLoading(true);
            
            // Send credential to backend for verification
            const response = await axios.post('/auth/google/authenticate', {
                credential: credentialResponse.credential,
                signup: true,
            });

            if (response.data?.success) {
                notify(translate('signup.accountCreatedSuccess'), { type: 'success' });
                
                // If user already exists, redirect to login
                if (response.data?.existing_user) {
                    navigate('/login', {
                        state: { 
                            email: response.data.email,
                            message: 'Account exists. Please login.'
                        }
                    });
                } else {
                    // New user - redirect to success page
                    navigate('/signup-success', { 
                        state: { 
                            email: response.data.email, 
                            message: response.data.message || translate('signup.accountCreatedSuccess')
                        } 
                    });
                }
            } else {
                notify(response.data?.message || translate('signup.googleAuthError'), { type: 'error' });
            }
        } catch (error: any) {
            console.error('Google authentication error:', error);
            notify(error.response?.data?.message || translate('signup.googleAuthError'), { type: 'error' });
        } finally {
            setGoogleAuthLoading(false);
        }
    };

    /**
     * Handle Google OAuth error
     */
    const handleGoogleError = () => {
        console.error('Google OAuth failed');
        notify(translate('signup.googleAuthError'), { type: 'error' });
    };

    async function onSubmit(data: SignUpFormData) {
        try {
            setLoading(true);
            clearErrors();

            // Prepare data for trial/register endpoint
            const submitData = {
                email: data.email,
                public_id: data.public_id,
                public_name: data.public_name,
                name: data.name,
                lastname: data.lastname,
                password: data.password,
                password_confirmation: data.password_confirmation,
                phone: data.phone,
            };

            if (enableRecaptcha) {
                const recaptchaValue =
                    recaptchaRef.current && recaptchaRef.current.getValue
                        ? recaptchaRef.current.getValue()
                        : recpatcha;
                submitData['g-recaptcha-response'] = recaptchaValue;
            }

            const response = await axios.post('/trial/register', submitData);

            if (response.status >= 200 && response.status < 300) {
                notify(translate('signup.accountCreatedSuccess'), { type: 'success' });
                
                // Redirect to verification pending page
                navigate('/signup-success', { 
                    state: { 
                        email: data.email, 
                        message: response.data?.message || translate('signup.accountCreatedSuccess')
                    } 
                });
            } else {
                dialog({
                    variant: 'danger',
                    title: translate('signup.error'),
                    content: translate('signup.errorOccurred'),
                });
            }
        } catch (error: any) {
            console.error('SignUp error:', error);
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                for (const key in errors) {
                    // Map backend field names to frontend form fields
                    const formKey = key === 'public_name' ? 'public_name' : key;
                    setError(formKey as keyof SignUpFormData, { 
                        type: 'custom', 
                        message: Array.isArray(errors[key]) ? errors[key][0] : errors[key]
                    });
                }
            } else if (error.response?.data?.message) {
                notify(error.response.data.message, { type: 'error' });
            } else {
                notify(translate('signup.registrationError'), { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    }

    // Wrap content conditionally with GoogleOAuthProvider
    const formContent = (
            <form onSubmit={handleSubmit(onSubmit)} className='dash-app-login-form'>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 4, 
                    mt: 2,
                    gap: 1
                }}>
                    <IconButton
                        color={'primary'}
                        size={'large'}
                        onClick={() => navigate('/')}
                    >
                        <HomeIcon />
                    </IconButton>
                    <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        component="h1" 
                        className='dash-app-login-form-title'
                        sx={{ 
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            fontWeight: 'bold'
                        }}
                    >
                        {translate('signup.title')}
                    </Typography>
                </Box>

                {/* Google Sign Up Button - Only show if enabled and client ID configured */}
                {enableGoogleSignup && googleClientId && (
                    <>
                        <div className='dash-app-form-item'>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center',
                                    width: '100%',
                                    minHeight: 50,
                                    position: 'relative'
                                }}
                            >
                                {googleAuthLoading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CircularProgress size={24} />
                                        <Typography>{translate('signup.connecting')}</Typography>
                                    </Box>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        size="large"
                                        width={isMobile ? "300" : "400"}
                                        text="signup_with"
                                        shape="rectangular"
                                        logo_alignment="left"
                                    />
                                )}
                            </Box>
                        </div>

                        <Divider sx={{ my: { xs: 2, sm: 3 } }}>
                            <Typography variant="body2" color="textSecondary">
                                {translate('signup.orSignUpWithEmail')}
                            </Typography>
                        </Divider>
                    </>
                )}

                {/* User Information Form */}
                <Box
                    sx={{
                        width: { xs: '100%' },
                        ml: { lg: 0 },
                        mr: { lg: 'auto' }
                    }}
                >
                    <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        gutterBottom 
                        sx={{ 
                            mt: { xs: 1, sm: 2 },
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            fontWeight: 'medium'
                        }}
                    >
                        {translate('signup.accountInformation')}
                    </Typography>

                    <div className='dash-app-form-item'>
                        <TextField
                            placeholder={translate('signup.email')}
                            label={translate('signup.email')}
                            required
                            fullWidth
                            {...register('email', {
                                required: translate('signup.email')Required,
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: translate('signup.invalidEmail')
                                }
                            })}
                            inputProps={{ type: 'email'}}
                            className='dash-app-form-item-input'
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }
                            }}
                        />
                    </div>

                    <div className='dash-app-form-item'>
                        <TextField
                            placeholder={translate('signup.businessName')}
                            label={translate('signup.businessName')}
                            required
                            fullWidth
                            className='dash-app-form-item-input'
                            {...register('public_name', {
                                required: translate('signup.businessName')Required
                            })}
                            error={!!errors.public_name}
                            helperText={errors.public_name?.message}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }
                            }}
                        />
                    </div>

                    <div className='dash-app-form-item'>
                        <TextField
                            placeholder='11.111.111-1'
                            label='RUT'
                            required
                            fullWidth
                            className='dash-app-form-item-input'
                            {...register('public_id', { 
                                validate: RutValidator,
                                required: translate('signup.rutRequired')
                            })}
                            error={!!errors.public_id}
                            helperText={errors.public_id?.message || (errors.public_id ? translate('signup.invalidRut') : '')}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }
                            }}
                        />
                    </div>

                    <Grid container spacing={{ xs: 2, sm: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className='dash-app-form-item'>
                                <TextField
                                    placeholder={translate('signup.firstName')}
                                    label={translate('signup.firstName')}
                                    required
                                    fullWidth
                                    className='dash-app-form-item-input'
                                    {...register('name', {
                                        required: translate('signup.firstName')Required
                                    })}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className='dash-app-form-item'>
                                <TextField
                                    placeholder={translate('signup.lastName')}
                                    label={translate('signup.lastName')}
                                    required
                                    fullWidth
                                    className='dash-app-form-item-input'
                                    {...register('lastname', {
                                        required: translate('signup.lastName')Required
                                    })}
                                    error={!!errors.lastname}
                                    helperText={errors.lastname?.message}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            </div>
                        </Grid>
                    </Grid>

                    <Grid container spacing={{ xs: 2, sm: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className='dash-app-form-item'>
                                <TextField
                                    placeholder={translate('signup.password')}
                                    label={translate('signup.password')}
                                    required
                                    fullWidth
                                    type='password'
                                    className='dash-app-form-item-input'
                                    {...register('password', {
                                        required: translate('signup.password')Required,
                                        minLength: {
                                            value: 8,
                                            message: translate('signup.password')MinLength
                                        }
                                    })}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <div className='dash-app-form-item'>
                                <TextField
                                    placeholder={translate('signup.confirmPassword')}
                                    label={translate('signup.confirmPassword')}
                                    required
                                    fullWidth
                                    className='dash-app-form-item-input'
                                    type='password'
                                    {...register('password_confirmation', {
                                        required: translate('signup.confirmPassword')Required,
                                        validate: (value) => {
                                            const password = form.getValues('password');
                                            return value === password || translate('signup.password')sDoNotMatch;
                                        }
                                    })}
                                    error={!!errors.password_confirmation}
                                    helperText={errors.password_confirmation?.message}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            </div>
                        </Grid>
                    </Grid>

                    <div className='dash-app-form-item'>
                        <TextField
                            label={translate('signup.contactPhone')}
                            required
                            fullWidth
                            placeholder='+569 1234 5678'
                            className='dash-app-form-item-input'
                            {...register('phone', {
                                required: translate('signup.phoneRequired')
                            })}
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }
                            }}
                        />
                    </div>

                    {/* reCAPTCHA */}
                    {enableRecaptcha && (
                        <div className='dash-app-form-item mb-0'>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: isMobile ? 'flex-start' : 'center',
                                    width: '100%',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                                                               transform: isMobile ? 'scale(0.77)' : 'scale(1)',
                                        transformOrigin: 'left center',
                                        width: isMobile ? '130%' : '100%'
                                    }}
                                >
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={DASHAdminSystemConstants.system.RECAPTCHA_TOKEN}
                                        onChange={onChangeRecaptcha}
                                        size={isMobile ? "compact" : "normal"}
                                    />
                                </Box>
                            </Box>
                            {errors['g-recaptcha-response'] && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {errors['g-recaptcha-response'].message}
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className='dash-app-form-item mb-0'>
                        <Button
                            disabled={(!recpatcha && enableRecaptcha) || loading}
                            type='submit'
                            fullWidth
                            variant={'contained'}
                            size="large"
                            onClick={() => clearErrors()}
                            sx={{ 
                                py: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? translate('signup.creatingAccount') : translate('signup.createAccountStartTrial')}
                        </Button>
                    </div>

                    <div className='dash-app-form-item mb-0'>
                        <Button 
                            className='default' 
                            fullWidth
                            onClick={() => navigate('/')}
                            disabled={loading}
                            sx={{ 
                                py: { xs: 1, sm: 1.5 },
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            {translate('signup.cancel')}
                        </Button>
                    </div>

                    {/* Terms and Privacy */}
                    <Box sx={{ mb:3}} mt={{ xs: 2, sm: 3, }}>
                        <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            align="center"
                            sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                lineHeight: 1.4,
                                px: { xs: 1, sm: 0 }
                            }}
                        >
                            {translate('signup.byCreatingAccount')}{' '}
                            <Button 
                                variant="text" 
                                size="small" 
                                onClick={() => navigate('/legal')}
                                sx={{ 
                                    textTransform: 'none', 
                                    p: 0, 
                                    minWidth: 'auto',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    textDecoration: 'underline'
                                }}
                            >
                                {translate('signup.termsOfService')}
                            </Button>
                            {' '}{translate('signup.and')}{' '}
                            <Button 
                                variant="text" 
                                size="small" 
                                onClick={() => navigate('/legal')}
                                sx={{ 
                                    textTransform: 'none', 
                                    p: 0, 
                                    minWidth: 'auto',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    textDecoration: 'underline'
                                }}
                            >
                                {translate('signup.privacyPolicy')}
                            </Button>
                        </Typography>
                    </Box>
                </Box>
            </form>
  
    );

    // If Google client ID is configured, wrap with OAuth provider
    if (googleClientId) {
        return (
            <GoogleOAuthProvider clientId={googleClientId}>
                {formContent}
            </GoogleOAuthProvider>
        );
    }

    return formContent;
};

export default SignUpPage;
