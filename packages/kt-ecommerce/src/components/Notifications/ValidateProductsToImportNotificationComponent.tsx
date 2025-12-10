
import { ReactNode } from "react";

import MUISimpleJsonTable from "../MuiSimpleJsonTable";

export interface IValidateProductsToImportNotification {
    filepath: string;
    //notificationPayload: INotificationPayload<IValidateProductsToImportNotification>
    notificationPayload: any;
    json: any;
    children?: ReactNode
}

const ValidateProductsToImportNotificationComponent: React.FC<IValidateProductsToImportNotification> = ({  notificationPayload,children, ...props }) => {
//return <>{JSON.stringify(notificationPayload.notificationPayload.json)}</>
return <>
<MUISimpleJsonTable tableData={notificationPayload.notificationPayload.json.info} vertical={true} />
</>
   /* return(<NotificationAttributesTable tableData={notificationPayload.notificationPayload.json} />)*/
}

export default ValidateProductsToImportNotificationComponent;