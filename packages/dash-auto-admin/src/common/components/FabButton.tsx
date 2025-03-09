import { FC, JSX, cloneElement } from 'react';
import Settings from '@mui/icons-material/Settings';
import { Fab, FabProps, Tooltip } from '@mui/material';

export interface IFabButton extends FabProps {
	onClick: (_e: any) => any;
	tooltip: React.ReactNode;
	icon?: JSX.Element;
}

export const FabButton: FC<IFabButton> = (props) => {
	const { icon, onClick, tooltip, children, ...rest } = props;

	const _icon = icon ? (
		cloneElement(props.icon, { sx: { fontSize: 16 }, fontSize: 'small' })
	) : (
		<Settings sx={{ fontSize: 16 }} fontSize={'small'} />
	);
	return (
		<Tooltip title={tooltip}>
			<Fab
				size='small'
				aria-label='settings'
				color='primary'
				onClick={onClick}
				style={{
					position: 'absolute',
				}}
				className={'toolbar-settings-button'}
				{...rest}
			>
				{_icon}
			</Fab>
		</Tooltip>
	);
};

export default FabButton;
