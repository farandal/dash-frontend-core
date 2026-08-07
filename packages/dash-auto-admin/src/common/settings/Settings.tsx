import {
	Dialog,
	DialogContent,
	Drawer,
	Fade,
	Popover,
	Tooltip,
} from '@mui/material';

import React, { FC, memo } from 'react';
import { GearBadge, AlertBadge, ErrorBadge } from './SettingsBarIcons';

export interface ISettings {
	/** Type. */
	type?: 'drawer' | 'dialog' | 'tooltip';
	/** Memoization data to compare. */
	data?: any;
	/** Warning. */
	warning?: { active: boolean; message: string };
	/** Error. */
	error?: { active: boolean; message: string };
	/** Optional ClassName. */
	className?: string;
	/** Optional GearIcon. */
	gearIcon?: JSX.Element;
	/** Children Required. */
	children: React.ReactNode;
}

const SettingsTooltip: FC<ISettings> = ({
	type,
	className,
	children,
	warning,
	error,
	gearIcon,
	..._props
}) => {
	if (!warning) warning = { active: false, message: '' };
	if (!error) error = { active: false, message: '' };

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const openSettings = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const closeSettings = () => {
		setAnchorEl(null);
	};

	return (
        <div {...(className && { className })}>
            <div className='settings-widget-actions'>
				{error.active && (
					<div className='settings-widget-action'>
						<ErrorBadge onClick={() => {}}>
							<></>
						</ErrorBadge>
					</div>
				)}
				{warning.active && (
					<Tooltip title={warning.message}>
						<div className='settings-widget-action'>
							<AlertBadge onClick={() => {}}>
								<></>
							</AlertBadge>
						</div>
					</Tooltip>
				)}
				<div className='settings-widget-action'>
					<GearBadge icon={gearIcon} onClick={openSettings}>
						<></>
					</GearBadge>
				</div>
			</div>

            <Popover
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				id='fade-menu'
				anchorEl={anchorEl}
				open={open}
				onClose={closeSettings}
				slots={{
                    transition: Fade
                }}
			>
				<div style={{ padding: 8 }}>{children}</div>
			</Popover>
        </div>
    );
};

const SettingsDialog: FC<ISettings> = ({
	type,
	className,
	children,
	warning,
	error,
	..._props
}) => {
	if (!warning) warning = { active: false, message: '' };
	if (!error) error = { active: false, message: '' };

	const [open, setOpen] = React.useState(false);

	const openSettings = (_event: React.MouseEvent<HTMLElement>) => {
		setOpen(true);
	};

	const closeSettings = () => {
		setOpen(false);
	};

	return (
		<div>
			<div className='settings-widget-actions'>
				{error.active && (
					<div className='settings-widget-action'>
						<ErrorBadge onClick={() => {}}>
							<></>
						</ErrorBadge>
					</div>
				)}
				{warning.active && (
					<Tooltip title={warning.message}>
						<div className='settings-widget-action'>
							<AlertBadge onClick={() => {}}>
								<></>
							</AlertBadge>
						</div>
					</Tooltip>
				)}
				<div className='settings-widget-action'>
					<GearBadge onClick={openSettings}>
						<></>
					</GearBadge>
				</div>
			</div>

			<Dialog open={open} onClose={closeSettings}>
				{/* @ts-ignore Expected mismatch ReactNode. */}
				<DialogContent>{children}</DialogContent>
			</Dialog>
		</div>
	);
};

const SettingsDrawer: FC<ISettings> = ({
	type,
	className,
	children,
	warning,
	error,
	..._props
}) => {
	if (!warning) warning = { active: false, message: '' };
	if (!error) error = { active: false, message: '' };

	const [open, setOpen] = React.useState(false);

	const openSettings = (_event: React.MouseEvent<HTMLElement>) => {
		setOpen(true);
	};

	const closeSettings = () => {
		setOpen(false);
	};

	return (
        <div>
            <div className='settings-widget-actions'>
				{error.active && (
					<div className='settings-widget-action'>
						<ErrorBadge onClick={() => {}}>
							<></>
						</ErrorBadge>
					</div>
				)}
				{warning.active && (
					<Tooltip title={warning.message}>
						<div className='settings-widget-action'>
							<AlertBadge onClick={() => {}}>
								<></>
							</AlertBadge>
						</div>
					</Tooltip>
				)}
				<div className='settings-widget-action'>
					<GearBadge onClick={openSettings}>
						<></>
					</GearBadge>
				</div>
			</div>

            <Drawer
				open={open}
				onClose={closeSettings}
				anchor={'right'}
				slotProps={{
                    paper: {
                        sx: { width: '20%' },
                    }
                }}
			>
				{/* @ts-ignore Expected mismatch ReactNode. */}
				{children}
			</Drawer>
        </div>
    );
};

const propsAreEqual = (oldProps, newProps) => {
	return oldProps.data === newProps.data;
};


const Settings: FC<ISettings> = ({ type = 'dialog', ...props }) => {
	switch (type) {
		case 'tooltip':
			return <SettingsTooltip type={type} {...props} />;
		case 'drawer':
			return <SettingsDrawer type={type} {...props} />;
		case 'dialog':
		default:
			return <SettingsDialog type={type} {...props} />;
	}
};

const MemoizedSettings = memo(Settings, propsAreEqual);

export default MemoizedSettings;
