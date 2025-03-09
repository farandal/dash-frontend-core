import MUISimpleJsonTable from '../../../components/misc/MuiSimpleJsonTable';
import { INotificationPayload } from './notificationFormats';
import { ReactNode } from 'react';

export interface IDefaultNotificationComponent {
	notificationPayload: INotificationPayload<any>;
	children?: ReactNode;
}

const ValidateProductsToImportNotificationComponent: React.FC<IDefaultNotificationComponent> =
	({ notificationPayload, children, ...props }) => {
		return (
			<>
				<MUISimpleJsonTable
					tableData={notificationPayload.notificationPayload.json.info}
					vertical={true}
				/>
			</>
		);
	};

export default ValidateProductsToImportNotificationComponent;
