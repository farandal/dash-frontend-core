/**
 * Dash Default Base Schema
 * 
 * Base schema configuration with common attributes.
 * This schema can be extended or merged with resource-specific schemas.
 */
import { IDashAutoAdminAttribute } from 'dash-auto-admin';

/**
 * Dash default schema with basic ID field
 * Most resources will need an ID field, so this provides
 * a sensible default configuration.
 */
const dashDefaultSchema: IDashAutoAdminAttribute[] = [
    {
        attribute: 'id',
        label: 'ID',
        type: String,
        sortable: true,
        inEdit: false,
        inCreate: false,
    },
];

export default dashDefaultSchema;
