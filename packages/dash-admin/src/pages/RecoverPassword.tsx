import { Button, Input, InputLabel, TextField, Alert, IconButton, Grid, Dialog, DialogContent, DialogActions, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Layout } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import useAxios from '../hooks/axios';
import { FullLayoutMarkup } from '../../src/default-theme';
import getType from '../utils/getType';
import MUISimpleJsonTable from '../components/misc/MuiSimpleJsonTable';
import HomeIcon from '@mui/icons-material/Home';
import { getCookie, removeCookie, setCookie,clearAllCookies  } from '../../src/utils/cookies';

const RecoverPassword = ({  }: {  }) => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
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
			setSuccess(true);
			notify(data.message, { type: 'success' });
		} catch (error: any) {
			let errorMsg = 'Ha ocurrido un error';
			if (error?.response?.data) {
				const resp = error.response.data;
				// Prefer error from errors.email, then message, then fallback
				if (resp.errors && resp.errors.email && resp.errors.email.length > 0) {
					errorMsg = resp.errors.email[0];
				} else if (resp.message) {
					errorMsg = resp.message;
				}
			} else if (error?.message) {
				errorMsg = error.message;
			}
			setError(errorMsg);
			notify(errorMsg, { type: 'warning' });
		} finally {
			setLoading(false);
		}
	};

    useEffect(() => {
        localStorage.clear();
        clearAllCookies();
    }, [])

	return (
		<FullLayoutMarkup>
			<Box
				sx={{
					//height: '100vh',
					display: 'flex',
					alignItems: 'flex-start', // align to top
					justifyContent: 'center',
					pt: 8, // thick top margin
				}}
			>
				<Box
					sx={{
						width: '100%',
						maxWidth: 420,
						mx: 'auto',
					}}
				>
					{success ? (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: 3,
								borderRadius: 2,
								p: 4,
								minWidth: 320,
								minHeight: 200,
								bgcolor: 'background.paper',
								mt: 8, // thick top margin
								mx: 'auto',
							}}
						>
							<h1 className="dash-app-login-form-title" style={{ margin: 0 }}>Recuperar Contraseña</h1>
							<Alert severity="success" sx={{ mt: 2, mb: 2 }}>
								Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
							</Alert>
							<Button
								variant="contained"
								color="primary"
								onClick={() => redirect('/login')}
								sx={{ mt: 2 }}
							>
								Ir al Login
							</Button>
						</Box>
					) : (
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
									fullWidth
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
					)}
				</Box>
			</Box>
		</FullLayoutMarkup>
	);
};

export default RecoverPassword;
