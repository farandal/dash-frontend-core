import { FormTab, ReferenceManyField, ReferenceArrayField } from 'react-admin';
import { IDashAutoAdminReference } from '../interfaces/IDashAutoAdminReference';

import AutoDataGrid from './AutoDataGrid';
import ExtendedPagination from './components/ExtendedPagination';

const AutoReferenceFormTab = (reference: IDashAutoAdminReference) => {
	const type = reference.type ? reference.type : 'ReferenceManyField';

	return (
		<FormTab
			key={reference.reference}
			label={reference.tab || reference.reference}
		>
			{type === 'ReferenceManyField' && (
				<ReferenceManyField
					fullWidth
					reference={reference.reference}
					//target={[...reference.target]}
					target={reference.target}
					//addLabel={false}
					pagination={<ExtendedPagination />}
				>
					{/* TODO: replace AutoDataGrid to DashAutoList */}
					<AutoDataGrid
						schema={reference.schema}
					/>
				</ReferenceManyField>
			)}

			{type === 'ReferenceArrayField' && (
				<ReferenceArrayField
					fullWidth
					reference={reference.reference}
					//target={[...reference.target]}
					source={reference.target}
					//addLabel={false}
					pagination={<ExtendedPagination />}
				>
					{' '}
					{/* TODO replace AutoDataGrid to DashAutoList */}
					<AutoDataGrid
						schema={reference.schema} /*BulkActions={reference.BulkActions}*/
					/>
				</ReferenceArrayField>
			)}
		</FormTab>
	);
};

export default AutoReferenceFormTab;
