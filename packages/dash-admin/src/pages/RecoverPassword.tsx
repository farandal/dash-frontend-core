import { Button, Input, InputLabel, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Layout } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';
import useAxios from '../hooks/axios';

import getType from '../utils/getType';
import MUISimpleJsonTable from '../components/misc/MuiSimpleJsonTable';

//import IntlMessages from './theme/util/IntlMessages';

const RecoverPassword = () => {
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
		<div className='ant-layout dash-app-layout'>
			<form onSubmit={handleSubmit} className='dash-app-login-form'>
				<div className='dash-app-login-form-item'>
					<TextField
						variant='outlined'
						label='Email'
						placeholder='Email'
						required
						value={email}
						inputProps={{type:'email'}}
						//readOnly={loading}
						onChange={(e) => setEmail(e.target.value)}
						className='dash-app-login-form-input'
						//requiredIcon={<></>}
					/>

					{error && <span style={{ color: 'red' }}>{error}</span>}
				</div>

				<div className='dash-app-login-form-item mt-1'>
					<Button
						type='submit'
						color='primary'
						disabled={loading}
						style={{ marginBottom: '21px' }}
					>
						{loading ? 'Cargando...' : 'Resetear'}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default RecoverPassword;
