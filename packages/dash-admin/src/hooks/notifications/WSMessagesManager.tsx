import { useContext, useState } from 'react';
//import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AuthContext, IAuthContext } from 'dash-admin/src/contexts/auth';
import { ILaravelEchoManager } from 'dash-admin/src/contexts/com/LaravelEchoMgr';
import { NotificationComponent } from 'dash-admin/src/contexts/com/components/NotificationRenderer';
import { NotificationWrapper } from 'dash-admin/src/contexts/com/components/NotificationsWidget';
import { INotificationPayloadBase } from 'dash-admin/src/contexts/com/components/notificationFormats';
import useLaravelEcho from 'dash-admin/src/contexts/com/useLaravelEcho';

const popPrivateMessage = (notification: INotificationPayloadBase) => {
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

/*const popStickyMessage = (notification: INotificationPayloadBase) => {
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
};*/

const WSMessagesManager = (): ILaravelEchoManager => {
	const [events, setEvents] = useState<INotificationPayloadBase[]>([]);
	const [lastEvent, setLastEvent] = useState<INotificationPayloadBase>(null);
	//const dispatch = useDispatch();
	const authContext: IAuthContext = useContext(AuthContext);

	const clear = () => {
		setLastEvent(null);
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
				//popMessage(notification)
				//alert(notification)
			},
			'invalidated-cache': (notification: any) => {
				console.log('invalidated-cache', notification);

				const parsedNotification = {
					class: 'invalidated-cache',
					title: 'Invalidación de Caché',
					message: 'invalidated-cache',
					date: '',
					notificationPayload: notification,
				};

				setEvents([...events, parsedNotification]);
				setLastEvent(parsedNotification);
			},
		},
		userId: authContext && authContext.user ? authContext.user.id : null,
	});

	useLaravelEcho({
		type: 'private',
		channel:
			authContext && authContext.user
				? `packages.${authContext.user.id}`
				: null,
		userId: authContext && authContext.user ? authContext.user.id : null,
		events: {
			'export-packages': (notification: any) => {
				console.log('export-packages', notification);

				const parsedNotification = {
					class: 'export-packages',
					title: 'Ingreso de Paquete',
					message: 'export-packages',
					date: '',
					notificationPayload: notification,
				};

				setEvents([...events, parsedNotification]);
				setLastEvent(parsedNotification);
			},
			'enter-packages': (notification: any) => {
				console.log('enter-packages', notification);

				const parsedNotification = {
					class: 'enter-packages',
					title: 'Ingreso de Paquete',
					message: 'enter-packages',
					date: '',
					notificationPayload: notification,
				};

				setEvents([...events, parsedNotification]);

				setLastEvent(parsedNotification);

				//dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
				//popExportPackageMessage(notification);
			},
			'dispatch-packages': (notification: any) => {
				console.log('dispatch-packages', notification);

				const parsedNotification = {
					class: 'dispatch-packages',
					title: 'Egreso de Paquete',
					message: 'dispatch-packages',
					date: '',
					notificationPayload: notification,
				};

				setEvents([...events, parsedNotification]);

				setLastEvent(parsedNotification);

				//dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
				//popExportPackageMessage(notification);
			},

			'return-packages': (notification: any) => {
				console.log('return-packages', notification);

				const parsedNotification = {
					class: 'return-packages',
					title: 'Devolución de Paquete',
					message: 'return-packages',
					date: '',
					notificationPayload: notification,
				};

				setEvents([...events, parsedNotification]);

				setLastEvent(parsedNotification);

				//dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
				//popExportPackageMessage(notification);
			},

			'return-warehouse-packages': (notification: any) => {
				console.log('return-packages', notification);

				const parsedNotification = {
					class: 'return-warehouse-packages',
					title: 'Devolución de Paquete (Almacén)',
					message: 'return-warehouse-packages',
					date: '',
					notificationPayload: notification,
				};

				setEvents([...events, parsedNotification]);

				setLastEvent(parsedNotification);

				//dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
				//popExportPackageMessage(notification);
			},
		},
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
				popPrivateMessage(notification);
			},
		},
	});
	return { events, lastEvent, clear };
};

export default WSMessagesManager;
