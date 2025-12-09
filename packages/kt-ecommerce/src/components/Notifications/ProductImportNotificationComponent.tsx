import { INotificationPayload } from "panel/notificationFormats";
import { ReactNode } from "react";
import NotificationAttributesTable from "../NotificationAttributesTable";

export interface IProductImportNotification {
    notificationPayload: INotificationPayload<IProductImportNotification>
    children?: ReactNode
}

const ProductImportNotificationComponent: React.FC<IProductImportNotification> = ({  notificationPayload,children, ...props }) => {

    return(<NotificationAttributesTable ignore={['id','tenant_id','json']} tableData={notificationPayload.notificationPayload} />)
}

export default ProductImportNotificationComponent;