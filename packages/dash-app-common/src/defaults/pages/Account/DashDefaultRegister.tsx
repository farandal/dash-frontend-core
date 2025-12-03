/**
 * Default Register Page
 * 
 * Basic registration page component that can be extended.
 */
import React, { createRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, FieldError } from 'react-hook-form';
import { Button, TextField, Grid, IconButton, Alert, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import ReCAPTCHA from 'react-google-recaptcha';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { useAxios } from 'dash-axios-hook';
import { useDialog } from 'dash-dialog';
import { DASHAppConstants } from 'dash-constants';
import { RutValidator } from 'dash-admin/src/utils/validators';
import FullLayoutMarkup from 'dash-admin/src/default-theme/FullLayoutMarkup';

interface DefaultRegisterPageProps {
    /** Whether to show RUT field (Chile-specific) */
    showRutField?: boolean;
    /** Custom fields to include */
    customFields?: React.ReactNode;
}

// Helper to extract error message
const getErrorMessage = (error: FieldError | undefined): string | undefined => {
    return error?.message as string | undefined;
};

const DefaultRegisterPage: React.FC<DefaultRegisterPageProps> = ({
    showRutField = true,
    customFields
}) => {
    const enableRecaptcha: boolean = DASHAppConstants.system.RECAPTCHA_ENABLED;
    const recaptchaRef = createRef<ReCAPTCHA>();
    const [recpatcha, setRecaptcha] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const dialog = useDialog();
    const dict = React.useContext(DictionaryContext);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setError: setFormError,
        clearErrors,
        formState: { errors },
    } = useForm();
    const axios = useAxios();
    const notify = useNotify();

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

    async function onSubmit(data) {
        setIsLoading(true);
        setError(null);

        if (data.clientname) {
            const bracketed_name = 'client[name]';
            data[bracketed_name] = data.clientname;
            delete data.clientname;
        }

        if (enableRecaptcha) {
            const recaptchaValue =
                recaptchaRef.current && recaptchaRef.current.getValue
                    ? recaptchaRef.current.getValue()
                    : recpatcha;
            data = { ...data, 'g-recaptcha-response': recaptchaValue };
        }

        try {
            const response = await axios.post('/auth/user/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status >= 200) {
                notify('User has been registered', { type: 'success' });
                navigate('/');
            } else {
                setError('An error occurred, please try again');
            }
        } catch (error: any) {
            for (const key in error) {
                if (key === 'client.name') {
                    setFormError('clientname', {
                        type: 'custom',
                        message: dict.get(error[key], true),
                    });
                }
                setFormError(key, { type: 'custom', message: dict.get(error[key], true) });
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FullLayoutMarkup>
            <form onSubmit={handleSubmit(onSubmit)} className="dash-app-login-form" autoComplete="on">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <IconButton
                        color="primary"
                        onClick={() => navigate('/')}
                    >
                        <HomeIcon />
                    </IconButton>
                    <h1 className="dash-app-login-form-title">Create Account</h1>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <div className="dash-app-form-item">
                    <TextField
                        label="Email"
                        placeholder="Email"
                        required
                        {...register('email')}
                        type="email"
                        className="dash-app-form-item-input"
                        error={!!errors.email}
                        helperText={getErrorMessage(errors.email as FieldError)}
                    />
                </div>

                <div className="dash-app-form-item">
                    <TextField
                        label="Business Name"
                        placeholder="Business Name"
                        required
                        {...register('clientname')}
                        className="dash-app-form-item-input"
                        error={!!errors.clientname}
                        helperText={getErrorMessage(errors.clientname as FieldError)}
                    />
                </div>

                {showRutField && (
                    <div className="dash-app-form-item">
                        <TextField
                            label="RUT"
                            placeholder="11.111.111-1"
                            required
                            {...register('public_id', { validate: RutValidator })}
                            className="dash-app-form-item-input"
                            error={!!errors.public_id}
                            helperText={getErrorMessage(errors.public_id as FieldError) || (errors.public_id && 'Invalid RUT')}
                        />
                    </div>
                )}

                <div className="dash-app-form-item">
                    <TextField
                        label="First Name"
                        placeholder="First Name"
                        required
                        {...register('name')}
                        className="dash-app-form-item-input"
                        error={!!errors.name}
                        helperText={getErrorMessage(errors.name as FieldError)}
                    />
                </div>

                <div className="dash-app-form-item">
                    <TextField
                        label="Last Name"
                        placeholder="Last Name"
                        required
                        {...register('lastname')}
                        className="dash-app-form-item-input"
                        error={!!errors.lastname}
                        helperText={getErrorMessage(errors.lastname as FieldError)}
                    />
                </div>

                <div className="dash-app-form-item">
                    <TextField
                        label="Password"
                        placeholder="Password"
                        type="password"
                        required
                        {...register('password')}
                        className="dash-app-form-item-input"
                        error={!!errors.password}
                        helperText={getErrorMessage(errors.password as FieldError)}
                    />
                </div>

                <div className="dash-app-form-item">
                    <TextField
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        type="password"
                        required
                        {...register('confirm_password')}
                        className="dash-app-form-item-input"
                        error={!!errors.confirm_password}
                        helperText={getErrorMessage(errors.confirm_password as FieldError)}
                    />
                </div>

                <div className="dash-app-form-item">
                    <TextField
                        label="Contact Phone"
                        placeholder="+1 234 567 8900"
                        required
                        {...register('phone')}
                        className="dash-app-form-item-input"
                        error={!!errors.phone}
                        helperText={getErrorMessage(errors.phone as FieldError)}
                    />
                </div>

                {customFields}

                {enableRecaptcha && (
                    <div className="dash-app-form-item">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={DASHAppConstants.system.RECAPTCHA_TOKEN}
                            onChange={onChangeRecaptcha}
                        />
                        {errors['g-recaptcha-response'] && (
                            <span style={{ color: 'red' }}>
                                {getErrorMessage(errors['g-recaptcha-response'] as FieldError)}
                            </span>
                        )}
                    </div>
                )}

                <div className="dash-app-form-item mt-1">
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading || (!recpatcha && enableRecaptcha)}
                        sx={{ mb: 2 }}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </div>

                <div className="dash-app-form-item">
                    <Button
                        variant="text"
                        fullWidth
                        onClick={() => {
                            clearErrors();
                            navigate('/');
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </FullLayoutMarkup>
    );
};

export default DefaultRegisterPage;
