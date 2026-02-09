/**
 * Tenancy components barrel export
 */
export { default as TenantSwitcher } from './TenantSwitcher';
export {
    dispatchTenantSwitchEvent,
    getActiveTenantId,
    isTenantImpersonationEnabled,
} from './TenantSwitcher';
export type { TenantSwitchEventDetail } from './TenantSwitcher';
