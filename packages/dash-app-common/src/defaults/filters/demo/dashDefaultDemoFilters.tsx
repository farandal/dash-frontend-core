/**
 * Dash Default Demo Filters
 * 
 * Example filter configurations for demonstration purposes.
 * These filters showcase different filter types and configurations.
 */
import React from "react";
import { SelectInput } from "react-admin";
import IReferenceFilter from "dash-auto-admin/src/interfaces/IReferenceFilter";

/**
 * Dash default demo filters for resource lists
 * 
 * Demonstrates:
 * - Text filters (name, description)
 * - Select filters with static options (status)
 */
const dashDefaultDemoFilters: IReferenceFilter[] = [
    {
        id: 'name',
        label: 'Name',
        source: 'name',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
    {
        id: 'description',
        label: 'Description',
        source: 'description',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
    {
        id: 'status',
        label: 'Status',
        source: 'status',
        reference: [
            { id: 'active', name: 'Active' },
            { id: 'inactive', name: 'Inactive' },
            { id: 'pending', name: 'Pending' },
        ],
        optionText: 'status',
        alwaysOn: true,
        referenceComponent: SelectInput,
    }
];

export default dashDefaultDemoFilters;
