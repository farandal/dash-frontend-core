import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRedirect } from 'react-admin';
import { useLogin, useNotify, Notification } from 'react-admin';
import { Link } from 'react-router-dom';
//import IntlMessages from './theme/util/IntlMessages';
import { Button, Input, InputLabel } from '@mui/material';

import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import authProvider from '../providers/authProvider';
import { ConstantsContext } from '../config/ConstantsService';

const MyLoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = authProvider;
	const redirect = useRedirect();
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
		localStorage.setItem(
			'roles',
			JSON.stringify([]),
		);
	}, []);

	return (
		<div className='ant-layout dash-app-layout'>
			<div className='dash-app-login-wrap'>
				<div className='dash-app-login-container'>
					<div className='dash-app-login-main-content'>
						<div className='dash-app-logo-content'>
						
							<div className='dash-app-login-logo'>{panelSettings.logo}</div>
						</div>
						<div className='dash-app-login-content'>
							<form onSubmit={handleSubmit}>
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
								<InputLabel id='demo-simple-select-label'>
									Contraseña
								</InputLabel>
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
								<Link style={{ color: 'royalblue' }} to='/reset-password'>
									Olvido contraseña
								</Link>
								<br />
								<br />
								<Button
									type='submit'
									variant='contained'
									color='primary'
									disabled={loading}
								>
									{loading ? 'Cargando...' : 'Ingresar'}
								</Button>
							</form>

							{/*<Form
                initialValues={{remember: true}}
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                className="dash-signin-form dash-form-row0">
  
                <Form.Item
                  initialValue="demo@example.com"
                  rules={[{required: true, message: 'The input is not valid E-mail!'}]} name="email">
                  <Input placeholder="Email"/>
                </Form.Item>
                <Form.Item
                  initialValue="demo#123"
                  rules={[{required: true, message: 'Please input your Password!'}]} name="password">
                  <Input type="password" placeholder="Password"/>
                </Form.Item>
                <Form.Item>
                  <Checkbox><IntlMessages id="appModule.iAccept"/></Checkbox>
                  <span className="dash-signup-form-forgot dash-link"><IntlMessages
                    id="appModule.termAndCondition"/></span>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" className="dash-mb-0" htmlType="submit">
                    <IntlMessages id="app.userAuth.signIn"/>
                  </Button>
                  <span><IntlMessages id="app.userAuth.or"/></span> <Link to="/signup"><IntlMessages
                  id="app.userAuth.signUp"/></Link>
                </Form.Item>
                <div className="dash-flex-row dash-justify-content-between">
                  <span>or connect with</span>
                  <ul className="dash-social-link">
                    <li>
                      <GoogleOutlined onClick={() => {
                        dispatch(showAuthLoader());
                        dispatch(userGoogleSignIn());
                      }}/>
                    </li>
                    <li>
                      <FacebookOutlined onClick={() => {
                        dispatch(showAuthLoader());
                        dispatch(userFacebookSignIn());
                      }}/>
                    </li>
                    <li>
                      <GithubOutlined onClick={() => {
                        dispatch(showAuthLoader());
                        dispatch(userGithubSignIn());
                      }}/>
                    </li>
                    <li>
                      <TwitterOutlined onClick={() => {
                        dispatch(showAuthLoader());
                        dispatch(userTwitterSignIn());
                      }}/>
                    </li>
                  </ul>
                </div>
                <span
                  className="dash-text-light dash-fs-sm"> demo user email: 'demo@example.com' and password: 'demo#123'</span>
                    </Form>*/}
						</div>

						{/*loader ?
              <div className="dash-loader-view">
                <CircularProgress/>
                </div> : null*/}
						{/*showMessage ?
              message.error(alertMessage.toString()) : null*/}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyLoginPage;
