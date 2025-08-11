import { IDASHAppState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';

export interface IStaticLayout<U = any, A = any> extends React.PropsWithChildren { }

const StaticLayout = <U, A>({
    children,
    ...props
  }: IStaticLayout<U, A>): React.JSX.Element => {

    const panelSettings = useSelector(
		(state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
			state.common.panelSettings,
	);

	//const logo = panelSettings?.logo || <>🖥 DASH</>;
	const squaredLogo = panelSettings?.squaredLogo || <>🖥.</>;
    //const loginBackground = panelSettings?.loginBackground || <> Welcome to Dash Panel </>;

	return (
		<div className='dash-app-static'>
			<div className='dash-app-static-wrapper'>
				<div className='dash-app-static-content'>
					<a href='/'>
											{typeof squaredLogo === 'string' ? (
												<img alt='logo' className='dash-app-static-logo' src={squaredLogo} />
											) : (
												<div className='dash-app-static-logo'>{squaredLogo}</div>
											)}
					</a>

					{children}
				</div>
				{/*<div className='dash-app-back'>
					<img alt='logo' src={ImgLogo} className='dash-app-logo' />
					<div className='dash-app-login-img'>
						<img src={ImgLoginBack} alt='' />
					</div>
				</div>*/}
			</div>
		</div>
	);
};

export default StaticLayout;
