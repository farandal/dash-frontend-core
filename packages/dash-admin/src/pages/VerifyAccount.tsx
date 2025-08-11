import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import useAxios from '../hooks/axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import { getEnv } from 'dash-constants/src/DASHAdminSystemConstants';


import { FullLayoutMarkup } from '../../src/default-theme';

interface VerifyAccountProps {
	
}

const VerifyAccount: React.FC<VerifyAccountProps> = ({
	
}) => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { axios } = useAxios();
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('Verificando cuenta...');

	const backendUrl = getEnv('APP_BACKEND_URL') || 'http://localhost:8000';

	const verify = async () => {
		try {
			const verificationUrlParam = searchParams.get('verification_url');
			if (verificationUrlParam) {
				// Use the full verification URL directly
				const res = await axios.get(verificationUrlParam);
				switch (res.status) {
					case 200:
						setStatus('success');
						setMessage('Cuenta verificada correctamente. Redirigiendo al login...');
						setTimeout(() => navigate('/login'), 3000);
						break;
					case 204:
						setStatus('success');
						setMessage('Cuenta ya verificada. Redirigiendo al login...');
						setTimeout(() => navigate('/login'), 3000);
						break;
					default:
						setStatus('error');
						setMessage('Error al verificar la cuenta. Por favor, intente nuevamente.');
						setTimeout(() => navigate('/login'), 3000);
						break;
				}
				return;
			}

			const id = searchParams.get('id');
			const hash = searchParams.get('hash');

			if (!id || !hash) {
				setStatus('error');
				setMessage('Link de verificación inválido.');
				setTimeout(() => navigate('/login'),8000);
				return;
			}

			const verificationUrl = `${backendUrl}/api/email/verify/${id}/${hash}`;
			
			const res = await axios.get(verificationUrl);
			
			switch (res.status) {
				case 200:
					setStatus('success');
					setMessage('Cuenta verificada correctamente. Redirigiendo al login...');
					setTimeout(() => navigate('/login'), 3000);
					break;
				case 204:
					setStatus('success');
					setMessage('Cuenta ya verificada. Redirigiendo al login...');
					setTimeout(() => navigate('/login'), 3000);
					break;
				default:
					setStatus('error');
					setMessage('Error al verificar la cuenta. Por favor, intente nuevamente.');
					setTimeout(() => navigate('/login'), 8000);
					break;
			}
		} catch (error) {
			console.error('Verification error:', error);
			setStatus('error');
			setMessage('Error al verificar la cuenta. Por favor, intente nuevamente.');
			setTimeout(() => navigate('/login'), 8000);
		}
	};

	useEffect(() => {
		verify();
	}, []);

	return (
		<FullLayoutMarkup
		
		>
			<div className="dash-app-login-form">
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
                        backgroundColor: 'background.paper',
                        mx: 'auto',
                        my: 8,
                    }}
                >
                    <h1 className="dash-app-login-form-title">Verificación de Cuenta</h1>
                    {status === 'loading' && <CircularProgress size={60} thickness={4} />}
                    <Typography sx={{ mt: 2, textAlign: 'center' }}>
                        {message}
                    </Typography>
                </Box>
				
			</div>
		</FullLayoutMarkup>
	);
};

export default VerifyAccount;
