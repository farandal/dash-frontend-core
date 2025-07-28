import React, { FC, JSX, ReactNode, useEffect } from 'react';
import { Children } from 'react';

import { useSelector } from 'react-redux';
import { IPageState, IDASHAppState } from 'dash-admin-state';
import PageTitle from './components/PageTitle';
import { Box } from '@mui/material';

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
        <Box className="dash-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
            {children ? (
                children
            ) : (
                <PageTitle
                    className="dash-header-title dash-d-lg-block"
                    avatar={page.icon}
                    title={page.title}
                    subTitle={page.subTitle}
                />
            )}
            <Box
                className="dash-header-items"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: 'auto',
                }}
            >
                <HeaderToolBar />
            </Box>
        </Box>
    );
};

export default AppHeader;
