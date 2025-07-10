import MUISimpleJsonTable from '../../../components/misc/MuiSimpleJsonTable';
import { IDashNotificationBase } from '../../../interfaces/communication/INotification';

export interface IDefaultNotificationComponent {
	notification: IDashNotificationBase<any>;
}

const ValidateProductsToImportNotificationComponent: React.FC<IDefaultNotificationComponent> =
	({ notification, ...props }) => {
		return (
			<>
				<MUISimpleJsonTable
					tableData={notification.notificationPayload}
					vertical={true}
				/>
			</>
		);
	};

export default ValidateProductsToImportNotificationComponent;
