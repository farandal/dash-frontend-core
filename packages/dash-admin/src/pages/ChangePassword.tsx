import { Alert, Button, Input, InputLabel, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAxios from '../hooks/axios';
import { FullLayoutMarkup } from 'dash-default-theme';

const getUrlParamsObject = (searchParams: any) => {
	let params: Record<string, any> = {};
	for (const entry of searchParams) {
		const [param, value] = entry;
		params = { ...params, [param]: value };
	}
	return Object.keys(params).length > 0 ? params : null;
};


interface ChangePasswordProps {
    panelSettings: any;
    onAuthChange?: (authenticated: any) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
    panelSettings,
}) => {
	const navigate = useNavigate();
	let [searchParams] = useSearchParams();
	const urlQuery: any = getUrlParamsObject(searchParams.entries());
	const [password, setPassword] = useState('');
	const [rePassword, setRePassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { axios } = useAxios();

	useEffect(() => {
		if (!urlQuery?.token || !urlQuery?.email) {
			navigate('/login');
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
				//notify(data.message);
				navigate('/login');
			} catch (error: any) {
				console.log(JSON.stringify(error));
				if (error.status === 422 && typeof error.body.message === 'string') {
					setError(error.body.message);
                }
				else {
					/*notify(error?.body?.message || 'Error al cambiar contraseña', {
						type: 'error',
					});*/
                }
			} finally {
				setLoading(false);
			}
		} else {
			setError('Las contraseñas no coinciden');
		}
	};

	return (
		 <FullLayoutMarkup
            logo={panelSettings?.horizontalLogo}
            loginBackground={panelSettings?.loginBackground}
        >
			<form 
				onSubmit={handleSubmit} 
				className="dash-app-login-form"
				autoComplete="on"
				method="post"
			>
				<h1 className="dash-app-login-form-title">Cambiar Contraseña</h1>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<div className="dash-app-form-item">
					<TextField
						label="Contraseña"
						placeholder="Contraseña"
						required
						type="password"
						value={password}
						onChange={(e) => {
							setError('');
							setPassword(e.target.value);
						}}
						className="dash-app-form-item-input"
						disabled={loading}
					/>
				</div>

				<div className="dash-app-form-item">
					<TextField
						label="Repetir Contraseña"
						placeholder="Repetir Contraseña"
						required
						type="password"
						value={rePassword}
						onChange={(e) => {
							setError('');
							setRePassword(e.target.value);
						}}
						className="dash-app-form-item-input"
						disabled={loading}
					/>
				</div>

				<div className="dash-app-form-item mt-1">
					<Button
						type="submit"
						variant="contained"
						className="submit"
						disabled={loading}
						sx={{ mb: 2, width: '100%' }}
					>
						{loading ? 'Cargando...' : 'Cambiar Contraseña'}
					</Button>
				</div>
			</form>
		</FullLayoutMarkup>
	);
};

export default ChangePassword;
