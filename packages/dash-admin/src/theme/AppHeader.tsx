import React, { ReactNode, useEffect } from 'react';
import { Children } from 'react';

import { useSelector } from 'react-redux';
import { IPageState, IDASHAppState } from 'dash-admin-state';
import PageTitle from './components/PageTitle';

export interface IAppHeader {
	//toolbar: ReactNode[],
	children?: JSX.Element;
}

const AppHeader: React.FC<IAppHeader> = ({
	//toolbar,
	children,
	...props
}) => {
	const page: IPageState = useSelector(
		(state: IDASHAppState<any, any, any>) => state.page,
	);
	const headerComponents: JSX.Element[] = useSelector(
		(state: IDASHAppState<any, any, any>) => state.common.headerComponents,
	);

	return (
		<div className='dash-header'>
			{children ? (
				children
			) : (
				<PageTitle
					className='dash-header-title dash-d-lg-block'
					avatar={page.icon}
					title={page.title}
					subTitle={page.subTitle}
				/>
			)}
			<ul className={`dash-header-items`}>
				{Children.map(headerComponents, (child, index) => {
					return (
						<li key={index} className={`dash-header-item`}>
							{child}
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default AppHeader;
