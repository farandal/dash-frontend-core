import type { ComponentType, ReactNode } from 'react';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import type { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { deviceSchema } from '../schemas/deviceSchema';

/**
 * The devices of a venue, for any DASH product. Rows come from the terminals' own announcements, so there
 * is no "create"; the backend scopes them to the venue (the tenant switcher's header for a TenancyAdmin).
 *
 * The host passes what lives in dash-admin (this package imports no dash-* module): its `ResourceTemplate`
 * as `component`, and a `contextComponent` that provides <DevicesHttpProvider> (+ the live refresh).
 */
export const createDeviceResource = (options: {
    roles: string[];
    component: ComponentType<any>;
    contextComponent: ComponentType<{ children: ReactNode; mode?: string }>;
    group?: string;
}): IDashAutoAdminResourceConfig =>
    ({
        group: options.group ?? 'dash_devices.group',
        roles: options.roles,
        component: options.component,
        contextComponent: options.contextComponent,
        trash: false,
        model: 'device/device',
        label: 'dash_devices.label',
        schema: deviceSchema,
        icon: <DevicesOtherIcon />,
        menu: [{ title: 'dash_devices.menu_list', redirect: '/device/device' }],
        referenceFilters: [{ id: 'q', label: 'dash_devices.fields.search', source: 'q', alwaysOn: true, reference: null, optionText: null }],
        view: true,
        edit: true,
        create: false,
        mutationMode: 'pessimistic',
        drawer: true,
        drawerOptions: { create: false, edit: true, view: true, show: true },
        dataGridProps: { rowClick: false },
        formGroupMode: 'tabs',
    }) as unknown as IDashAutoAdminResourceConfig;

export default createDeviceResource;
