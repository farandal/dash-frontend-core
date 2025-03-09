import React, { useEffect, useState } from 'react';


import { useForm } from 'react-hook-form';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { useAxios} from 'dash-axios-hook';


import { Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { FullLayoutMarkup } from 'dash-default-theme';

const CustomRecoverPassword: React.FC = (_props) => {

	const [error, setError] = useState('');
	const [, setLoading] = useState(false);
	
	const form = useForm();
	const {
		register,
		handleSubmit,
	} = form;
	const redirect = useRedirect();
	const notify = useNotify();
	const axios = useAxios();
	const navigate = useNavigate();
	useEffect(() => {}, []);
	async function onSubmit(data) {
		const email = data.email;
		setLoading(true);
		try {
			const { data: d } = await axios.post('password/email', {
				email,
			});
			notify(d.message, { type: 'success' });
			redirect('/login');
		} catch (_e: any) {
			const _error = _e;
			if (_error.email[0]) {
				setError(_error.email[0]);
			}
			try {
				//     if (getType(_error) === "object") {
				//       _error = <><MUISimpleJsonTable ignore={['trace', 'request', 'response', 'config']} vertical tableData={_error} /></>
				//  }
			} catch (e) {
				//    console.error(e);
			}
			//notify(_error ? (_error?.body?.message || _error) : 'Ha ocurrido un error', 'warning');
		} finally {
			setLoading(false);
		}
	}

	return (
		<FullLayoutMarkup>
			<form onSubmit={handleSubmit(onSubmit)} className='sudo-app-login-form'>
				<Grid container spacing={0}>
					<Grid item xs={2}>
						<IconButton
							color="primary"
							size="large"
							onClick={() => {
								navigate('/');
							}}
						>
							<HomeIcon />
						</IconButton>
					</Grid>
					<Grid item xs={10}>
						<h1 className='sudo-app-login-form-title'>Resetear contraseña</h1>
					</Grid>
				</Grid>

				<div className='sudo-app-form-item'>
					<InputLabel>
						<strong>Email </strong>
					</InputLabel>
					<Input
						placeholder='Email'
						required
						{...register('email')}
						className='sudo-app-form-item-input'
					/>
					{error && <span style={{ color: 'red' }}>{error}</span>}
				</div>

				<div className='sudo-app-form-item mb-0'>
					<Button className='submit' type='submit'>
						Resetear
					</Button>
				</div>
			</form>
		</FullLayoutMarkup>
	);
};

export default CustomRecoverPassword;
