import React, { createContext, useContext, useMemo } from 'react';
import { createPosPaymentsApi, PosPaymentsApi } from './api';
import type { PosHttp } from './types';
import es from '../i18n/es';
import en from '../i18n/en';

/**
 * What the screens need from the app that mounts them: an HTTP client, texts and notices. Each
 * product provides its own (react-admin + DashAdmin axios on the web; its own login and client in
 * an app without react-admin), so KitchnTabs and MBTickets render the exact same components.
 */
export interface PosPaymentsKit {
    api: PosPaymentsApi;
    translate: (key: string, options?: Record<string, unknown>) => string;
    notify: (message: string, options?: { type?: 'info' | 'success' | 'warning' | 'error' }) => void;
}

const bundles: Record<string, any> = { es, en };

/** The package's own texts, used when the host's translate does not know a key. */
export function bundledTranslate(locale = 'es') {
    return (key: string, options: Record<string, unknown> = {}): string => {
        const dict = bundles[locale] ?? es;
        const value = key.split('.').reduce<any>((node, part) => (node == null ? undefined : node[part]), dict);
        if (typeof value !== 'string') return typeof options._ === 'string' ? options._ : key;

        return value.replace(/%\{(\w+)\}/g, (_, name: string) => (options[name] === undefined ? '' : String(options[name])));
    };
}

const Ctx = createContext<PosPaymentsKit | null>(null);

export const PosPaymentsProvider: React.FC<{
    http: () => PosHttp;
    translate?: PosPaymentsKit['translate'];
    notify: PosPaymentsKit['notify'];
    locale?: string;
    children: React.ReactNode;
}> = ({ http, translate, notify, locale = 'es', children }) => {
    const kit = useMemo<PosPaymentsKit>(() => {
        const own = bundledTranslate(locale);
        // The host's texts win; a key it does not know falls back to ours. Asked WITHOUT `_`: with a
        // default, react-admin answers the default and an unknown key would look known.
        const t: PosPaymentsKit['translate'] = (key, options = {}) => {
            const { _: fallback, ...rest } = options;
            const hosted = translate ? translate(key, rest) : key;
            if (hosted && hosted !== key) return hosted;

            return own(key, fallback === undefined ? rest : { ...rest, _: fallback });
        };

        return { api: createPosPaymentsApi(http), translate: t, notify };
    }, [http, translate, notify, locale]);

    return <Ctx.Provider value={kit}>{children}</Ctx.Provider>;
};

export function usePosPayments(): PosPaymentsKit {
    const kit = useContext(Ctx);
    if (!kit) throw new Error('usePosPayments: missing <PosPaymentsProvider>.');

    return kit;
}

export { es as posPaymentsEs, en as posPaymentsEn };
