import { INotificationPayload } from "panel/notificationFormats";
import { ReactNode } from "react";
import { LogTxtFileComponent } from "../LogFile";
import MUISimpleJsonTable from "../MuiSimpleJsonTable";
import NotificationAttributesTable from "../NotificationAttributesTable";
import { ILog, ILogTxtFileComponent } from 'panel/interfaces/Log';

export interface IValidateProductsToImportNotification {
    filepath: string;
    notificationPayload: INotificationPayload<IValidateProductsToImportNotification>
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