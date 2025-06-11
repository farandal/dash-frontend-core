import { IDASHAppState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import * as React from 'react';
import { useSelector } from 'react-redux';

export interface IFullLayoutMarkup<U = any, A = any> extends React.PropsWithChildren { }

const FullLayoutMarkup = <U, A>({
    children,
    className,
    ...props
  }: IFullLayoutMarkup<U, A> & { className?: string }): React.JSX.Element => {

    const panelSettings = useSelector(
		(state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
			state.common.panelSettings,
	);

	const logo = panelSettings?.squaredLogo || <>🖥 DASH..</>;
    const loginBackground = panelSettings?.loginBackground || <> Welcome to Dash Panel </>;

	return (
		<div className={`dash-app-layout ${className || ''}`}>
			<div className='dash-app-login-wrapper'>
				<div className='dash-app-login-content'>
					{typeof logo === 'string' ? <img alt='logo' className='dash-app-login-logo' src={logo} /> : <div className='dash-app-login-logo'>{logo}</div>}
                   
					{children}
				</div>
				<div className='dash-app-login-back'>
					<div className='dash-app-login-img'>
                       {typeof loginBackground === 'string' ? <img src={loginBackground} alt='' /> : loginBackground}
					</div>
				</div>
			</div>
		</div>
	);
};
export default FullLayoutMarkup;