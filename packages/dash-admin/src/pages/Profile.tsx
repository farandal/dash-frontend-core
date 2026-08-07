import { FC, useEffect, useState } from 'react';

import { Button, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';

import {
	Form,
	useRefresh,
	Loading,
	useNotify,
	useTranslate,
	TextInput,
} from 'react-admin';

import { useDispatch } from 'react-redux';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';

import React from 'react';
import { useAxios } from 'dash-axios-hook';
import { SingleImageUploader } from 'dash-components';
import { useAuthContext } from '../contexts/auth';
import UserPreferences from '../components/user/UserPreferences';

const Profile: FC = (_props) => {
	const [currTab, setCurrTab] = useState('auth/update/info');
	const [isLoading, setIsLoading] = useState(false);

	const { user, fetchAuth } = useAuthContext();
	const [avatar, setAvatar] = useState({ rawFile: null, urlFile: '' });
	const notify = useNotify();
	const translate = useTranslate();

	const axios = useAxios();
	const refresh = useRefresh();

	const { showPreferences = false } = _props;

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(
			DASH_REDUX_ACTIONS.updatePage({
				title: translate('profile.title', { _: 'Perfil' }),
				//icon:
				subTitle: translate('profile.subtitle', { _: 'Configuración de perfil' }),
			}),
		);
		// translate is included so the page header re-translates on locale change
		// (react-admin returns a new translate reference when the locale changes)
	}, [translate]);

	const validateUserCreation = (values) => {
		const errors: any = {};
		if (currTab === 'auth/update/password') {
			const required = translate('profile.validation.required', { _: 'El campo es requerido' });
			const mismatch = translate('profile.validation.password_mismatch', { _: 'Las contraseñas no coinciden' });

			if (
				(values.password || values.password_confirmation) &&
				!values.current_password
			) {
				errors.current_password = required;
			}
			if (
				values.current_password &&
				(!values.password || !values.password_confirmation)
			) {
				errors.password = required;
				errors.password_confirmation = required;
			}
			if (values.password_confirmation !== values.password) {
				errors.password = mismatch;
				errors.password_confirmation = mismatch;
			}
		}

		return errors;
	};

	const handleSubmit = async (values) => {
		setIsLoading(true);

		const formData = new FormData();

		const passwords = {
			current_password: values.current_password,
			password: values.password,
			password_confirmation: values.password_confirmation,
		};

		// Append all user info fields to formData
		if (values.name) { formData.append('name', values.name); }
		if (values.lastname) { formData.append('lastname', values.lastname); }
		if (values.email) { formData.append('email', values.email); }
		if (avatar.rawFile) { formData.append('avatar', avatar.rawFile); }
		formData.append('_method', 'put');

		try {
			if (currTab === 'auth/update/info') {
				await axios.post(currTab, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			} else {
				await axios.put(currTab, passwords);
			}

			// Refresh the auth context with updated user data
			try {
				await fetchAuth();
				console.log('Auth context refreshed after profile update');
			} catch (authError) {
				console.error('Failed to refresh auth context:', authError);
				// Don't show error to user as the main operation succeeded
			}

			notify(translate('profile.notify.success', { _: 'Usuario actualizado correctamente' }), { type: 'success' });
			refresh();
		} catch (error: any) {

			// Handle backend error messages gracefully
			let mainMessage = error?.response?.data?.message || error?.body?.message || '';
			let fieldErrors = error?.response?.data?.errors || error?.body?.errors || error;
			if (mainMessage) {
				notify(translate('profile.notify.error_with_message', { message: mainMessage, _: `Error al actualizar el usuario, ${mainMessage}` }), { type: 'error' });
			} else {
				notify(translate('profile.notify.error', { _: 'Error al actualizar el usuario' }), { type: 'error' });
			}
			if (fieldErrors && typeof fieldErrors === 'object') {
				const errors: any = {};
				Object.keys(fieldErrors).forEach((key) => {
					errors[key] = Array.isArray(fieldErrors[key])
						? fieldErrors[key].join(' , ')
						: fieldErrors[key];
				});
				return errors;
			}
		} finally {
			setIsLoading(false);
			// TechDebt: the avatar update doesn't reflect immediately after the update, this is a quick fix to reload the page and show the new avatar, ideally we should update the auth context with the new avatar url and avoid reloading the page
			window.location.reload();
		}
	};

	const handleInfoSubmit = () => {
		setCurrTab('auth/update/info');
	};

	const handlePasswordSubmit = () => {
		setCurrTab('auth/update/password');
	};

	return (
        <div className='dash-profile'>

            {user ? (
				<Form
					onSubmit={handleSubmit}
					validate={validateUserCreation}
					defaultValues={{ name: user?.name, email: user?.email, lastname: user?.lastname }}
					className='dash-form'
				>

					<div className='dash-card-content dash-module dash-card-profile'>

						<Grid
							container
							spacing={{ xs: 2, md: 3 }}
							sx={{ minHeight: '400px' }}
						>
							{/* Profile Image Section */}
							<Grid
                                size={{ xs: 12, md: 4 }}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
								<CardContent
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										width: '100%',
									}}
								>
									<SingleImageUploader
										currentUrl={user?.image_path}
										onChange={(file: File) => {
											setAvatar({
												rawFile: file,
												urlFile: URL.createObjectURL(file),
											});
										}}
										classNamePrefix='dash-profile'
									/>
									<Typography
										className='dash-profile-name'
										variant='h2'
										sx={{ mt: 2, textAlign: 'center' }}
									>
										{`${user?.name || ''}`}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											display: 'block',
											textAlign: 'center',
											fontSize: '14px',
											opacity: 0.54,
											mt: 1,
										}}
									>
										{/* Cargo, telefono, etc. */}
									</Typography>
								</CardContent>
							</Grid>

							{/* User Info Section */}
							<Grid size={{ xs: 12, md: 4 }}>
								<CardHeader
									sx={{ padding: '16px 25px 0' }}
									title={translate('profile.info.title', { _: 'Info' })}
								/>
								<CardContent sx={{ padding: '25px' }}>
									<Grid container spacing={2}>
										<Grid size={12}>
											<TextInput
												source='name'
												label={translate('profile.info.name', { _: 'Nombre' })}
												variant='outlined'
												fullWidth
											/>
										</Grid>
										<Grid size={12}>
											<TextInput
												source='lastname'
												label={translate('profile.info.lastname', { _: 'Apellido' })}
												variant='outlined'
												fullWidth
											/>
										</Grid>
										<Grid size={12}>
											<TextInput
												source='email'
												label={translate('profile.info.email', { _: 'Email' })}
												variant='outlined'
												fullWidth
											/>
										</Grid>
										<Grid size={12} sx={{ mt: 2 }}>
											<Button
												onClick={handleInfoSubmit}
												disabled={isLoading}
												variant='contained'
												type='submit'
												fullWidth
												sx={{
													position: 'relative',
													'&.Mui-disabled': {
														backgroundColor: 'primary.main',
														opacity: 0.7,
														color: 'white'
													}
												}}
											>
												{isLoading && currTab === 'auth/update/info'
													? translate('profile.info.saving', { _: 'Guardando...' })
													: translate('profile.info.save', { _: 'Guardar' })}
											</Button>
										</Grid>
									</Grid>
								</CardContent>
							</Grid>

							{/* Password Section */}
							<Grid size={{ xs: 12, md: 4 }}>
								<CardHeader
									sx={{ padding: '16px 25px 0' }}
									title={translate('profile.password.title', { _: 'Contraseñas' })}
								/>
								<CardContent sx={{ padding: '25px' }}>
									<Grid container spacing={2}>
										<Grid size={12}>
											<TextInput
												type='password'
												source='current_password'
												label={translate('profile.password.current', { _: 'Contraseña actual' })}
												variant='outlined'
												fullWidth
											/>
										</Grid>
										<Grid size={12}>
											<TextInput
												type='password'
												source='password'
												label={translate('profile.password.new', { _: 'Nueva contraseña' })}
												variant='outlined'
												fullWidth
											/>
										</Grid>
										<Grid size={12}>
											<TextInput
												label={translate('profile.password.confirm', { _: 'Repita nueva contraseña' })}
												type='password'
												source='password_confirmation'
												variant='outlined'
												fullWidth
											/>
										</Grid>
										<Grid size={12} sx={{ mt: 2 }}>
											<Button
												onClick={handlePasswordSubmit}
												disabled={isLoading}
												variant='contained'
												type='submit'
												fullWidth
												sx={{
													position: 'relative',
													'&.Mui-disabled': {
														backgroundColor: 'primary.main',
														opacity: 0.7,
														color: 'white'
													}
												}}
											>
												{isLoading && currTab === 'auth/update/password'
													? translate('profile.password.saving', { _: 'Guardando Contraseñas...' })
													: translate('profile.password.save', { _: 'Guardar Contraseñas' })}
											</Button>
										</Grid>
									</Grid>
								</CardContent>
							</Grid>

							{/* User Preferences Section */}
							{showPreferences && (
								<Grid size={{ xs: 12 }}>
									<CardContent sx={{ padding: '25px' }}>
										<UserPreferences />
									</CardContent>
								</Grid>
							)}

						</Grid>
					</div>

				</Form>

			) : (
				<Loading />
			)}
        </div>
    );
};

export default Profile;
