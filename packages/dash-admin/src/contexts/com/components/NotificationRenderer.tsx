import React, { FC } from 'react';
import { useRecordContext } from 'react-admin';
import {
	formatNotification,
	IFormattedNotification,
	INotificationPayloadBase,
} from './notificationFormats';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import INotification, { INotificationBase } from '../interfaces/INotification';

export const NotificationComponent: FC<{ notification: INotificationBase }> = ({
	notification,
}) => {
	let _record = notification as INotification<INotificationPayloadBase>;
	const formattedNotificationDefault: IFormattedNotification =
		formatNotification<INotificationPayloadBase>(_record);
	return (
		<formattedNotificationDefault.content.component
			{...formattedNotificationDefault.content.props}
		/>
	);
};

const NotificationRendererView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const record: INotificationBase = useRecordContext();
	return <NotificationComponent notification={record} />;
};

const NotificationRenderer = ({
	method,
	attribute,
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <>Not implemented</>;
		case 'view':
		case 'list':
			return <NotificationRendererView attribute={attribute} method={method} />;
	}
};

export default NotificationRenderer;
