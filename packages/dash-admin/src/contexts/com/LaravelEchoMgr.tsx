import { useContext, useState } from 'react';

import { useDispatch } from 'react-redux';

import { toast } from 'react-toastify';

import { NotificationWrapper } from './components/NotificationsWidget';
import { NotificationComponent } from './components/NotificationRenderer';
import { INotificationPayloadBase } from './components/notificationFormats';
import React from 'react';
import { AuthContext, IAuthContext } from '../auth';
import useLaravelEcho from './useLaravelEcho';

export type ILaravelEchoManager = {
	events: INotificationPayloadBase[];
	lastEvent: INotificationPayloadBase;
	clear: () => void;
};

const LaravelEchoMgr = (): ILaravelEchoManager => {
	//const { addToast } = useToasts();
	//const [appearance, setAppearance] = useState<AppearanceTypes>(constants.toastAppearances[0]);
	const [events, setEvents] = useState<INotificationPayloadBase[]>([]);
	const [lastEvent, setLastEvent] = useState<INotificationPayloadBase>(null);
	const dispatch = useDispatch();
	const authContext: IAuthContext = useContext(AuthContext);

	const clear = () => {
		setLastEvent(null);
	};
	//const action: IResponseAction = useSelector((state: IState) => state.action);
	const popMessage = (notification: INotificationPayloadBase) => {
		// if (!appearance) appearance = constants.toastAppearances[0];
		//addToast(<>{message}</>, { appearance, autoDismiss: false });

		toast(
			<NotificationWrapper notification={notification} key={0}>
				{' '}
				<NotificationComponent notification={notification} />{' '}
			</NotificationWrapper>,
			{
				position: 'top-right',
				autoClose: 8000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			},
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const popStickyMessage = (notification: INotificationPayloadBase) => {
		//if (!appearance) appearance = constants.toastAppearances[0];
		//addToast(<>{message}</>, { appearance, autoDismiss: false });
		toast(
			<NotificationWrapper notification={notification} key={0}>
				{' '}
				<NotificationComponent notification={notification} />{' '}
			</NotificationWrapper>,
			{
				position: 'top-right',
				autoClose: false,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			},
		);
	};

	useLaravelEcho({
		type: 'public',
		channel: 'message.channel',
		events: {
			'public.message': (notification: INotificationPayloadBase) => {
				console.log('public.message', notification);
				setEvents([...events, notification]);
				setLastEvent(notification);
				//dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
				popMessage(notification);
			},
		},
		userId: authContext && authContext.user ? authContext.user.id : null,
	});

	useLaravelEcho({
		type: 'private',
		channel:
			authContext && authContext.user
				? `user.message.channel.${authContext.user.id}`
				: null,
		userId: authContext && authContext.user ? authContext.user.id : null,
		events: {
			'private.message': (notification: INotificationPayloadBase) => {
				console.log('private.message', notification);
				setEvents([...events, notification]);
				setLastEvent(notification);
				//dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));

				popMessage(notification);
			},
			'progress.message': (notification: INotificationPayloadBase) => {
				console.info(notification);
				setEvents([...events, notification]);
				setLastEvent(notification);
			},
		},
	});

	return { events, lastEvent, clear };
};

export default LaravelEchoMgr;
