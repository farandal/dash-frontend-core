import {TrashTemplate,ResourceTemplate} from "dash-admin";
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import Dot from "@mui/icons-material/FiberManualRecord";
import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import React from "react";
import IReferenceFilter from "dash-auto-admin/src/interfaces/IReferenceFilter";
import { SelectInput } from "react-admin";
const Icon = Dot as unknown as React.FC;

const TodoSchema: IDashAutoAdminAttribute[] = [
    {
            tab: 'Todo',
            attribute: 'name',
            label: 'Nombre',
            type: String,
    },
{
            tab: 'Todo',
            attribute: 'description',
            label: 'Description',
            type: 'textarea',
    },
{
            tab: 'Todo',
            attribute: 'completed',
            label: 'Completed',
            type: Boolean,
    }

];

const TodoFilters:  IReferenceFilter[] = [
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


const enableTrash = true;
const TodoResource: IDashAutoAdminResourceConfig =
{
    roles: ["*"],
    component: ResourceTemplate,
    //trash: true,
    model: "example/todo",
    label: "Todo",
    schema: TodoSchema,
    icon: <Icon />,
    group: "Example",
    trash: enableTrash,
    menu: [
        {
            title: "List",
            redirect: "/example/todo",
        },
        ...(enableTrash ? [{
            title: "Trash",
            redirect: "/example/todo/trash",
        }] : []),
    ],

    referenceFilters: TodoFilters,

    mainAction: {
        title: "Crear Todo",
        mode: "create",
        fn:"virtualhash",
        redirect: "inline/create",
    },

    view: true,
    create: true,
    edit: true,
    
    drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: true
    },

    isFormData: true,
    formGroupMode: "tabs",

    postFormatter: (params) => {
        return params;
    },

    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    listProps: {storeKey: false},
    resetSelectedIdsOnLoad: true,

};

export default TodoResource;