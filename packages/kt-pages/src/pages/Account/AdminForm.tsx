import { FC, useContext, useEffect, useState } from 'react';

import * as Icon from 'react-feather';
import { Button as LoadingButton } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import {
	Card,
	CardContent,
	CardHeader,
	Grid,
	IconButton,
	InputAdornment,
	TextField,
} from '@mui/material';

import {
	useRefresh,
	useUpdate,
	useNotify,
} from 'react-admin';

import { useDispatch } from 'react-redux';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useAxios} from 'dash-axios-hook';
import { useForm } from 'react-hook-form';
import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import { SingleImageUploader } from 'dash-components';


import { RutValidator } from 'kt-utils';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';

const AdminForm: FC = () => {
	const { user } = useAuthContext();

	const formDefaultValues = {
		name: user.name,
		email: user.email,
		lastname: user.lastname,
		public_id: user.public_id,
		phone: user.phone,
		current_password: '',
		password: '',
		password_confirmation: '',
		avatar: user.image_path,
	};


	const [currTab, setCurrTab] = useState('auth/update/info');
	const form = useForm({ defaultValues: formDefaultValues });
	const dict = useContext(DictionaryContext);

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleClickShowCurrentPassword = () =>
		setShowCurrentPassword((show) => !show);
	const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
	const handleClickShowConfirmPassword = () =>
		setShowConfirmPassword((show) => !show);

	const handleMouseDownPassword = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
	};

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, defaultValues },
	} = form;

	const [avatar, setAvatar] = useState({ rawFile: null, urlFile: '' });
	const notify = useNotify();
	const [, { isLoading }] = useUpdate();
	const axios = useAxios();
	const refresh = useRefresh();

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(
			DASH_REDUX_ACTIONS.updatePage({
				title: 'Perfil',
				//icon:
				subTitle: 'Configuración de perfil',
			}),
		);
	}, []);

	const updateProfile = async (values) => {
		const formData = new FormData();

		const passwords = {
			current_password: values.current_password,
			password: values.password,
			password_confirmation: values.password_confirmation,
		};

		if (values.name) {
			formData.append('name', values.name);
		}
		if (values.email) {
			formData.append('email', values.email);
		}
		if (values.public_id) {
			formData.append('public_id', values.public_id);
		}
		if (values.phone) {
			formData.append('phone', values.phone);
		}

		if (avatar.rawFile) {
			formData.append('avatar', avatar.rawFile);
		}

		formData.append('_method', 'put');

		try {

			if (currTab === 'auth/update/info') {

				await axios.post(currTab, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});

			} else {

				await axios.put(currTab, passwords);

			}

			notify('Usuario actualizado correctamente',{type:'success'});
			refresh();

		} catch (error: any) {

			notify(`Error al actualizar el usuario, ${error?.body?.message || ''}`, {
				type: 'error',
			});

			let hasKeyErrors = false;

			for (const key in error) {	
				if (Object.keys(defaultValues).includes(key)) {
					/* @ts-ignore key type mismatch */
					setError(key, { type: 'custom', message: dict.get(error[key][0]) });
					hasKeyErrors = true;
				}
			}

			if(hasKeyErrors) return;
			
			window.dispatchEvent(
				new MessageEvent('GlobalError', {
					data: { error: error.response.data || error,  dialog: true, toast: false}
				}),
			);

		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit(updateProfile)} className='dash-form'>
				<Card className='dash-card-content dash-module dash-card-profile'>
					<Grid container spacing={2} sx={{ justifyContent: 'space-evenly' }}>
						<Grid item xs={12} md={4}>
							<CardContent
								style={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
								}}
							>
								<SingleImageUploader
									classNamePrefix='dash-profile'
									currentUrl={user.image_path}
									onChange={(file: File) => {
										setAvatar({
											rawFile: file,
											urlFile: URL.createObjectURL(file),
										});
									}}
								/>
								<h2 className='dash-profile-name'
									
								>
									{`${user?.name || ''}`}
								</h2>
								{errors.avatar && (
										<span style={{ color: 'red' }}>
											{errors.avatar.message as string}
										</span>
								)}
							</CardContent>
						</Grid>
						<Grid item xs={12} md={4}>
							<CardHeader style={{ padding: '16px 25px 0' }} title='Info' />
							<CardContent sx={{ p: 3 }}>
								<div className='dash-app-form-item'>
									<TextField
										label='Nombre'
										placeholder='Nombre'
										required
										{...register('name')}
										className='dash-app-form-item-input'
									/>
									{errors.name && (
										<span style={{ color: 'red' }}>
											{errors.name.message as string}
										</span>
									)}
								</div>

								<div className='dash-app-form-item'>
									<TextField
										label='Apellido'
										placeholder='Apellido'
										required
										{...register('lastname')}
										className='dash-app-form-item-input'
									/>
									{errors.name && (
										<span style={{ color: 'red' }}>
											{errors.name.message as string}
										</span>
									)}
								</div>

								<div className='dash-app-form-item'>
									<TextField
										label='Email'
										placeholder='Email'
										required
										{...register('email')}
										className='dash-app-form-item-input'
									/>
									{errors.email && (
										<span style={{ color: 'red' }}>
											{errors.email.message as string}
										</span>
									)}
								</div>

								<div className='dash-app-form-item'>
									<TextField
										label='RUT'
										placeholder='11.111.111-k'
										required
										{...register('public_id', {
											validate: {
												validateRut: (value) => {
													return RutValidator(value) || 'Rut Inválido';
												},
											},
										})}
										className='dash-app-form-item-input'
									/>
									{errors.public_id && (
										<span style={{ color: 'red' }}>
											{errors.public_id.message as string}
										</span>
									)}
								</div>

								<div className='dash-app-form-item'>
									<TextField
										label='Teléfono'
										placeholder='+569XXXXXXX'
										required
										{...register('phone')}
										className='dash-app-form-item-input'
									/>
									{errors.phone && (
										<span style={{ color: 'red' }}>
											{errors.phone.message as string}
										</span>
									)}
								</div>

								<LoadingButton
									onClick={() => setCurrTab('auth/update/info')}
									loading={
										isLoading && currTab === 'auth/update/info' ? true : false
									}
									//loadingPosition="end"
									variant='contained'
									type='submit'
								>
									Guardar
								</LoadingButton>
							</CardContent>
						</Grid>
						<Grid item xs={12} md={4}>
							<CardHeader
								style={{ padding: '16px 25px 0' }}
								title='Contraseñas'
							/>
							<CardContent sx={{ p: 3 }}>
								<div >
									<TextField
										label='Contraseña Actual'
										placeholder='Contraseña'
										//required
										{...register('current_password')}
										className='dash-app-form-item-input'
										InputProps={{
											type: showCurrentPassword ? 'text' : 'password',
											endAdornment: (
												<InputAdornment position='end'>
													<IconButton
														aria-label='toggle password visibility'
														onClick={handleClickShowCurrentPassword}
														onMouseDown={handleMouseDownPassword}
														edge='end'
													>
														{showCurrentPassword ? (
															<VisibilityOff />
														) : (
															<Visibility />
														)}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
									{errors.current_password && (
										<span style={{ color: 'red' }}>
											<>{errors.current_password.message}</>
										</span>
									)}
								</div>
								<div >
									<TextField
										label='Contraseña Nueva'
										placeholder='Contraseña'
										//required
										{...register('password')}
										className='dash-app-form-item-input'
										InputProps={{
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
											<>{errors.password.message}</>
										</span>
									)}
								</div>
								<div >
									<TextField
										label='Repetir Contraseña'
										placeholder='Contraseña'
										//required
										{...register('password_confirmation')}
										className='dash-app-form-item-input'
										InputProps={{
											type: showConfirmPassword ? 'text' : 'password',
											endAdornment: (
												<InputAdornment position='end'>
													<IconButton
														aria-label='toggle password visibility'
														onClick={handleClickShowConfirmPassword}
														onMouseDown={handleMouseDownPassword}
														edge='end'
													>
														{showConfirmPassword ? (
															<VisibilityOff />
														) : (
															<Visibility />
														)}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
									{errors.password_confirmation && (
										<span style={{ color: 'red' }}>
											<>{errors.password_confirmation.message}</>
										</span>
									)}
								</div>

								<LoadingButton
									onClick={() => setCurrTab('auth/update/password')}
									loading={
										isLoading && currTab === 'auth/update/password'
											? true
											: false
									}
									variant='contained'
									type='submit'
								>
									Guardar
								</LoadingButton>
							</CardContent>
						</Grid>
					</Grid>
				</Card>
			</form>
		</div>
	);
};

export default AdminForm;
