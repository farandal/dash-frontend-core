import type { IDashAutoAdminAttribute } from 'dash-auto-admin';
import { AliasesField, DeviceActionsField, DeviceStatusField } from '../components';

/**
 * A device row. What the agent REPORTS (uid, driver, capabilities, connection) is read-only here: typing a
 * vendor id would describe hardware that is not there, and the next announce overwrites it. What the admin
 * owns is the name, the aliases other apps pick it by, the flags and the config.
 */
export const deviceSchema: IDashAutoAdminAttribute[] = [
    { tab: 'dash_devices.tabs.general', attribute: 'name', label: 'dash_devices.fields.name', type: String, sortable: true, inList: true, inShow: true, inEdit: true, inCreate: false },
    { tab: 'dash_devices.tabs.general', attribute: 'type', label: 'dash_devices.fields.type', type: String, inList: true, inShow: true, inEdit: false, inCreate: false },
    { tab: 'dash_devices.tabs.general', attribute: 'connection_status', label: 'dash_devices.fields.status', type: String, custom: true, component: DeviceStatusField, inList: true, inShow: true, inEdit: false, inCreate: false },
    { tab: 'dash_devices.tabs.general', attribute: 'aliases', label: 'dash_devices.fields.aliases', type: 'custom', component: AliasesField, inList: true, inShow: true, inEdit: true, inCreate: false },
    { tab: 'dash_devices.tabs.general', attribute: 'node_name', label: 'dash_devices.fields.terminal', type: String, inList: true, inShow: true, inEdit: false, inCreate: false },
    { tab: 'dash_devices.tabs.general', attribute: 'actions', label: 'dash_devices.fields.actions', type: String, custom: true, component: DeviceActionsField, inList: true, inShow: true, inEdit: false, inCreate: false },

    { tab: 'dash_devices.tabs.settings', attribute: 'active', label: 'dash_devices.fields.active', type: Boolean, showLabel: false, inList: false, inShow: true, inEdit: true, inCreate: false },
    { tab: 'dash_devices.tabs.settings', attribute: 'is_configured', label: 'dash_devices.fields.is_configured', type: Boolean, showLabel: false, inList: false, inShow: true, inEdit: true, inCreate: false },
    { tab: 'dash_devices.tabs.settings', attribute: 'config', label: 'dash_devices.fields.config', type: 'custom', component: 'Json', showLabel: false, inList: false, inShow: true, inEdit: true, inCreate: false },

    { tab: 'dash_devices.tabs.hardware', attribute: 'driver', label: 'dash_devices.fields.driver', type: String, inList: false, inShow: true, inEdit: false, inCreate: false },
    { tab: 'dash_devices.tabs.hardware', attribute: 'device_uid', label: 'dash_devices.fields.device_uid', type: String, inList: false, inShow: true, inEdit: false, inCreate: false },
    { tab: 'dash_devices.tabs.hardware', attribute: 'last_seen_at', label: 'dash_devices.fields.last_seen_at', type: Date, fieldProps: { showTime: true }, inList: false, inShow: true, inEdit: false, inCreate: false },
    { tab: 'dash_devices.tabs.hardware', attribute: 'last_error', label: 'dash_devices.fields.last_error', type: String, inList: false, inShow: true, inEdit: false, inCreate: false },
] as IDashAutoAdminAttribute[];

export default deviceSchema;
