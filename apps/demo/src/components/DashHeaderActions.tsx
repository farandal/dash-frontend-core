import { Button } from '@mui/material';
import React from 'react';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useGetIdentity } from 'react-admin';
import { useLocation, useNavigate } from 'react-router';
import {QuickSearch} from 'dash-components';

const DASHHeaderActions: React.FC<PropsWithChildren> = (props) => {
	const navigate = useNavigate();
	const [quickSearchUrl, setQuickSearchUrl] = useState(undefined);
	const { identity, isLoading: identityLoading } = useGetIdentity();

	useEffect(() => {
		if (!identityLoading && identity) {
			if (identity?.role_id === 2) {
				setQuickSearchUrl('/client/package');
			} else {
				setQuickSearchUrl('/admin/package');
			}
		}
	}, [identity, identityLoading]);

	return (
		<div className='dash-header-actions'>
            {/*
			<QuickSearch searchUrl={quickSearchUrl} />
			<Button
				onClick={() => navigate('profile')}
				variant={'outlined'}
				className='dash-header-actions-btn hide-sm'
			>
				{'Ver Perfil'}
			</Button>
            */}
		</div>
	);
};

export default DASHHeaderActions;
