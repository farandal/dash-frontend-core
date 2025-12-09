import InputMetadataFormatMappings from "../components/Metadata/InputMetadataFormatMappings";
import MarketplacesMetadataMapper from "../components/Metadata/MarketplacesMetadataMapper";
import MetadataTypeSelector from "../components/Misc/MetadataTypeSelector";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import React from "react";

const metadataFormatShcema: IDashAutoAdminAttribute[] = [

    {
        attribute: 'group',
        label: 'Grupo',
        type: String,
        sortable: true,
    },

    {
        attribute: 'name',
        label: 'Nombre',
        type: String,
        sortable: true,
    },

    {
        attribute: 'is_internal',
        label: 'Interno',
        type: Boolean,
        inList: true,
        inEdit: false,
        inCreate: false,
        inShow: false,
        sortable: true,
    },

    {   // TODO: if is_internal, do not allow this input
        attribute: 'required',
        label: 'Requerido?',
        type: Boolean,
        sortable: true,
        //processor: "Boolean"
    },

    {   // TODO: if is_internal, do not allow this input
        attribute: 'type',
        label: 'Tipo',
        type: Boolean,
        inList: false,
        //processor: "Boolean"
        custom: true,
        component: ({ method, attribute, resourceConfig }) => <MetadataTypeSelector
            method={method}
            attribute={attribute}
            resourceConfig={resourceConfig}
            choices={[
                { id: 'STRING', name: 'Texto plano' },
                { id: 'HTML', name: 'Texto HTML' },
                { id: 'DATE', name: 'Fecha' },

            ]}
        />
    },

    /* TODO!!! */

    /*
    {
        tab: "Mapeo de metadata de entrada",
        attribute: 'input_metadata_format_mappings',
        label: 'Mapeo',
        type: String,
        custom: true,
        component: InputMetadataFormatMappings,
        inList: false,
        inShow: false,
        inEdit: true
    },


    {
        tab: "Mapeo de metadata de salida",
        label: "Mapeador metadata de marketplace",
        attribute: 'output_metadata_format_mappings',
        //listAttribute: 'temp_output_metadata_format_mappings',
        type: String,
        custom: true,
        inList: false,
        component: MarketplacesMetadataMapper,
    },
    */

    /* What is this for??? */

    {

        label: 'Archivo de importación',
        type: File,
        attribute: 'metadata_formats_file',
        inList: false,
        inShow: false,
        inEdit: false,
        inCreate: false,
        processor: "Blob"
    }

];

export default metadataFormatShcema;
