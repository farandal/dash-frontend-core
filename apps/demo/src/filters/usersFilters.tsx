import IReferenceFilter from 'dash-auto-admin/src/interfaces/IReferenceFilter';
const usersReferenceFilters: IReferenceFilter[] = [
	{
		id: 'q',
		label: 'Nombres/Email/Busqueda General',
		source: 'q',
		alwaysOn: true,
		reference: null,
		optionText: null,
	},
	{
		id: 'email',
		label: 'Email',
		source: 'email',
		alwaysOn: true,
		reference: null,
		optionText: null,
	},
];

export default usersReferenceFilters;
