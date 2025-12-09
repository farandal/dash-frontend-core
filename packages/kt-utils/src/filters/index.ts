/**
 * KitchnTabs Filters
 * 
 * Pre-configured filters for common resource types
 */

import type IReferenceFilter from 'dash-auto-admin/src/interfaces/IReferenceFilter';
import { SelectInput } from 'react-admin';

/**
 * Status filter options (Active/Inactive)
 */
export const statusFilterOptions = [
    { id: '0', name: 'Inactiva' },
    { id: '1', name: 'Activa' },
    { id: 'Todos', name: 'Todos' },
];

/**
 * Commune reference filters
 */
export const communeReferenceFilters: IReferenceFilter[] = [
    {
        id: 'name',
        label: 'Nombre',
        source: 'name',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
    {
        id: 'status_id',
        label: 'Estado',
        source: 'status_id',
        alwaysOn: true,
        reference: statusFilterOptions,
        optionText: 'name',
        referenceComponent: SelectInput,
    },
];

/**
 * Region reference filters
 */
export const regionReferenceFilters: IReferenceFilter[] = [
    {
        id: 'name',
        label: 'Nombre',
        source: 'name',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
    {
        id: 'status_id',
        label: 'Estado',
        source: 'status_id',
        alwaysOn: true,
        reference: statusFilterOptions,
        optionText: 'name',
        referenceComponent: SelectInput,
    },
];

/**
 * Country reference filters
 */
export const countryReferenceFilters: IReferenceFilter[] = [
    {
        id: 'name',
        label: 'Nombre',
        source: 'name',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
    {
        id: 'status_id',
        label: 'Estado',
        source: 'status_id',
        alwaysOn: true,
        reference: statusFilterOptions,
        optionText: 'name',
        referenceComponent: SelectInput,
    },
];

/**
 * Users reference filters
 */
export const usersReferenceFilters: IReferenceFilter[] = [
    {
        id: 'q',
        label: 'Nombres/Email/Busqueda General',
        source: 'q',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
    {
        id: 'email',
        label: 'Email',
        source: 'email',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
];

/**
 * Tags reference filters
 */
export const tagReferenceFilters: IReferenceFilter[] = [
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
        id: 'color',
        label: 'Color',
        source: 'color',
        alwaysOn: true,
        reference: null,
        optionText: null,
    },
];

// Default exports for backwards compatibility
export default {
    communeReferenceFilters,
    regionReferenceFilters,
    countryReferenceFilters,
    usersReferenceFilters,
    tagReferenceFilters,
};
