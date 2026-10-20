/**
 * dash-pos-payments — point-of-sale payment UI shared by every DASH product (KitchnTabs counter
 * and kiosk, MBTickets box office). Talks to core app/PosPaymentCore (`/api/pos-payments/*`);
 * starting a charge stays with each product's own endpoint (a tab, a booking).
 */
export * from './core/types';
export { createPosPaymentsApi, posErrorMessage } from './core/api';
export type { PosPaymentsApi } from './core/api';
export { PosPaymentsProvider, usePosPayments, bundledTranslate, posPaymentsEs, posPaymentsEn } from './core/context';
export type { PosPaymentsKit } from './core/context';
export { PosPaymentSettings } from './PosPaymentSettings';
export { PosChargeDialog } from './PosChargeDialog';
