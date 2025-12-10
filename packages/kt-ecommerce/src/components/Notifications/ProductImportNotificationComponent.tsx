
import { ReactNode } from "react";
import NotificationAttributesTable from "../NotificationAttributesTable";

export interface IProductImportNotification {
   // notificationPayload: INotificationPayload<IProductImportNotification>
    notificationPayload:any
    children?: ReactNode
}

const ProductImportNotificationComponent: React.FC<IProductImportNotification> = ({  notificationPayload,children, ...props }) => {

    return(<NotificationAttributesTable ignore={['id','tenant_id','json']} tableData={notificationPayload.notificationPayload} />)
}

export default ProductImportNotificationComponent;