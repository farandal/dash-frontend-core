import React, { useEffect } from 'react';
import { useState } from 'react';
import { useLogin, useNotify, Notification } from 'react-admin';
import { Link } from 'react-router-dom';
//import IntlMessages from './theme/util/IntlMessages';
import { Button, Input, InputLabel } from '@mui/material';

import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import authProvider from '../providers/authProvider';
import { ConstantsContext } from '../config/ConstantsService';
import { dashStorage } from 'dash-utils';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = authProvider;
	const notify = useNotify();
	const constants = React.useContext(ConstantsContext);

	const panelSettings = useSelector(
		(state: IDASHAppState<any, any, any>) => state.common.panelSettings,
	);

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		login({ username: email, password })
			.then(() => {
				notify('Login ok!', { type: 'success' });
			})
			.catch(() => {
				notify('Error', { type: 'error' });
				setLoading(false);
			});
	};

	useEffect(() => {
		dashStorage.setItem(
			'roles',
			JSON.stringify([]),
		);
	}, []);

	return (
		<div
			className='dash-app-login-content'
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
			}}
		>
         
			<form
				onSubmit={handleSubmit}
				style={{
					width: '100%',
					maxWidth: 400,
					background: 'white',
					padding: 32,
					borderRadius: 12,
					boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'stretch',
				}}
			>
				<InputLabel id='demo-simple-select-label'>Correo</InputLabel>
				<Input
					name='email'
					type='email'
					value={email}
					required
					readOnly={loading}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<br />
				<InputLabel id='demo-simple-select-label'>Contraseña</InputLabel>
				<Input
					name='password'
					type='password'
					value={password}
					required
					readOnly={loading}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<br />
				<br />
				<Link style={{ color: 'royalblue', alignSelf: 'flex-end' }} to='/reset-password'>
					Olvido contraseña
				</Link>
				<br />
				<Button
					type='submit'
					variant='contained'
					color='primary'
					disabled={loading}
					style={{ marginTop: 16 }}
				>
					{loading ? 'Cargando...' : 'Ingresar'}
				</Button>
			</form>
		</div>
	);
};

export default Login;
