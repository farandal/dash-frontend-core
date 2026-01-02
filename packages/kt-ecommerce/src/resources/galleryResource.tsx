
import Image from "@mui/icons-material/Image";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

import {DASHAppConstants} from "dash-constants";
import { gallerySchema } from "..";

import { IDashAutoAdminResourceConfig } from "dash-auto-admin";

const Icon = Image as unknown as React.FC;

const galleryResource: IDashAutoAdminResourceConfig = 
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "ecommerce/gallery",
    group: "resource.groups.products",
    label: "resource.ecommerce.galleries.label",
    schema: gallerySchema,
    dataGridProps: {
        //bulkActionButtons: false,
        rowClick:false,
    
    },
    icon: <Icon />,
    menu: [
        {
            title: "resource.ecommerce.galleries.menu_list",
            redirect: "/ecommerce/gallery",
        },
        {
            title: "🗑",
            redirect: "/ecommerce/gallery/trash",
        },
    ],
    mainAction: {
        title: "resource.ecommerce.galleries.main_action",
        mode: "create",
        fn:"redirect",
        redirect: "create",
    },
    referenceFilters: [
        {
            id: "Nombre",
            label: "resource.ecommerce.galleries.filter_name",
            source: "title", // id field
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
       
    ],
    drawer: true,
    drawerOptions: {
        create: false,
        edit: false,
        view: true
    },
    isFormData: true,
    //search: true
    
    listViewButton: { enabled: true },
    listEditButton: { enabled: true },
    listDeleteButton: { enabled: true },
    toolbarViewButton: { enabled: false },
    showDialogAfterSubmit: false,
    refreshAfter: true,
    redirectAfterCreate: "list",
    beforeSubmit: (values) => {
        if (!values.images?.length && !values.current_images?.length) {
            throw { error: "Debe seleccionar al menos una imágen" };
            //return false;
        }

        return values;
    },
    postFormatter: (params) => {
        if (params.primary_image_id === null)
            delete params.primary_image_id;
        //if ((!params.current_images || params.current_images.length === 0) && params.images) { params.current_images = params.images.map(i => i.id) }
        if (!params.current_images) params.current_images = [];
        if (!params.images) params.images = [];

        return params;
    },
    formPostFormatter(params, form) {
        if (params.current_images) {
            form.delete("current_images[]");
            params.current_images.forEach((image_index, idx) => {
                if (image_index) {
                    form.append("current_images[]", image_index);
                    form.append("current_images_position[]", idx);
                }
            });
        }

        // Handle images_order array to properly format it for FormData
        if (params?.images_order && Array.isArray(params.images_order)) {
            form.delete("images_order[]");
            form.delete("images_order");
            
            params.images_order.forEach((orderItem, idx) => {
                if (orderItem && orderItem.id !== undefined && orderItem.display_order !== undefined) {
                    form.append(`images_order[${idx}][id]`, orderItem.id.toString());
                    form.append(`images_order[${idx}][display_order]`, orderItem.display_order.toString());
                }
            });
        }

        if (params?.product_ids) {
            form.delete("product_ids[]");
            params.product_ids.forEach((productId) => {
                if (typeof productId === "object") {
                    //console.log("array product id",productId);
                    form.append("product_ids[]", productId["id"]);
                } else {
                    //console.log("number product id",productId);
                    form.append("product_ids[]", productId);
                }
            });
        }

        if (params?.images) {
            form.delete("images[]");
            params.images.forEach((image) => {
                if (!image.id) form.append("images[]", image as Blob);
            });
        }

        if (params?.tenant_id) {
            form.append("tenant_id", params.tenant_id);
        }

        return form;
    },
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    processErrors: false,
}

export default galleryResource;