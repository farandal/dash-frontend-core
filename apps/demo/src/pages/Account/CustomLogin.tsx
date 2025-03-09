import React, { useContext, useEffect, useState } from 'react';

import { useAuthState } from 'react-admin';

import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button as LoadingButton } from "@mui/material";

import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { useLogin } from 'react-admin';
import { useNotify } from 'react-admin';

import { IconButton, InputAdornment, TextField } from '@mui/material';

import successSource from '@app/assets/sounds/success.mp3';
import errorSource from '@app/assets/sounds/error.mp3';

import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useNavigate } from 'react-router';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { ConstantsContext, IConstantContext } from 'dash-admin/src/config/ConstantsService';
import DASHAppConstants, { IDASHAppConstants } from 'dash-constants';
import { FullLayoutMarkup } from 'dash-default-theme';

const LoginPage: React.FC = (_props) => {
	//const { data, isIdentityLoading, error } = useGetIdentity();

	const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

	const validateEmail = (value) => {
    return EMAIL_REGEX.test(value);
  };

	const { isLoading, authenticated } = useAuthState();

	const [loggedIn, setLoggedIn] = useState(false);
	const dispatch = useDispatch();
	//const { login } = authProvider;
	const login = useLogin();
	/*const panelSettings = useSelector(
    (state: IDASHAppState<IDomainUser, IDomainAuth, IDashAutoAdminResourceConfig>) =>
      state.common.panelSettings
  );*/

	//const constants = useContext<IConstantContext<IDASHAppConstants>>(ConstantsContext);
	

	const dict = React.useContext(DictionaryContext);

	const form = useForm();
	
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	useEffect(() => {
		dispatch(
			DASH_REDUX_ACTIONS.updatePage({
				title: null,
			}),
		);
	}, []);

	useEffect(() => {
		if (
			authenticated &&
			JSON.parse(localStorage.getItem('authenticated')) === true
		) {
			setLoggedIn(true);
		} else {
			setLoggedIn(false);
		}
	}, [isLoading]);

	const navigate = useNavigate();
	const notify = useNotify();
	const [loginLoading, setLoginLoading] = useState(false);

	async function onSubmit(data, _e) {
		const password = data.password;
		setLoginLoading(true);
		login({ username: data.email, password })
			.then(() => {
				
				if(!!DASHAppConstants.system.LOGIN_SOUNDS) {
					const audio = new Audio(successSource);
					audio.load();
					audio.play();
				}

				/*notify('DASH!', {
					type: 'success',
					anchorOrigin: { vertical: 'top', horizontal: 'right' },
				});*/

				setLoginLoading(false);
				navigate('/');
			})
			.catch((error) => {
       
				if(!!DASHAppConstants.system.LOGIN_SOUNDS) {
				const audio = new Audio(errorSource);
				audio.load();
				audio.play();
				}
				setLoginLoading(false);
				let eMessage = 'Credenciales inválidas';
				if(error && error.response && error.response.data &&   error.response.data.message) {
					eMessage =  error.response.data.message;
				}
				notify(eMessage, {
					type: 'error',
					anchorOrigin: { vertical: 'top', horizontal: 'right' },
				});
			});
		//await axios.post("/auth/client/register", data, { headers: { "Content-Type": "multipart/form-data" } });
	}
	const [showNewPassword, setShowNewPassword] = useState(false);
	const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
	const handleMouseDownPassword = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
	};

	return (
		<FullLayoutMarkup>
			<>
				{!loggedIn ? (
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='dash-app-login-form'
					>
						<h1 className='dash-app-login-form-title'>
							Ingresar
						</h1>
						<div className='dash-app-form-item'>
							{/*<InputLabel>
								<strong>Email </strong>
							</InputLabel>
							<TextField
								key={'email'}
								placeholder='Email'
								required
								{...register('email')}
								//className="dash-app-form-item-input"
				/>*/}

							<TextField
								label='Email'
								placeholder='Email'
								required
								{...register('email',{ validate: validateEmail })}
								className='dash-app-form-item-input'
							/>
							{errors.email && (
								<span style={{ color: 'red' }}>
									<>{errors.email.message ? dict.get(errors.email.message as string,true) : "Email inválido"}</>
								</span>
							)}


						</div>

						<div className='dash-app-form-item'>
							{/*<InputLabel>
								<strong>Contraseña</strong>
								</InputLabel>*/}
							<TextField
								label='Contraseña'
								placeholder='Contraseña'
								//required
								{...register('password')}
								className='dash-app-form-item-input'
								InputProps={{
									autoComplete: 'password',
									type: showNewPassword ? 'text' : 'password',
									endAdornment: (
										<InputAdornment position='end'>
											<IconButton
												aria-label='toggle password visibility'
												onClick={handleClickShowNewPassword}
												onMouseDown={handleMouseDownPassword}
												edge='end'
											>
												{showNewPassword ? (
													<VisibilityOff />
												) : (
													<Visibility />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							{errors.password && (
								<span style={{ color: 'red' }}>
									<>{errors.password.message ? dict.get(errors.password.message as string,true) : "Contraseña Inválida"}</>
								</span>
							)}
							<Link
								className='link link--dark-red'
								style={{ marginLeft: 'auto' }}
								href='/reset-password'
							>
								Resetear contraseña
							</Link>
						</div>

						<div className='dash-app-form-item mt-1'>
							<LoadingButton
								style={{ marginBottom: '21px' }}
								className='submit'
								type='submit'
								loading={loginLoading}
							>
								Ingresar
							</LoadingButton>
						</div>
						<div className='dash-app-form-item mt-1'>
							<Button
								onClick={() => navigate('/registrarse')}
								className='default'
							>
								Crear Cuenta
							</Button>
						</div>
					</form>
				) : (
					<>
						<div className='dash-app-form-item'>
							Ya se encuentra logueado
						</div>
						<Button
							onClick={() => navigate('/')}
						>
							Ir al Home
						</Button>
					</>
				)}
			</>
		</FullLayoutMarkup>
	);
};

export default LoginPage;
