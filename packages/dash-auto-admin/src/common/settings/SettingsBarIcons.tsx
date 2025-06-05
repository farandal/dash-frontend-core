import Badge, { BadgeProps } from '@mui/material/Badge';
import styled from '@emotion/styled';
import {Settings, Error, Warning }from '@mui/icons-material';

import { FC, JSX, cloneElement } from 'react';
import { Fab } from '@mui/material';

const StyledBadge = styled(Badge)<BadgeProps>(({ theme: _theme }) => ({
	'& .MuiBadge-badge': {
		padding: 0,
	},
}));

export interface ISettingsBadge {
	onClick: (e: any) => any;
	icon?: JSX.Element;
	children: React.ReactNode;
}

export const GearBadge: FC<ISettingsBadge> = (props) => {
	const icon = props.icon ? (
		cloneElement(props.icon, { sx: { fontSize: 16 }, fontSize: 'small' })
	) : (
		<Settings sx={{ fontSize: 16 }} fontSize={'small'} />
	);

	return (
		<Fab
			size='small'
			aria-label='settings'
			color='primary'
			onClick={props.onClick}
			style={{
				position: 'absolute',
			}}
			className={'toolbar-settings-button'}
		>
			{icon}
		</Fab>
	);
};

export const AlertBadge: FC<ISettingsBadge> = (props) => {
	return (
		<StyledBadge
			onClick={props.onClick}
			badgeContent={
				<Warning
					sx={{ fontSize: 16, color: 'orange' }}
					fontSize={'small'}
				/>
			}
			color='default'
		>
			{props.children}
		</StyledBadge>
	);
};

export const ErrorBadge: FC<ISettingsBadge> = (props) => {
	return (
		<StyledBadge
			onClick={props.onClick}
			badgeContent={
				<Error sx={{ fontSize: 16, color: 'red' }} fontSize={'small'} />
			}
			color='default'
		>
			{props.children}
		</StyledBadge>
	);
};
