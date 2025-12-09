
import React, { FC } from 'react'
import { useRecordContext } from "react-admin";
//import NotificationAttributesTable from '../NotificationAttributesTable';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { IDashNotificationBase, IDashNotificationPayloadBase } from 'dash-admin/src/interfaces/communication/INotification';
import { IDashFormattedNotification, formatNotification } from 'dash-admin/src/contexts/com/components/notificationFormats';


    export interface INotificationComponent<T extends IDashNotificationPayloadBase> {
        notification: IDashNotificationBase<T>
        titleComponent?: React.FC<{ notification: IDashNotificationBase<T> }>,
        iconComponent?: React.FC<{ notification: IDashNotificationBase<T> }>,
        contentComponent?: React.FC<{ notification: IDashNotificationBase<T> }>,
    }
    export const NotificationComponent: FC<INotificationComponent<any>> = ({ notification, titleComponent, iconComponent, contentComponent }) => {
        const formattedNotification: IDashFormattedNotification = formatNotification(notification, titleComponent, iconComponent, contentComponent);
        return (
            <>
                <div className={`dash-notification ${formattedNotification.class}`}>
                    <div className="notification-icon">
                        <formattedNotification.icon notification={notification} />
                    </div>
                    <div className="dash-notification-content">
                        <div className="notification-title">
                            <formattedNotification.title notification={notification} />
                        </div>
                        <div className="dash-notification-body">
                            <formattedNotification.content notification={notification} />
                        </div>
                    </div>
                </div>
            </>
        );
    }
const NotificationRendererView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record: IDashNotificationBase<any> = useRecordContext();
    return <NotificationComponent notification={record}  />

}

const NotificationRendererEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const record = useRecordContext();
    return (<></>)
}

const NotificationRenderer = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <NotificationRendererEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <NotificationRendererView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    }
}

export default NotificationRenderer;
