import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button as LoadingButton } from "@mui/material";
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useNavigate } from 'react-router';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

// Import FullLayoutMarkup - this doesn't need react-admin context
import FullLayoutMarkup from 'dash-admin/src/default-theme/FullLayoutMarkup';
import { AuthPersistenceService } from 'dash-auth';
// Import the singleton instance
import authService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { dashStorage } from 'dash-utils';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

interface LoginFormData {
	email: string;
	password: string;
}

const LoginPage: React.FC = () => {
	const navigate = useNavigate();

	const validateEmail = (value: string) => {
		return EMAIL_REGEX.test(value);
	};

	// Check authentication status WITHOUT react-admin hooks
	const [loggedIn, setLoggedIn] = useState(() => {
		const isValidAuth = AuthPersistenceService.isAuthValid();
		const storageAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
		return isValidAuth && storageAuthenticated;
	});

	const [loginLoading, setLoginLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginFormData>();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	// Re-check auth status on mount
	useEffect(() => {
		const isValidAuth = AuthPersistenceService.isAuthValid();
		const storageAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
		
		if (isValidAuth && storageAuthenticated) {
			console.log('User is already authenticated');
			setLoggedIn(true);
		} else {
			console.log('User is not authenticated');
			setLoggedIn(false);
		}
	}, []);

	const handleClickShowPassword = () => setShowPassword((show) => !show);
	
	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	async function onSubmit(data: LoginFormData) {
		const password = data.password;
		setLoginLoading(true);
		setErrorMessage(null);

		try {
			console.log('Attempting login with DASHAuthenticationService...');
			const response = await authService.login({
				username: data.email,
				password,
				redirect: window.location.pathname
			});

			console.log('Login response:', response);

			if (!response.success) {
				throw new Error(response.error || 'Login failed');
			}

			console.log('Login successful!');
			setLoginLoading(false);
			setLoggedIn(true);

			// Navigate to redirect URL or home
			if (response.redirectAfterLogin) {
				console.log('Redirecting to:', response.redirectAfterLogin);
				navigate(response.redirectAfterLogin);
			} else {
				navigate('/');
			}
		} catch (error: any) {
			console.error('Login error:', error);
			setLoginLoading(false);
			
			let eMessage = 'Credenciales inválidas';
			if (error?.response?.data?.message) {
				eMessage = error.response.data.message;
			} else if (error?.error) {
				eMessage = error.error;
			} else if (error?.message) {
				eMessage = error.message;
			}
			setErrorMessage(eMessage);
		}
	}

	const horizontal_logo = AuthPersistenceService.getTenantImages()?.horizontal_logo?.original;
	const banner = AuthPersistenceService.getTenantImages()?.banner?.original;

	return (
        <FullLayoutMarkup 
			logo={horizontal_logo} 
			loginBackground={banner}
		>
            <>
				{!loggedIn ? (
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='dash-app-login-form'
					>
						{/*<h1 className='dash-app-login-form-title'>
							Ingresar
						</h1>*/}
						
						<div className='dash-app-form-item'>
							<TextField
								label='Email'
								placeholder='Email'
								required
								{...register('email', { validate: validateEmail })}
								className='dash-app-form-item-input'
							/>
							{errors.email && (
								<span style={{ color: 'red' }}>
									{errors.email.message ? String(errors.email.message) : "Email inválido"}
								</span>
							)}
						</div>

						<div className='dash-app-form-item'>
							<TextField
								label='Contraseña'
								placeholder='Contraseña'
								{...register('password')}
								className='dash-app-form-item-input'
								slotProps={{
                                    input: {
                                        autoComplete: 'password',
                                        type: showPassword ? 'text' : 'password',
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    aria-label='toggle password visibility'
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge='end'
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
							/>
							{errors.password && (
								<span style={{ color: 'red' }}>
									{errors.password.message ? String(errors.password.message) : "Contraseña Inválida"}
								</span>
							)}
							
							<Link
								className='link link--secondary'
								style={{ marginLeft: 'auto' }}
								href='/reset-password'
							>
								Resetear contraseña
							</Link>
						</div>

						{errorMessage && (
							<Box sx={{ mb: 2 }}>
								<Alert severity="error" variant="filled">
									{errorMessage}
								</Alert>
							</Box>
						)}

						<div className='dash-app-form-item mt-1'>
							<LoadingButton
								style={{ marginBottom: '21px' }}
								className='submit'
								type='submit'
								disabled={loginLoading}
								variant='contained'
							>
								{loginLoading ? 'Cargando...' : 'Ingresar'}
							</LoadingButton>
						</div>
					</form>
				) : (
					<>
						<div className='dash-app-form-item'>
							Ya se encuentra logueado
						</div>
						<Button onClick={() => navigate('/')}>
							Ir al Home
						</Button>
					</>
				)}
			</>
        </FullLayoutMarkup>
    );
};

export default LoginPage;
