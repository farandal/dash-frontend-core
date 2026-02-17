
import ImportMetadataButton from "../components/Misc/ImportMetadataButton";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import brandSchema from "../schemas/brand";
import metadataFormatShcema from "../schemas/metadata";
import Tag from "@mui/icons-material/Tag";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Tag as unknown as React.FC;

const metadataFormatsResource: IDashAutoAdminResourceConfig = 
{
   roles: [DASHAppConstants.system.SYSTEM_ROLE,DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    model: "ecommerce/metadata_format",
    group: "resource.groups.products",
    label: "Metadata",
    schema: metadataFormatShcema,
    search: true,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <Icon />,
   
    menu: [
        {
            title: "Listado de Metadatas de producto",
            redirect: "/ecommerce/metadata_format",
        },
        /*{
        title: "🗑",
        redirect: "/trash/metadata_format",
    }*/
    ],
    mainAction: {
        title: "Crear metadata",
        // type: "ghost",
        redirect: "/ecommerce/metadata_format/create",
    },

    listViewButton: { enabled: false },
    listDeleteButton: { enabled: true },
    drawer: false,
    formGroupMode: "tabs", // groups or tabs
    refreshAfter: true,

    postFormatter: (params) => {
        if (params.temp_input_metadata_format_mappings) {
            params.input_metadata_format_mappings = [
                ...new Set(
                    [].concat(...params.temp_input_metadata_format_mappings)
                ),
            ];
            params.input_metadata_format_mappings =
                params.input_metadata_format_mappings.map((ele) => {
                    return { ...ele, ...(!ele.id && { id: null }) };
                });
        }

        if (params.temp_output_metadata_format_mappings) {
            /* clean null values */
            params.temp_output_metadata_format_mappings = [
                ...new Set(
                    [].concat(
                        ...params.temp_output_metadata_format_mappings.filter(
                            (n) => n
                        )
                    )
                ),
            ];

            /* Hack to format output_metadata_format_mapping
               if there is a modified value in the form, it will send a different value than its original input.
               the system_marketplace_metadata_format_id will be send as id attribute, therefore, is necessary to clone id to system_marketplace_metadata_format_id
            */
            params.temp_output_metadata_format_mappings =
                params.temp_output_metadata_format_mappings.map(
                    (metadata_format_mapping) => {
                        return metadata_format_mapping.hasOwnProperty(
                            "ownerable_type"
                        )
                            ? {
                                  ...metadata_format_mapping,
                                  system_marketplace_metadata_format_id:
                                      metadata_format_mapping.id,
                              }
                            : metadata_format_mapping;
                    }
                );

            params.output_metadata_format_mappings =
                params.temp_output_metadata_format_mappings
                    .filter(
                        (item) =>
                            item &&
                            item.hasOwnProperty(
                                "system_marketplace_metadata_format_id"
                            )
                    )
                    .map((item) => {
                        return item.system_marketplace_metadata_format_id;
                    });
            //params.output_metadata_format_mappings = params.output_metadata_format_mappings.filter(item => item && item.hasOwnProperty("id")).map((item) => { return item.id });

            /*  Hack side effect:

                we are only sending an id's array to update; nevertheless the original input includes the full oject
                even if the mutation is pessimistic the sent values will be updated to the parsed output, therefore in the record context.
                this will cause a control rerendering, with the record context updated including the id's array instead the full object
                in the output_metadata_format_mappings attribute of the original input. making the app to crash;

                To solve this, another hack was required to be implemented at:

                Seems this issue, has no 100% solution, elsewise the full object is sent to the server, instead of only sending an id's array to update
                Hack: different input/output format handling -> /panel/components/Metadata/MarketplacesMetadataMapper.tsx
                OwnerableTypeSelector->selectedValue->filter  // if(typeof ele === 'number') return null;
             */
        }

        return params;
    },
    mutationMode: "pessimistic",
    customToolbarElements: (props) => {
        return (
            <ImportMetadataButton
                resourceName={"metadata_format/import"}
                resourceAttribute={"metadata_formats_file"}
                {...props}
            />
        );
    },
    /*customToolbarElements: (props) => {

        const config = {
            transformRows: (csvRows: any[]) => {
                return csvRows;
            }
        }

        const parseConfig = {


            delimiter: "",	// auto-detect
            newline: "",	// auto-detect
            //delimiter: ",",
            //newline: "\r\n",

            quotes: false, //or array of booleans
            quoteChar: '"',
            escapeChar: '"',

            header: true,

            transformHeader: undefined,
            dynamicTyping: false,
            preview: 1,
            encoding: "UTF-8",
            worker: false,
            comments: false,
            step: undefined,
            complete: undefined,
            error: undefined,
            download: false,
            downloadRequestHeaders: undefined,
            downloadRequestBody: undefined,
            skipEmptyLines: true,
            chunk: undefined,
            chunkSize: undefined,
            fastMode: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined,
            transform: undefined,
            delimitersToGuess: [',', '\t', '|', ';']
        }

        return  <ImportButton {...props} {...config} {...parseConfig} />  },*/

    redirectAfterUpdate: false,
    showNotifyAfterSubmit: true,
    showDialogAfterSubmit: true,
    saveButtonAlwaysEnabled: true,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default metadataFormatsResource;