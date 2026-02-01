/**
 * Default SignUp Page
 * 
 * SignUp page with subscription plan selection.
 */
import React, { createRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import ReCAPTCHA from 'react-google-recaptcha';
import { 
    Grid, 
    IconButton, 
    TextField, 
    Card, 
    CardContent, 
    Typography, 
    Box,
    Chip,
    FormControl,
    FormLabel,
    Divider,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GoogleIcon from '@mui/icons-material/Google';

import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import { DASHAdminSystemConstants } from 'dash-constants';
import { RutValidator } from 'dash-admin/src/utils/validators';
import FullLayoutMarkup from 'dash-admin/src/default-theme/FullLayoutMarkup';
import { priceFormatter } from 'dash-utils';

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
    clientname: string;
    public_id: string;
    name: string;
    lastname: string;
    password: string;
    confirm_password: string;
    phone: string;
    selected_plan_id?: number;
    'g-recaptcha-response'?: string;
}

interface DefaultSignUpPageProps {
    panelSettings?: {
        horizontalLogo?: string;
        loginBackground?: string;
    };
    showRutField?: boolean;
}

const DefaultSignUpPage: React.FC<DefaultSignUpPageProps> = (props) => {
    const { panelSettings, showRutField = true } = props;

    const enableRecaptcha: boolean = DASHAdminSystemConstants.system.RECAPTCHA_ENABLED;
    const enableGoogleSignup: boolean = DASHAdminSystemConstants.system.GOOGLE_SIGNUP !== false;
    const recaptchaRef = createRef<ReCAPTCHA>();
    const [recpatcha, setRecaptcha] = useState(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                    if (response.data.data.length > 0) {
                        setSelectedPlan(response.data.data[0].id);
                        setValue('selected_plan_id', response.data.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error loading subscription plans:', error);
                notify('Error loading subscription plans', { type: 'warning' });
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

    const handleGoogleSignUp = async () => {
        if (!enableGoogleSignup) {
            notify('Google signup is currently disabled', { type: 'warning' });
            return;
        }

        try {
            setGoogleAuthLoading(true);
            const googleAuthUrl = DASHAdminSystemConstants.system.API_URL + `/api/auth/google/redirect?signup=true&plan_id=${selectedPlan || ''}`;
            window.location.href = googleAuthUrl;
        } catch (error) {
            console.error('Google authentication error:', error);
            notify('Google authentication error', { type: 'error' });
        } finally {
            setGoogleAuthLoading(false);
        }
    };

    async function onSubmit(data: SignUpFormData) {
        try {
            setLoading(true);
            clearErrors();

            if (!selectedPlan) {
                setError('selected_plan_id', {
                    type: 'required',
                    message: 'Please select a subscription plan'
                });
                return;
            }

            if (data.clientname) {
                const bracketed_name = 'client[name]';
                data[bracketed_name] = data.clientname;
                delete data.clientname;
            }

            data.selected_plan_id = selectedPlan;

            if (enableRecaptcha) {
                const recaptchaValue =
                    recaptchaRef.current && recaptchaRef.current.getValue
                        ? recaptchaRef.current.getValue()
                        : recpatcha;
                data['g-recaptcha-response'] = recaptchaValue;
            }

            const response = await axios.post('/auth/user/signup', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status >= 200) {
                notify('Account created successfully!', { type: 'success' });
                navigate('/signup-success', { 
                    state: { 
                        email: data.email, 
                        planName: plans.find(p => p.id === selectedPlan)?.name 
                    } 
                });
            } else {
                dialog({
                    variant: 'danger',
                    title: 'Error',
                    content: 'An error occurred, please try again',
                });
            }
        } catch (error: any) {
            console.error('SignUp error:', error);
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                for (const key in errors) {
                    if (key === 'client.name') {
                        setError('clientname', {
                            type: 'custom',
                            message: dict.get(errors[key], true),
                        });
                    } else {
                        setError(key as keyof SignUpFormData, { 
                            type: 'custom', 
                            message: dict.get(errors[key], true) 
                        });
                    }
                }
            } else {
                notify('Registration error occurred', { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    }

    const formatPrice = (price: number, billingCycle: string) => {
        return `${priceFormatter(price, 'USD')}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`;
    };

    const getTrialText = (trialDays: number) => {
        return trialDays > 0 ? `${trialDays} days free trial` : 'No trial period';
    };

    return (
        <FullLayoutMarkup 
            className='dash-signup' 
            logo={panelSettings?.horizontalLogo} 
            loginBackground={panelSettings?.loginBackground}
        >
            <form onSubmit={handleSubmit(onSubmit)} className='dash-app-login-form'>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 2, gap: 1 }}>
                    <IconButton color='primary' size='large' onClick={() => navigate('/')}>
                        <HomeIcon />
                    </IconButton>
                    <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        component="h1" 
                        className='dash-app-login-form-title'
                        sx={{ fontWeight: 'bold' }}
                    >
                        Create Your Account
                    </Typography>
                </Box>

                {enableGoogleSignup && (
                    <>
                        <div className='dash-app-form-item'>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<GoogleIcon />}
                                onClick={handleGoogleSignUp}
                                disabled={googleAuthLoading || !selectedPlan}
                                size="large"
                            >
                                {googleAuthLoading ? 'Connecting...' : 'Continue with Google'}
                            </Button>
                        </div>
                        <Divider sx={{ my: 3 }}>
                            <Typography variant="body2" color="textSecondary">
                                or sign up with email
                            </Typography>
                        </Divider>
                    </>
                )}

                {/* Subscription Plans */}
                <div className='dash-app-form-item'>
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend">
                            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                                Choose Your Plan
                            </Typography>
                        </FormLabel>
                        
                        {plansLoading ? (
                            <Box display="flex" justifyContent="center" p={2}>
                                <Typography>Loading plans...</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {plans.map((plan) => (
                                    <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Card 
                                            variant={selectedPlan === plan.id ? "outlined" : "elevation"}
                                            sx={{ 
                                                cursor: 'pointer',
                                                border: selectedPlan === plan.id ? 2 : 1,
                                                borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                                                '&:hover': { borderColor: 'primary.main' },
                                                height: '100%'
                                            }}
                                            onClick={() => handlePlanSelection(plan.id)}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <Typography variant="h6">{plan.name}</Typography>
                                                    {selectedPlan === plan.id && (
                                                        <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
                                                    )}
                                                </Box>
                                                <Typography variant="h4" color="primary" gutterBottom>
                                                    ${formatPrice(plan.price, plan.billing_cycle)}
                                                </Typography>
                                                <Chip label={getTrialText(plan.trial_days)} color="secondary" size="small" sx={{ mb: 2 }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    {plan.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                        
                        {errors.selected_plan_id && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.selected_plan_id.message}
                            </Alert>
                        )}
                    </FormControl>
                </div>

                {/* User Information Form */}
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Account Information
                </Typography>

                <div className='dash-app-form-item'>
                    <TextField
                        label="Email"
                        required
                        fullWidth
                        {...register('email', { required: 'Email is required' })}
                        inputProps={{ type: 'email' }}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                </div>

                <div className='dash-app-form-item'>
                    <TextField
                        label="Business Name"
                        required
                        fullWidth
                        {...register('clientname', { required: 'Business name is required' })}
                        error={!!errors.clientname}
                        helperText={errors.clientname?.message}
                    />
                </div>

                {showRutField && (
                    <div className='dash-app-form-item'>
                        <TextField
                            label="RUT"
                            placeholder='11.111.111-1'
                            fullWidth
                            {...register('public_id', { validate: RutValidator })}
                            error={!!errors.public_id}
                            helperText={errors.public_id?.message}
                        />
                    </div>
                )}

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className='dash-app-form-item'>
                            <TextField
                                label="First Name"
                                required
                                fullWidth
                                {...register('name', { required: 'First name is required' })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className='dash-app-form-item'>
                            <TextField
                                label="Last Name"
                                required
                                fullWidth
                                {...register('lastname', { required: 'Last name is required' })}
                                error={!!errors.lastname}
                                helperText={errors.lastname?.message}
                            />
                        </div>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className='dash-app-form-item'>
                            <TextField
                                label="Password"
                                type='password'
                                required
                                fullWidth
                                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <div className='dash-app-form-item'>
                            <TextField
                                label="Confirm Password"
                                type='password'
                                required
                                fullWidth
                                {...register('confirm_password', { required: 'Please confirm your password' })}
                                error={!!errors.confirm_password}
                                helperText={errors.confirm_password?.message}
                            />
                        </div>
                    </Grid>
                </Grid>

                <div className='dash-app-form-item'>
                    <TextField
                        label="Contact Phone"
                        placeholder='+1 234 567 8900'
                        required
                        fullWidth
                        {...register('phone', { required: 'Phone number is required' })}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                    />
                </div>

                {enableRecaptcha && (
                    <div className='dash-app-form-item'>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={DASHAdminSystemConstants.system.RECAPTCHA_TOKEN}
                            onChange={onChangeRecaptcha}
                        />
                    </div>
                )}

                <div className='dash-app-form-item'>
                    <Button
                        disabled={(!recpatcha && enableRecaptcha) || loading || !selectedPlan}
                        type='submit'
                        fullWidth
                        variant='contained'
                        size="large"
                    >
                        {loading ? 'Creating Account...' : 'Create Account & Start Trial'}
                    </Button>
                </div>

                <div className='dash-app-form-item'>
                    <Button fullWidth onClick={() => navigate('/')} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            </form>
        </FullLayoutMarkup>
    );
};

export default DefaultSignUpPage;
