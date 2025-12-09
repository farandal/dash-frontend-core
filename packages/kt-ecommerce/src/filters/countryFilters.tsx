import IReferenceFilter from 'dash-auto-admin/src/interfaces/IReferenceFilter';
import { SelectInput } from 'react-admin';

const countryReferenceFilters: IReferenceFilter[] = [
	{
		id: 'name',
		label: 'Nombre',
		source: 'name',
		alwaysOn: true,
		reference: null,
		optionText: null,
	},
	{
		id: 'status_id',
		label: 'Estado',
		source: 'status_id',
		alwaysOn: true,
		reference: [
			{ id: '0', name: 'Inactiva' },
			{ id: '1', name: 'Activa' },
			{ id: 'Todos', name: 'Todos' },
		],
		optionText: 'name',
		//fieldOptions: { defaultValue: 'Todos' }, 
		referenceComponent: SelectInput,
	},
];

export default countryReferenceFilters;
