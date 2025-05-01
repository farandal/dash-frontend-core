import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRedirect } from 'react-admin';
import useAxios from '../hooks/axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import { getEnv } from '../config/DASHAdminSystemConstants';

const VerifyAccount = () => {
	const [searchParams] = useSearchParams();
	const redirect = useRedirect();
	const { axios } = useAxios();
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('Verificando cuenta...');


	const backendUrl = getEnv('APP_BACKEND_URL') || 'http://localhost:8000';

	const verify = async () => {
		try {
			const id = searchParams.get('id');
			const hash = searchParams.get('hash');

			if (!id || !hash) {
				setStatus('error');
				setMessage('Link de verificación inválido.');
				setTimeout(() => redirect('/login'), 3000);
				return;
			}

			// Construct the verification URL for the backend
			const verificationUrl = `${backendUrl}/api/email/verify/${id}/${hash}`;
			
			const res = await axios.get(verificationUrl);
			
			switch (res.status) {
				case 200:
					setStatus('success');
					setMessage('Cuenta verificada correctamente. Redirigiendo al login...');
					setTimeout(() => redirect('/login'), 3000);
					break;
				case 204:
					setStatus('success');
					setMessage('Cuenta ya verificada. Redirigiendo al login...');
					setTimeout(() => redirect('/login'), 3000);
					break;
				default:
					setStatus('error');
					setMessage('Error al verificar la cuenta. Por favor, intente nuevamente.');
					setTimeout(() => redirect('/login'), 3000);
					break;
			}
		} catch (error) {
			console.error('Verification error:', error);
			setStatus('error');
			setMessage('Error al verificar la cuenta. Por favor, intente nuevamente.');
			setTimeout(() => redirect('/login'), 3000);
		}
	};

	useEffect(() => {
		verify();
	}, []);

	return (
		<Box 
			display="flex" 
			flexDirection="column" 
			alignItems="center" 
			justifyContent="center" 
			minHeight="100vh"
			padding={3}
			textAlign="center"
		>
			{status === 'loading' && <CircularProgress size={60} thickness={4} />}
			<Typography variant="h5" component="h1" gutterBottom marginTop={2}>
				Verificación de Cuenta
			</Typography>
			<Typography variant="body1">
				{message}
			</Typography>
		</Box>
	);
};

export default VerifyAccount;
