/**
 * Dash Default Demo Schema (Todo)
 * 
 * Example schema configuration for a Todo resource.
 * Demonstrates common field types and configurations.
 */
import { IDashAutoAdminAttribute } from "dash-auto-admin";

/**
 * Dash default demo Todo schema
 * 
 * Demonstrates:
 * - String fields (name)
 * - Textarea fields (description)
 * - Boolean fields (completed)
 * - Tab grouping
 */
const dashDefaultTodoSchema: IDashAutoAdminAttribute[] = [
    {
        tab: 'Details',
        attribute: 'name',
        label: 'Name',
        type: String,
    },
    {
        tab: 'Details',
        attribute: 'description',
        label: 'Description',
        type: 'textarea',
    },
    {
        tab: 'Status',
        attribute: 'completed',
        label: 'Completed',
        type: Boolean,
    }
];

export default dashDefaultTodoSchema;
