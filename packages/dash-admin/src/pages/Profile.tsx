import { FC, useEffect, useState } from 'react';
//import { Button as LoadingButton } from "@mui/material";

import { Button, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';

import {
	Form,
	useRefresh,
	Loading,
	useNotify,
	useGetIdentity,
	TextInput,
} from 'react-admin';

import { useDispatch } from 'react-redux';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';

import React from 'react';
import useAxios from '../hooks/axios';
import SingleImageUploader from './SingleImageUploader';

const Profile: FC = (_props) => {
	const [currTab, setCurrTab] = useState('auth/update/info');
	const { identity, isLoading: identityLoading } = useGetIdentity();
	const [avatar, setAvatar] = useState({ rawFile: null, urlFile: '' });
	const notify = useNotify();
	
	const { axios } = useAxios();
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

	const validateUserCreation = (values) => {
		const errors: any = {};
		if (currTab === 'auth/update/password') {
			if (
				(values.password || values.password_confirmation) &&
				!values.current_password
			) {
				errors.current_password = 'El campo es requerido';
			}
			if (
				values.current_password &&
				(!values.password || !values.password_confirmation)
			) {
				errors.password = 'El campo es requerido';
				errors.password_confirmation = 'El campo es requerido';
			}
			if (values.password_confirmation !== values.password) {
				errors.password = 'Las contraseñas no coinciden';
				errors.password_confirmation = 'Las contraseñas no coinciden';
			}
		}

		return errors;
	};

	const handleSubmit = async (values) => {
		const formData = new FormData();

		const passwords = {
			current_password: values.current_password,
			password: values.password,
			password_confirmation: values.password_confirmation,
		};

		if (values.name) { formData.append('name', values.name); }
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
			notify('Usuario actualizado correctamente', { type:'success' });
			refresh();
			// const res = await axios.put(`/user/${identity.id}`, {...identity, ...values});
			// notify('Usuario actualizado correctamente');
		} catch (error: any) {
			notify(`Error al actualizar el usuario, ${error?.body?.message || ''}`, {
				type: 'error',
			});

			if (error?.response?.data?.errors) {
				const errors: any = {};
				Object.keys(error.response.data.errors).forEach((key) => {
					errors[key] = error.response.data.errors[key].join(' , ');
				});
				return errors;
			}
		}
	};

	return (
		<>
			{/*Page Header
      <Row>
        <Col xs={24} md={12}>
          <div className="dash-mb-2">
            <h2 className="dash-page-title">Perfil</h2>
          </div>
        </Col>
      </Row>
      */}

			{!identityLoading && identity ? (
				<Form
					onSubmit={handleSubmit}
					validate={validateUserCreation}
					defaultValues={{ name: identity.name, email: identity.email }}
					className='dash-form'
				>
                   
					<Card className='dash-card-content dash-card-profile'>
						<Grid container>
							<Grid item xs={12} md={4}>
								<CardContent
									style={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
									}}
								>
									{/*<div className='dash-profile-img'>
										{identity.image_url || avatar.urlFile ? (
											<img src={avatar.urlFile || identity.image_url} alt='' />
										) : (
											<div className='dash-profile-icon'>
												<Icon.User size={'90px'} color={'#fff'} />
											</div>
										)}
										<IconButton
											aria-label='upload picture'
											component='label'
											className='dash-profile-edit'
										>
											<input
												hidden
												accept='image/*'
												type='file'
												onChange={(e) =>
													setAvatar({
														rawFile: e.target.files[0],
														urlFile: URL.createObjectURL(e.target.files[0]),
													})
												}
											/>
											<Icon.PenTool
												size={'22px'}
												color={'#000'}
												style={{ opacity: '0.6' }}
											/>
										</IconButton>
											</div>*/}
                                   
									<SingleImageUploader currentUrl={identity.image_path} onChange={(file:File) => {
										setAvatar({
											rawFile: file,
											urlFile: URL.createObjectURL(file),
										});
									}}  />
									<Typography
										variant="h2"
										style={{
											display: 'block',
											textAlign: 'center',
											fontSize: '20px',
											fontWeight: 'bold',
											
										}}
									>
										{`${identity?.name || ''}`}
									</Typography>
									<Typography
										variant="body2"
										style={{
											display: 'block',
											textAlign: 'center',
											fontSize: '14px',
											opacity: '0.54',
										}}
									>
										{/* Cargo, telefono, etc. */}
									</Typography>
								</CardContent>
							</Grid>
							<Grid item xs={12} md={4}>
								<CardHeader style={{ padding: '16px 25px 0' }} title='Info' />
								<CardContent style={{ padding: '25px' }}>
									<div className='dash-mb-4'>
										<TextInput
											source='name'
											label='Nombre'
											variant='outlined'
										/>
									</div>
									<div className='dash-mb-4'>
										<TextInput
											source='lastname'
											label='Apellido'
											variant='outlined'
										/>
									</div>
									<div className='dash-mb-4'>
										<TextInput
											source='email'
											label='Email'
											variant='outlined'
										/>
									</div>

									<Button
										onClick={() => setCurrTab('auth/update/info')}
										/*loading={
											isLoading && currTab === 'auth/update/info' ? true : false
										}
										loadingPosition='end'*/
										variant='contained'
										type='submit'
									>
										Guardar
									</Button>
								</CardContent>
							</Grid>
							<Grid item xs={12} md={4}>
								<CardHeader
									style={{ padding: '16px 25px 0' }}
									title='Contraseñas'
								/>
								<CardContent style={{ padding: '25px' }}>
									<div className='dash-mb-4'>
										<TextInput
											type='password'
											source='current_password'
											label='Contraseña actual'
											variant='outlined'
										/>
									</div>
									<div className='dash-mb-4'>
										<TextInput
											type='password'
											source='password'
											label='Nueva contraseña'
											variant='outlined'
										/>
									</div>
									<div className='dash-mb-4'>
										<TextInput
											label='Repita nueva contraseña'
											type='password'
											source='password_confirmation'
											variant='outlined'
										/>
									</div>

									<Button
										onClick={() => setCurrTab('auth/update/info')}
										/*loading={
											isLoading && currTab === 'auth/update/password'
												? true
												: false
										}
										loadingPosition='end'*/
										variant='contained'
										type='submit'
									>
										Guardar Contraseñas
									</Button>
								</CardContent>
							</Grid>
						</Grid>
					</Card>
			
				</Form>
				
			) : (
				<Loading />
			)}
		</>
	);
};

export default Profile;
