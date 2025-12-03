import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import Dot from "@mui/icons-material/FiberManualRecord";
import React from "react";
import {DASHAppConstants} from "dash-constants";
import todoSchema from '../../schemas/demo/todoSchema';
import todoFilters from '../../filters/demo/todoFilters';

const Icon = Dot as unknown as React.FC;

const enableTrash = true;
const TodoResource: IDashAutoAdminResourceConfig =
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    //trash: true,
    model: "example/todo",
    label: "Todo",
    schema: todoSchema,
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

    referenceFilters: todoFilters,

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