import { Button, Input, InputLabel } from '@mui/material';

import React, { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { Link, useSearchParams } from 'react-router-dom';
import useAxios from '../hooks/axios';

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

const ChangePassword = () => {
	const redirect = useRedirect();
	let [searchParams] = useSearchParams();
	const urlQuery: any = getUrlParamsObject(searchParams.entries());
	const [password, setPassword] = useState('');
	const [rePassword, setRePassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { axios } = useAxios();
	const notify = useNotify();

	useEffect(() => {
		if (!urlQuery.token || !urlQuery.email) {
			redirect('/login');
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (password === rePassword) {
			setError('');
			setLoading(true);
			try {
				const { data } = await axios.post(`password/reset`, {
					password,
					password_confirmation: rePassword,
					token: urlQuery?.token,
					email: urlQuery?.email,
				});
				notify(data.message);
				redirect('/login');
			} catch (error: any) {
				console.log(JSON.stringify(error));
				if (error.status === 422 && typeof error.body.message === 'string')
					setError(error.body.message);
				else
					notify(error?.body?.message || 'Error al cambiar contraseña', {
						type: 'error',
					});
			} finally {
				setLoading(false);
			}
		} else {
			setError('Las contraseñas no coinciden');
		}
	};

	return (
		<div className='ant-layout dash-app-layout'>
			<div className='dash-app-login-wrap'>
				<div className='dash-app-login-container'>
					<div className='dash-app-login-main-content'>
						<div className='dash-app-logo-content'>
							<div className='dash-app-logo-content-bg'>
								{/*<img src={"https://via.placeholder.com/272x395"} alt='Neature'/>*/}
							</div>
							<div className='dash-app-logo-wid'>
								{/* <h1><IntlMessages id="app.userAuth.signIn"/></h1>
                <p><IntlMessages id="app.userAuth.bySigning"/></p>
    <p><IntlMessages id="app.userAuth.getAccount"/></p>*/}
							</div>
							<div className='dash-app-login-logo'>{/* <Logo />*/}</div>
						</div>
						<div className='dash-app-login-content'>
							<form onSubmit={handleSubmit}>
								<InputLabel id='demo-simple-select-label'>
									Contraseña
								</InputLabel>

								<Input
									name='password'
									type='password'
									value={password}
									readOnly={loading}
									onChange={(e) => {
										setError('');
										setPassword(e.target.value);
									}}
								/>
								<br />
								{error && <span style={{ color: 'red' }}>{error}</span>}
								<br />
								<InputLabel id='demo-simple-select-label'>
									Repetir Contraseña
								</InputLabel>

								<Input
									name='password_confirmation'
									type='password'
									value={rePassword}
									readOnly={loading}
									onChange={(e) => {
										setError('');
										setRePassword(e.target.value);
									}}
								/>
								<br />
								{error && <span style={{ color: 'red' }}>{error}</span>}
								<br />
								<br />
								<Button
									type='submit'
									variant='contained'
									color='primary'
									disabled={loading}
								>
									{loading ? 'Cargando...' : 'Resetear contraseña'}
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChangePassword;
