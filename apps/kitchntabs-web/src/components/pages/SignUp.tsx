import React, { createRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { 
    Grid, 
    IconButton, 
    TextField, 
    Card, 
    CardContent, 
    Typography, 
    Box,
    Chip,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Divider,
    Alert,
    useTheme,
    useMediaQuery,
    CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GoogleIcon from '@mui/icons-material/Google';

import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import {DASHAdminSystemConstants} from 'dash-constants';
import { RutValidator } from 'dash-admin/src/utils/validators';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

// Dictionary for translations
const signUpDict = {
    // Main titles and headers
    "createYourAccount": "Crea Tu Cuenta",
    "chooseYourPlan": "Elige Tu Plan",
    "accountInformation": "Información de la Cuenta",
    
    // Form fields
    "email": "Correo Electrónico",
    "businessName": "Nombre de la Empresa",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "password": "Contraseña",
    "confirmPassword": "Confirmar Contraseña",
    "contactPhone": "Teléfono de Contacto",
    
    // Buttons and actions
    "continueWithGoogle": "Continuar con Google",
    "connecting": "Conectando...",
    "createAccountStartTrial": "Crear Cuenta e Iniciar Prueba",
    "creatingAccount": "Creando Cuenta...",
    "cancel": "Cancelar",
    
    // Plan related
    "features": "Características",
    "loadingPlans": "Cargando planes...",
    "month": "mes",
    "year": "año",
    "freeTrialDays": "días de prueba gratis",
    "noTrialPeriod": "Sin período de prueba",
    "moreFeatures": "características más",
    
    // Messages and notifications
    "orSignUpWithEmail": "o regístrate con correo electrónico",
    "termsOfService": "Términos de Servicio",
    "privacyPolicy": "Política de Privacidad",
    "byCreatingAccount": "Al crear una cuenta, aceptas nuestros",
    "and": "y",
    
    // Validation messages
    "emailRequired": "El correo electrónico es obligatorio",
    "invalidEmail": "Dirección de correo electrónico inválida",
    "businessNameRequired": "El nombre de la empresa es obligatorio",
    "rutRequired": "El RUT es obligatorio",
    "invalidRut": "RUT inválido",
    "firstNameRequired": "El nombre es obligatorio",
    "lastNameRequired": "El apellido es obligatorio",
    "passwordRequired": "La contraseña es obligatoria",
    "passwordMinLength": "La contraseña debe tener al menos 8 caracteres",
    "confirmPasswordRequired": "Por favor confirma tu contraseña",
    "passwordsDoNotMatch": "Las contraseñas no coinciden",
    "phoneRequired": "El número de teléfono es obligatorio",
    "planRequired": "Por favor selecciona un plan de suscripción",
    
    // Success and error messages
    "accountCreatedSuccess": "¡Cuenta creada exitosamente! Por favor revisa tu correo electrónico para verificar tu cuenta.",
    "errorOccurred": "Ocurrió un error, por favor intenta de nuevo",
    "registrationError": "Ocurrió un error durante el registro",
    "plansLoadError": "Error al cargar los planes de suscripción",
    "googleSignupDisabled": "El registro con Google está actualmente deshabilitado",
    "googleAuthError": "Error con la autenticación de Google",
    
    // Dialog and error titles
    "error": "Error"
};

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    features: string[];
    is_active: boolean;
    trial_days: number;
}

interface SignUpFormData {
    email: string;
    public_name: string; // Business name
    public_id: string;   // RUT
    name: string;
    lastname: string;
    password: string;
    password_confirmation: string;
    phone: string;
    plan_id?: number;
    'g-recaptcha-response'?: string;
}

/**
 * Componente de página de registro que maneja el registro de usuarios con selección de plan de suscripción
 * e integración con autenticación de Google
 */
const SignUpPage = (props) => {

    const {panelSettings} = props;

    const enableRecaptcha: boolean = DASHAdminSystemConstants.system.RECAPTCHA_ENABLED;
    const enableGoogleSignup: boolean = DASHAdminSystemConstants.system.GOOGLE_SIGNUP !== false;
    const recaptchaRef = createRef<ReCAPTCHA>();
    const [recpatcha, setRecaptcha] = useState(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
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

    // Load subscription plans
    useEffect(() => {
        const loadPlans = async () => {
            try {
                setPlansLoading(true);
                const response = await axios.get('/subscription-plans');
                if (response.data?.data) {
                    setPlans(response.data.data);
                    // Auto-select first plan if available
                    if (response.data.data.length > 0) {
                        setSelectedPlan(response.data.data[0].id);
                        setValue('selected_plan_id', response.data.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error loading subscription plans:', error);
                notify(signUpDict.plansLoadError, { type: 'warning' });
            } finally {
                setPlansLoading(false);
            }
        };

        loadPlans();
    }, []);

    useEffect(() => {
        dispatch(
            DASH_REDUX_ACTIONS.updatePage({
                title: null,
            }),
        );
    }, []);

    const handlePlanSelection = (planId: number) => {
        setSelectedPlan(planId);
        setValue('selected_plan_id', planId);
        clearErrors('selected_plan_id');
    };

    const googleClientId: string = DASHAdminSystemConstants.system.GOOGLE_CLIENT_ID;

    /**
     * Handle successful Google OAuth login
     * Sends credential to backend for verification and trial registration
     */
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!enableGoogleSignup) {
            notify(signUpDict.googleSignupDisabled, { type: 'warning' });
            return;
        }

        try {
            setGoogleAuthLoading(true);
            
            // Send credential to backend for verification
            const response = await axios.post('/auth/google/authenticate', {
                credential: credentialResponse.credential,
                plan_id: selectedPlan,
                signup: true,
            });

            if (response.data?.success) {
                notify(signUpDict.accountCreatedSuccess, { type: 'success' });
                
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
                            planName: plans.find(p => p.id === selectedPlan)?.name,
                            message: response.data.message || signUpDict.accountCreatedSuccess
                        } 
                    });
                }
            } else {
                notify(response.data?.message || signUpDict.googleAuthError, { type: 'error' });
            }
        } catch (error: any) {
            console.error('Google authentication error:', error);
            notify(error.response?.data?.message || signUpDict.googleAuthError, { type: 'error' });
        } finally {
            setGoogleAuthLoading(false);
        }
    };

    /**
     * Handle Google OAuth error
     */
    const handleGoogleError = () => {
        console.error('Google OAuth failed');
        notify(signUpDict.googleAuthError, { type: 'error' });
    };

    async function onSubmit(data: SignUpFormData) {
        try {
            setLoading(true);
            clearErrors();

            // Validate plan selection
            if (!selectedPlan) {
                setError('plan_id', {
                    type: 'required',
                    message: signUpDict.planRequired
                });
                return;
            }

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
                plan_id: selectedPlan,
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
                notify(signUpDict.accountCreatedSuccess, { type: 'success' });
                
                // Redirect to verification pending page
                navigate('/signup-success', { 
                    state: { 
                        email: data.email, 
                        planName: plans.find(p => p.id === selectedPlan)?.name,
                        message: response.data?.message || signUpDict.accountCreatedSuccess
                    } 
                });
            } else {
                dialog({
                    variant: 'danger',
                    title: signUpDict.error,
                    content: signUpDict.errorOccurred,
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
                notify(signUpDict.registrationError, { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    }

    const formatPrice = (price: number, billingCycle: string) => {
        return `${price.toFixed(2)}/${billingCycle === 'monthly' ? signUpDict.month : signUpDict.year}`;
    };

    const getTrialText = (trialDays: number) => {
        return trialDays > 0 ? `${trialDays} ${signUpDict.freeTrialDays}` : signUpDict.noTrialPeriod;
    };

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
                        {signUpDict.createYourAccount}
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
                                        <Typography>{signUpDict.connecting}</Typography>
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
                                {signUpDict.orSignUpWithEmail}
                            </Typography>
                        </Divider>
                    </>
                )}

                {/* Subscription Plans Selection */}
                <div className='dash-app-form-item'>
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend">
                            <Typography 
                                variant={isMobile ? "h6" : "h5"} 
                                gutterBottom
                                sx={{ 
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    fontWeight: 'medium',
                                    mb: { xs: 2, sm: 3 }
                                }}
                            >
                                {signUpDict.chooseYourPlan}
                            </Typography>
                        </FormLabel>
                        
                        {plansLoading ? (
                            <Box display="flex" justifyContent="center" p={2}>
                                <Typography>{signUpDict.loadingPlans}</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                                {plans.map((plan) => (
                                    <Grid 
                                        key={plan.id}
                                        size={{ 
                                            xs: 12, 
                                            sm: plans.length === 1 ? 12 : 6, 
                                            md: plans.length <= 2 ? 6 : 4 
                                        }}
                                    >
                                        <Card 
                                            variant={selectedPlan === plan.id ? "outlined" : "elevation"}
                                            sx={{ 
                                                cursor: 'pointer',
                                                border: selectedPlan === plan.id ? 2 : 1,
                                                borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    transform: 'translateY(-2px)',
                                                    transition: 'all 0.2s ease-in-out'
                                                },
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                width: '100%'
                                            }}
                                            onClick={() => handlePlanSelection(plan.id)}
                                        >
                                            <CardContent sx={{ 
                                                flexGrow: 1, 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                p: { xs: 2, sm: 3 }
                                            }}>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <Typography 
                                                        variant={isMobile ? "h6" : "h5"} 
                                                        component="div"
                                                        sx={{ 
                                                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {plan.name}
                                                    </Typography>
                                                    {selectedPlan === plan.id && (
                                                        <CheckCircleIcon 
                                                            color="primary" 
                                                            sx={{ ml: 'auto', fontSize: { xs: 20, sm: 24 } }} 
                                                        />
                                                    )}
                                                </Box>
                                                
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    color="primary" 
                                                    gutterBottom
                                                    sx={{ 
                                                        fontSize: { xs: '1.5rem', sm: '2rem' },
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    ${formatPrice(plan.price, plan.billing_cycle)}
                                                </Typography>
                                                
                                                <Chip 
                                                    label={getTrialText(plan.trial_days)}
                                                    color="secondary"
                                                    size={isMobile ? "small" : "medium"}
                                                    sx={{
                                                        mb: 2,
                                                        alignSelf: 'flex-start',
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                />
                                                
                                                <Typography 
                                                    variant="body2" 
                                                    color="textSecondary" 
                                                    paragraph
                                                    sx={{ 
                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                        lineHeight: 1.5,
                                                        mb: 2
                                                    }}
                                                >
                                                    {plan.description}
                                                </Typography>
                                                
                                                {plan.features && plan.features.length > 0 && (
                                                    <Box sx={{ mt: 'auto' }}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            gutterBottom
                                                            sx={{ 
                                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                                                fontWeight: 'medium'
                                                            }}
                                                        >
                                                            {signUpDict.features}:
                                                        </Typography>
                                                        {plan.features.slice(0, isMobile ? 2 : 3).map((feature, index) => (
                                                            <Typography 
                                                                key={index} 
                                                                variant="body2" 
                                                                color="textSecondary"
                                                                sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'flex-start', 
                                                                    mb: 0.5,
                                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                                }}
                                                            >
                                                                <CheckCircleIcon 
                                                                    sx={{ 
                                                                        fontSize: { xs: 14, sm: 16 }, 
                                                                        mr: 1, 
                                                                        color: 'success.main',
                                                                        mt: 0.1,
                                                                        flexShrink: 0
                                                                    }} 
                                                                />
                                                                {feature}
                                                            </Typography>
                                                        ))}
                                                        {plan.features.length > (isMobile ? 2 : 3) && (
                                                            <Typography 
                                                                variant="body2" 
                                                                color="primary"
                                                                sx={{ 
                                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                                    fontWeight: 'medium'
                                                                }}
                                                            >
                                                                +{plan.features.length - (isMobile ? 2 : 3)} {signUpDict.moreFeatures}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                        
                        {errors.plan_id && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.plan_id.message}
                            </Alert>
                        )}
                    </FormControl>
                </div>

                {/* User Information Form - Constrained to 50% width on large screens */}
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
                            mt: { xs: 3, sm: 4 },
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            fontWeight: 'medium'
                        }}
                    >
                        {signUpDict.accountInformation}
                    </Typography>

                    <div className='dash-app-form-item'>
                        <TextField
                            placeholder={signUpDict.email}
                            label={signUpDict.email}
                            required
                            fullWidth
                            {...register('email', {
                                required: signUpDict.emailRequired,
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: signUpDict.invalidEmail
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
                            placeholder={signUpDict.businessName}
                            label={signUpDict.businessName}
                            required
                            fullWidth
                            className='dash-app-form-item-input'
                            {...register('public_name', {
                                required: signUpDict.businessNameRequired
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
                                required: signUpDict.rutRequired
                            })}
                            error={!!errors.public_id}
                            helperText={errors.public_id?.message || (errors.public_id ? signUpDict.invalidRut : '')}
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
                                    placeholder={signUpDict.firstName}
                                    label={signUpDict.firstName}
                                    required
                                    fullWidth
                                    className='dash-app-form-item-input'
                                    {...register('name', {
                                        required: signUpDict.firstNameRequired
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
                                    placeholder={signUpDict.lastName}
                                    label={signUpDict.lastName}
                                    required
                                    fullWidth
                                    className='dash-app-form-item-input'
                                    {...register('lastname', {
                                        required: signUpDict.lastNameRequired
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
                                    placeholder={signUpDict.password}
                                    label={signUpDict.password}
                                    required
                                    fullWidth
                                    type='password'
                                    className='dash-app-form-item-input'
                                    {...register('password', {
                                        required: signUpDict.passwordRequired,
                                        minLength: {
                                            value: 8,
                                            message: signUpDict.passwordMinLength
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
                                    placeholder={signUpDict.confirmPassword}
                                    label={signUpDict.confirmPassword}
                                    required
                                    fullWidth
                                    className='dash-app-form-item-input'
                                    type='password'
                                    {...register('password_confirmation', {
                                        required: signUpDict.confirmPasswordRequired,
                                        validate: (value) => {
                                            const password = form.getValues('password');
                                            return value === password || signUpDict.passwordsDoNotMatch;
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
                            label={signUpDict.contactPhone}
                            required
                            fullWidth
                            placeholder='+569 1234 5678'
                            className='dash-app-form-item-input'
                            {...register('phone', {
                                required: signUpDict.phoneRequired
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
                            disabled={(!recpatcha && enableRecaptcha) || loading || !selectedPlan}
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
                            {loading ? signUpDict.creatingAccount : signUpDict.createAccountStartTrial}
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
                            {signUpDict.cancel}
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
                            {signUpDict.byCreatingAccount}{' '}
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
                                {signUpDict.termsOfService}
                            </Button>
                            {' '}{signUpDict.and}{' '}
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
                                {signUpDict.privacyPolicy}
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
