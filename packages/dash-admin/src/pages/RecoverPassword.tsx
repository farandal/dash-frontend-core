import { Button, Input, InputLabel, TextField, Alert, IconButton, Grid } from '@mui/material';
import React, { useState } from 'react';
import { Layout } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import useAxios from '../hooks/axios';
import { FullLayoutMarkup } from 'dash-default-theme';
import getType from '../utils/getType';
import MUISimpleJsonTable from '../components/misc/MuiSimpleJsonTable';
import HomeIcon from '@mui/icons-material/Home';

const RecoverPassword = ({  }: {  }) => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { axios } = useAxios();
	const redirect = useRedirect();
	const notify = useNotify();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const { data } = await axios.post(`password/email`, {
				email,
			});
			notify(data.message, { type: 'success' });
			redirect('/login');
		} catch (error: any) {
			let _error = error;
			try {
				if (getType(_error) === 'object') {
					_error = (
						<>
							<MUISimpleJsonTable
								ignore={['trace', 'request', 'response', 'config']}
								vertical
								tableData={_error}
							/>
						</>
					);
				}
			} catch (e) {
				console.error(e);
			}
			notify(
				_error ? _error?.body?.message || _error : 'Ha ocurrido un error',
				{ type: 'warning' },
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<FullLayoutMarkup
		
       
		>
			<form onSubmit={handleSubmit} className='dash-app-login-form'>
				<Grid container sx={{ mb:4, mt:2 }} spacing={2} alignItems="center">
					<Grid item xs={2}>
						<IconButton
							color={'primary'}
							size={'large'}
							onClick={() => redirect('/')}
						>
							<HomeIcon />
						</IconButton>
					</Grid>
					<Grid item xs={10}>
						<h1 className="dash-app-login-form-title" style={{ margin: 0 }}>Recuperar Contraseña</h1>
					</Grid>
				</Grid>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<div className='dash-app-form-item'>
					<TextField
						variant='outlined'
						label='Email'
						placeholder='Email'
						required
						value={email}
						inputProps={{type:'email'}}
						onChange={(e) => setEmail(e.target.value)}
						className='dash-app-form-item-input'
						autoComplete="username"
						name="email"
						type="email"
						id="email"
					/>
				</div>

				<div className='dash-app-form-item mt-1'>
					<Button
						type='submit'
						variant='contained'
						disabled={loading}
						sx={{ mb: 2, width: '100%' }}
					>
						{loading ? 'Cargando...' : 'Resetear Contraseña'}
					</Button>
				</div>
			</form>
		</FullLayoutMarkup>
	);
};

export default RecoverPassword;
