import { Resource } from 'react-admin';

import AutoCreate from './DashAutoCreate';
import AutoEdit from './DashAutoEdit';
import AutoShow from './DashAutoShow';
import IRecord from './interfaces/IRecord';
import DashAutoList from './DashAutoList';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import React from 'react';
import isFC from './utils/isFC';

export interface IAutoResource {
	//model: string
	//label: string
	//schema: IDashAutoAdminAttribute[]
	resourceConfig: IDashAutoAdminResourceConfig;
	//references?: IDashAutoAdminReference[]
	//exporter?: any;
	//referenceFilters?: IReferenceFilter[]
	show?: boolean | React.FC;
	list?: boolean | React.FC;
	edit?: boolean | React.FC;
	create?: boolean | React.FC;
	//icon?: any | JSX.Element | React.ReactNode
	//group?: string
	//search?: boolean
	//beforeSubmit?: (values: any) => any
}

const DashAutoResource = ({
	resourceConfig,
	show,
	list,
	edit,
	create,
}: IAutoResource) => {
	const props: any = {};

	if (typeof list !== 'boolean' && isFC(list)) {
		const CustomList: React.FC<IRecord> = list;
		props.list = () => <CustomList resourceConfig={resourceConfig} />;
	} else if (list !== false) {
		props.list = () => <DashAutoList resourceConfig={resourceConfig} />;
	}

	if (!resourceConfig.drawer) {
		if (typeof show !== 'boolean' && isFC(show)) {
			const CustomShow: React.FC<IRecord> = show;
			props.show = () => <CustomShow resourceConfig={resourceConfig} />;
		} else if (show !== false) {
			props.show = () => <AutoShow resourceConfig={resourceConfig} />;
		}

		if (typeof edit !== 'boolean' && isFC(edit)) {
			const CustomEdit: React.FC<IRecord> = edit;
			props.edit = () => <CustomEdit resourceConfig={resourceConfig} />;
		} else if (edit !== false) {
			props.edit = () => <AutoEdit resourceConfig={resourceConfig} />;
		}

		if (typeof create !== 'boolean' && isFC(create)) {
			const CustomCreate: React.FC<IRecord> = create;
			//props.list = () => <Create />
			props.create = () => <CustomCreate resourceConfig={resourceConfig} />;
		} else if (create !== false) {
			props.create = () => <AutoCreate resourceConfig={resourceConfig} />;
		}
	}

	return (
		<Resource
			options={{
				label: resourceConfig.label,
				...(resourceConfig.group && { group: resourceConfig.group }),
			}}
			name={resourceConfig.model}
			{...props}
			icon={resourceConfig.icon}
			group={resourceConfig.group}
		/>
	);
};

export default DashAutoResource;
