

import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";
import * as schemas from "../schemas";
import CategoryListComponent from "../components/Category/CategoryTree/CategoryListComponent";
import Category from "@mui/icons-material/Category";
import {DASHAppConstants} from "dash-constants";

const Icon = Category as unknown as React.FC;

const categoryResource: IDashAutoAdminResourceConfig = 
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    trash: false,
    model: "ecommerce/category",
    group: "resource.groups.products",
    label: "resource.ecommerce.categories.label",
    schema: schemas.categorySchema,
    icon: <Icon />,
    menu: [
        {
            title: "resource.ecommerce.categories.menu_list",
            redirect: "/ecommerce/category",
        },
        /*{
            title: "🗑",
            redirect: "/ecommerce/category/trash",
        },*/
    ],
    mainAction: {
        title: "resource.ecommerce.categories.main_action",
        mode: "create",
        fn:"virtualhash",
        redirect: "inline/create",
    },
    drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: true
    },

    search: true,
    postFormatter: (params) => {
        if (params.tmp_output_category_mappings) {
            params.tmp_output_category_mappings =
                params.tmp_output_category_mappings
                    .filter((i) => i)
                    .map((ele) => {
                        return { ...ele, ...(!ele.id && { id: null }) };
                    });
        }
        params.output_category_mappings =
            params.tmp_output_category_mappings;
        params.output_category_mappings = params.output_category_mappings
            ? params.output_category_mappings
                .map((i) => i.system_marketplace_category_id)
                .filter((i) => i)
            : [];

        if (params.input_category_mappings) {
            params.input_category_mappings =
                params.input_category_mappings.map((i) => i.text);
        } else {
            params.input_category_mappings = [];
        }

        return params;
    },
    listComponent: (resourceConfig) => (
        <CategoryListComponent method={"edit"} attribute={undefined} resourceConfig={undefined} />
    ),
    refreshAfter: true,
    mutationMode: "pessimistic",
    // when the form is submitted, the postFormatter overwrites the record attribute output_category_mappings
    // this change updates the Category Output Mapper component with the wrong values.
    // The mutation is passed to the dataProvider first.
    // When the dataProvider returns successfully, the mutation is applied locally, and the side effects are executed.

    saveButtonAlwaysEnabled: true,
    processErrors: false,
    isFormData: true,
}

export default categoryResource;