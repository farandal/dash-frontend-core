import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react';
import { useRecordContext } from 'react-admin';

export interface ILogViewerComponent {
	log: any;
}
export const LogViewerComponent: React.FC<ILogViewerComponent> = ({ log }) => {
	return (
		<>
			<h1>Log</h1>
		</>
	);
};

const LogViewerEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const log = useRecordContext();

	return <>{log && <LogViewerComponent log={log} />}</>;
};

const LogViewerView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const log: any = useRecordContext();
	return <>{log && <LogViewerComponent log={log} />}</>;
};

const LogViewer = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <LogViewerEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <LogViewerView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
	}
};

export default LogViewer;
