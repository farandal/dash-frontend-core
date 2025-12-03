import Dot from "@mui/icons-material/FiberManualRecord";
import React from "react";
import IReferenceFilter from "dash-auto-admin/src/interfaces/IReferenceFilter";
import { SelectInput } from "react-admin";

const demoFilters:  IReferenceFilter[] = [
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
		id: 'completed',
		label: 'Status',
		source: 'completed',
		reference: [
			{ id: '1', name: 'Completado' },
			{ id: '0', name: 'Incompleto' },
		],
		optionText: 'completed', // field from the model
		alwaysOn: true,
		referenceComponent: SelectInput,
	}
];

export default demoFilters;