import { Tab, ReferenceManyField, ReferenceArrayField } from 'react-admin';
import AutoDataGrid from './AutoDataGrid';
import ExtendedPagination from './components/ExtendedPagination';
import { IDashAutoAdminReference } from '../interfaces/IDashAutoAdminReference';

export const AutoReferenceTab = (reference: IDashAutoAdminReference) => {
	const type = reference.type ? reference.type : 'ReferenceManyField';
	return (
		<Tab key={reference.reference} label={reference.tab || reference.reference}>
			{type === 'ReferenceManyField' && (
				<ReferenceManyField
					fullWidth
					reference={reference.reference}
					//target={[...reference.target]}
					target={reference.target}
					//addLabel={false}
					pagination={<ExtendedPagination />}
				>
					<AutoDataGrid
						schema={reference?.schema}
						bulkActions={reference?.BulkActions}
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
					<AutoDataGrid
						schema={reference.schema}
						bulkActions={reference?.BulkActions}
					/>
				</ReferenceArrayField>
			)}
		</Tab>
	);
};

export default AutoReferenceTab;
