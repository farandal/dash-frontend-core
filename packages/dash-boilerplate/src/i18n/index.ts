/**
 * I18n Module for dash-boilerplate
 * 
 * Provides lightweight internationalization infrastructure that doesn't
 * depend on react-admin, making it suitable for public landing pages.
 */

// Types
export * from './types';

// Provider factory
export { createSimpleI18nProvider } from './createSimpleI18nProvider';
export type { CreateSimpleI18nProviderOptions } from './createSimpleI18nProvider';

// React context and hooks
export {
    I18nBridgeProviderLight,
    useI18nBridgeLight,
    useBridgedLocalesLight,
    useBridgedChangeLocaleLight,
    useBridgedLocaleLight,
    useTranslateLight,
    I18nBridgeContext,
} from './I18nBridgeProviderLight';
export type { I18nBridgeProviderLightProps } from './I18nBridgeProviderLight';
