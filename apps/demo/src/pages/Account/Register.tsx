/* eslint-disable jsdoc/check-tag-names */
import React, { createRef, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';

import { useNavigate } from 'react-router-dom';

import { useNotify } from 'react-admin';

import ReCAPTCHA from 'react-google-recaptcha';

import { Grid, IconButton, TextField } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { DASH_REDUX_ACTIONS } from 'dash-admin-state';

import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { useAxios} from 'dash-axios-hook';

import { useDialog } from 'dash-dialog';
import DASHAppConstants from 'dash-constants';
import { RutValidator } from 'dash-admin/src/utils/validators';
import { FullLayoutMarkup } from 'dash-default-theme';

/**
 * Renders the Register page for the application.
 * 
 * This component handles the registration process for new users, including:
 * - Displaying a form with fields for email, eCommerce name, RUT, name, last name, password, confirm password, and phone number.
 * - Validating the form data using the `react-hook-form` library.
 * - Submitting the form data to the server using the `axios` library.
 * - Displaying success or error messages using the `react-admin` `useNotify` hook.
 * - Navigating to the home page upon successful registration.
 * - Optionally displaying a reCAPTCHA widget if the `RECAPTCHA_ENABLED` constant is true.
 */
const RegisterPage = () => {

	const enableRecaptcha: boolean = DASHAppConstants.system.RECAPTCHA_ENABLED;
	const recaptchaRef = createRef<ReCAPTCHA>();
	const [recpatcha, setRecaptcha] = useState(null);

	const dispatch = useDispatch();
    const dialog = useDialog();
    /*const panelSettings = useSelector(
		(state: IDASHAppState<IDomainUser, IDomainAuth, IDashAutoAdminResourceConfig>) =>
			state.common.panelSettings,
	);*/

	/* @ts-ignore Expected */
	const dict = React.useContext(DictionaryContext);
	const navigate = useNavigate();
	const form = useForm();
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors },
	} = form;
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
	
        //clearErrors();
        //debugger;

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
			const response = await axios.post('/auth/client/register', data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			if (response.status >= 200) {
				notify('El usuario ha sido registrado', { type: 'success' });
				navigate('/');
			} else {
				dialog({
					variant: 'danger',
					title: 'Error',
					content: 'Ha ocurrido un error, inténtelo nuevamente',
				});
			}
		} catch (error: any) {
			
			for (const key in error) {
				if (key === 'client.name') {
					setError('clientname', {
						type: 'custom',
						message: dict.get(error[key],true),
					});
				}
				setError(key, { type: 'custom', message: dict.get(error[key],true) });
			}
		}
	}

	return (
		<FullLayoutMarkup>
			<form onSubmit={handleSubmit(onSubmit)} className='dash-app-login-form'>
				<Grid container spacing={0}>
					<Grid item xs={2}>
						<IconButton
							color={'primary'}
							size={'large'}
							onClick={() => {
								navigate('/');
							}}
						>
							<HomeIcon />
						</IconButton>
					</Grid>
					<Grid item xs={10}>
						<h1 className='dash-app-login-form-title'>Crear cuenta</h1>
					</Grid>
				</Grid>

				<div className='dash-app-form-item'>
				
					<TextField
						placeholder='Email'
						label='Email'
						required
						{...register('email')}
						inputProps={{ type: 'email'}}
						className='dash-app-form-item-input'
					/>
					{errors.email && (
						<span style={{ color: 'red' }}>
							{errors.email.message as React.ReactNode}
						</span>
					)}
				</div>
				<div className='dash-app-form-item'>
					
					<TextField
						placeholder='Nombre eCommerce'
						label='Nombre eCommerce'
						required
						className='dash-app-form-item-input'
						{...register('clientname')}
					/>
					{errors.clientname && (
						<span style={{ color: 'red' }}>
							{errors.clientname.message as React.ReactNode}
						</span>
					)}
				</div>

				<div className='dash-app-form-item'>
				
					<TextField
					  placeholder='11.111.111-1'
					  label='Rut'
					  required
						className='dash-app-form-item-input'
						{...register('public_id',{ validate: RutValidator })}
					/>
					{errors.public_id && (
						<span style={{ color: 'red' }}>
							{(errors.public_id.message || <>Rut inválido</>) as React.ReactNode }
						</span>
					)}
				</div>

				<div className='dash-app-form-item'>
					
					<TextField
						placeholder='Nombre'
					  label='Nombre'
					  required
						className='dash-app-form-item-input'
						{...register('name')}
					/>
					{errors.name && (
						<span style={{ color: 'red' }}>
							{errors.name.message as React.ReactNode}
						</span>
					)}
				</div>

				<div className='dash-app-form-item'>
					
					<TextField
						placeholder='Apellidos'
						label='Apellidos'
						required
					
						className='dash-app-form-item-input'
						{...register('lastname')}
					/>
					{errors.lastname && (
						<span style={{ color: 'red' }}>
							{errors.lastname.message as React.ReactNode}
						</span>
					)}
				</div>

				<div className='dash-app-form-item'>
					
					<TextField
					
						placeholder='Contraseña'
						label='Contraseña'
						required
						type='password'
						className='dash-app-form-item-input'
						{...register('password')}
					/>
					{errors.password && (
						<span style={{ color: 'red' }}>
							{errors.password.message as React.ReactNode}
						</span>
					)}
				</div>

				<div className='dash-app-form-item'>
					
					<TextField
							placeholder='Confirmar contraseña'
							label='Confirmar contraseña'
							required
					
						className='dash-app-form-item-input'
						type='password'
						{...register('confirm_password')}
					/>
					{errors.confirm_password && (
						<span style={{ color: 'red' }}>
							{errors.confirm_password.message as React.ReactNode}
						</span>
					)}
				</div>

				<div className='dash-app-form-item'>
	
					<TextField
					
					label='Teléfono de Contacto'
					required
						placeholder='+569 1234 5678'
						className='dash-app-form-item-input'
						{...register('phone')}
					/>
					{errors.phone && (
						<span style={{ color: 'red' }}>
							{errors.phone.message as React.ReactNode}
						</span>
					)}
				</div>

				<div className='dash-app-form-item mb-0'>
					<Grid container spacing={2}>
						{enableRecaptcha ? (
							<>
								<Grid item xs={12}>
									<ReCAPTCHA
										ref={recaptchaRef}
										sitekey={DASHAppConstants.system.RECAPTCHA_TOKEN}
										onChange={onChangeRecaptcha}
									/>
									{/* @ts-ignore 'ReCAPTCHA' cannot be used as a JSX component. */}
								</Grid>
								{/*<Grid item xs={2}>
									<IconButton
										onClick={(_e) => {

											recaptchaRef.current.reset();
										}}
									>
										<RefreshIcon />
									</IconButton>
									</Grid>*/}

								<Grid item xs={12}>
									{errors['g-recaptcha-response'] && (
										<span style={{ color: 'red' }}>
											{errors['g-recaptcha-response'].message as React.ReactNode}
										</span>
									)}
								</Grid>
							</>
						) : <></>}
					</Grid>
				</div>

				<div className='dash-app-form-item mb-0'>
					
					<Button
							disabled={!recpatcha && enableRecaptcha}
							type='submit'
							fullWidth
							variant={'contained'}
                            onClick={(_e) => clearErrors()}
						>
							Crear Cuenta
						</Button>
				</div>
				<div className='dash-app-form-item mb-0'>
					<Button className='default' onClick={(_e) => clearErrors()}>
						Cancelar
					</Button>
				</div>
			</form>
		</FullLayoutMarkup>
	);
};
export default RegisterPage;
