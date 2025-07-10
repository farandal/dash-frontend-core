import React, { FC, useContext, useEffect } from 'react';
import { useGetList } from 'react-admin';
import { NotificationComponent } from './NotificationRenderer';

import { Badge, Button, Popover } from '@mui/material';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useStore } from 'react-admin';
import NotificationsActive from '@mui/icons-material/NotificationsActive';

import LaravelEchoContext, { ILaravelEchoContext } from '../LaravelEchoContext';
import DictionaryContext from '../../dictionary/DictionaryContext';
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import { IDashFormattedNotification, formatNotification } from './notificationFormats';
import { IDashNotificationBase, IDashNotificationPayloadBase } from '../../../interfaces/communication/INotification';

export interface INotificationItem {
	key: React.Key;
	title: string;
	notification: IDashNotificationBase<any>;
	image?: string;
	name?: string;
	time?: string;
}

export const NotificationWrapper: FC<{
	notification: IDashNotificationBase<any>;
	key: React.Key;
	children: React.ReactNode;
}> = ({ notification, key, children }) => {
	const formattedNotification: IDashFormattedNotification = formatNotification<any>(notification);
	return (
		<li key={key} className='dash-media'>
			<div className='dash-user-thumb dash-mr-3'>
				<formattedNotification.content notification={notification} />
				<span className='dash-badge dash-badge-danger dash-text-white dash-rounded-circle'></span>
			</div>
			<div className='dash-media-body'>
				<h5><formattedNotification.title notification={notification} /></h5>
				<span>
					<formattedNotification.content notification={notification} />
				</span>
				{children}
			</div>
		</li>
	);
};

export const NotificationsWidget: FC<{}> = () => {
	const [currentNotifications, setCurrentNotifications] = useStore<number>(
		'activeNotifications',
	);

	const laravelEchoContext =
		useContext<ILaravelEchoContext>(LaravelEchoContext);

	useEffect(() => {
		if (
			laravelEchoContext.lastEvent &&
			localStorage.getItem('lastEvent') !==
				JSON.stringify(laravelEchoContext.lastEvent)
		) {
			if (
				['ProductImportProgressNotification'].includes(
					laravelEchoContext.lastEvent.notificationPayload.class,
				)
			)
				return;
			setCurrentNotifications((currentNotifications || 0) + 1);
		}
	}, [laravelEchoContext.lastEvent]);

	const navigate = useNavigate();

	const {
		data: NOTIFICATIONS,
		// total,
		// isLoading,
		// error,
		// refetch,
	} = useGetList('notification', {
		pagination: { page: 1, perPage: 5 },
		sort: null,
	});

	const dict = React.useContext(DictionaryContext);

	const NoNotifications = () => {
		return (
			<ul className='dash-sub-popover'>
				<li>{dict.get('NO_AVAILABLE_NOTIFICATIONS')}</li>
			</ul>
		);
	};

	const MailNotification = () => {
		return (
			<>
				<div className='dash-popover-header'>
					<h3 className='dash-mb-0'>
						{dict.get('NOTIFICATIONS_WIDGET_TITLE')}
					</h3>
					<Button onClick={() => navigate('notification')}>Ver todas</Button>
				</div>
				<Scrollbar className='dash-popover-scroll'>
					<ul className='dash-sub-popover'>
						{NOTIFICATIONS && NOTIFICATIONS.length ? (
							(NOTIFICATIONS as any[]).map((notification, index) => {
								const linkNotification = {
									...notification,
									notificationPayload: {
										...notification.notificationPayload,
										notificationPayload: {
											...notification.notificationPayload.notificationPayload,
											name: (
												<Link
													target='_blank'
													to={`/log/${notification?.notificationPayload?.notificationPayload?.id}/show`}
												>
													{
														notification?.notificationPayload
															?.notificationPayload?.name
													}
												</Link>
											),
										},
									},
								};
								return (
									<NotificationWrapper notification={notification} key={index}>
										<NotificationComponent notification={linkNotification} />
									</NotificationWrapper>
								);
							})
						) : (
							<NoNotifications />
						)}
					</ul>
				</Scrollbar>
			</>
		);
	};

	const [anchorEl, setAnchorEl] =
		React.useState<HTMLButtonElement | null>(null);

	const openNotifications = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const openPanel = Boolean(anchorEl);

	return (
		<div className='dash-notify dash-header-entry'>
			<Popover
				id={undefined}
				open={openPanel}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<MailNotification />
			</Popover>
			<Badge
				onClick={openNotifications}
				badgeContent={currentNotifications}
				color='primary'
			>
				<NotificationsActive color='action' />
			</Badge>
		</div>
	);
};
export default NotificationsWidget;