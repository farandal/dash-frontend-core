
import { Button, Input, InputLabel, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useAxios} from 'dash-axios-hook';
import DictionaryContext from 'dash-admin/src/contexts/dictionary/DictionaryContext';
import FullLayoutMarkup from 'dash-admin/src/default-theme/FullLayoutMarkup';

//import { Logo } from './theme/containers/Sidebar/Logo';
//import IntlMessages from './theme/util/IntlMessages';

const getUrlParamsObject = (searchParams: any) => {
	let params: Record<string, any> = {};
	for (const entry of searchParams) {
		const [param, value] = entry;
		params = { ...params, [param]: value };
	}
	return Object.keys(params).length > 0 ? params : null;
};

const CustomChangePassword = (props) => {
    
    const {panelSettings} = props;

	const redirect = useRedirect();
	const [searchParams] = useSearchParams();
	const urlQuery: any = getUrlParamsObject(searchParams.entries());

	const [loading, setLoading] = useState(false);

	const axios = useAxios();
	const notify = useNotify();
	const dict = React.useContext(DictionaryContext);

	const form = useForm();
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors },
	} = form;

	useEffect(() => {
		if (!urlQuery.token || !urlQuery.email) {
			redirect('/login');
		}
	}, []);

	const onSubmit = async (formData) => {
	
			setLoading(true);

			try {
				const { data:response } = await axios.post('password/reset', {
					password: formData.password,
					password_confirmation: formData.confirm_password,
					token: urlQuery?.token,
					email: urlQuery?.email,
				});
				notify(response.message, {type:'success'});
				redirect('/login');
			} catch (error: any) {
				for (const key in error) {
					setError(key, {
						type: 'custom',
						message: dict.get(error[key], true),
					});
				}
				notify(error?.body?.message || 'Error al cambiar contraseña', {
					type: 'error',
				});

			} finally {
				setLoading(false);
			}
		
	};

	return (
		<FullLayoutMarkup logo={panelSettings?.horizontalLogo} loginBackground={panelSettings?.loginBackground}>
			<form onSubmit={handleSubmit(onSubmit)} className='dash-app-login-form'>
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
							{errors.password.message as string}
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
							{errors.confirm_password.message as string}
						</span>
					)}
				</div>

				<Button
					type='submit'
					variant='contained'
					color='primary'
					disabled={loading}
				>
					{loading ? 'Cargando...' : 'Resetear contraseña'}
				</Button>
			</form>
		</FullLayoutMarkup>
	);
};

export default CustomChangePassword;
