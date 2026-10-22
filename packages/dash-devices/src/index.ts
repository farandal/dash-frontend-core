/**
 * dash-devices — device management UI shared by every DASH product: the devices a terminal announces
 * (door locks, cash drawers, printers), the aliases other apps pick them by, and running an action on one.
 * Talks to core app/DeviceCore (`/api/device/*`).
 */
export * from './components';
export { DevicesHttpProvider, useDevicesHttp } from './core/context';
export type { DevicesHttp } from './core/context';
export { deviceSchema } from './schemas/deviceSchema';
export { createDeviceResource } from './resources/deviceResource';
export { default as devicesEs } from './i18n/es';
export { default as devicesEn } from './i18n/en';
