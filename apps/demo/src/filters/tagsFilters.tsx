import IReferenceFilter from 'dash-auto-admin/src/interfaces/IReferenceFilter';
const tagReferenceFilters: IReferenceFilter[] = [
	{
		id: 'name',
		label: 'Nombre',
		source: 'name',
		alwaysOn: true,
		reference: null,
		optionText: null,
	},

	{
		id: 'description',
		label: 'Descripción',
		source: 'description',
		alwaysOn: true,
		reference: null,
		optionText: null,
	},

	{
		id: 'color',
		label: 'Color',
		source: 'color',
		alwaysOn: true,
		reference: null,
		optionText: null,
	},
];

export default tagReferenceFilters;
