import React, { FC, JSX, ReactNode, useEffect } from 'react';
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
	const HeaderToolBar: FC = useSelector(
		(state: IDASHAppState<any, any, any>) => state.common.headerToolBar,
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
				
					
						<HeaderToolBar/>
						
					
			</ul>
		</div>
	);
};

export default AppHeader;
