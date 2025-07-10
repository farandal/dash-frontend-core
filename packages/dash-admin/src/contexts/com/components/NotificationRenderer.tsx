import React, { FC } from 'react';
import { useRecordContext } from 'react-admin';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { IDashNotificationBase, IDashNotificationPayloadBase } from '../../../interfaces/communication/INotification';
import { IDashFormattedNotification, formatNotification } from './notificationFormats';

export const NotificationComponent: FC<{ notification: IDashNotificationBase<any> }> = ({
	notification,
}) => {
	let _record = notification as IDashNotificationBase<IDashNotificationPayloadBase>;
	const formattedNotificationDefault: IDashFormattedNotification =
		formatNotification(_record);
	return (
		<formattedNotificationDefault.content notification={_record} />
	);
};

const NotificationRendererView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const record: IDashNotificationBase<any> = useRecordContext();
	return <NotificationComponent notification={record} />;
};

const NotificationRenderer = ({
	method,
	attribute,
    resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <>Not implemented</>;
		case 'view':
		case 'list':
			return <NotificationRendererView attribute={attribute} method={method} resourceConfig={resourceConfig}  />;
	}
};

export default NotificationRenderer;
