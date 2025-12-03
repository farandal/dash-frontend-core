/**
 * useDashDefaultLazyI18nProvider Hook
 * 
 * Hook to load i18n provider asynchronously
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { loadDashDefaultTranslationsAsync, createDashDefaultI18nProviderAsync } from '../i18n/dashDefaultI18nProvider';
import { fromPairs } from 'lodash';

export const useDashDefaultLazyI18nProvider = () => {
    const [translations, setTranslations] = useState<any>(null);
    const [i18nProvider, setI18nProvider] = useState<any>(null);
    const settings = useSelector((state: any) => state.settings);

    useEffect(() => {
        const load = async () => {
            try {
                const translationsData = await loadDashDefaultTranslationsAsync();
                setTranslations(translationsData);

                const provider = await createDashDefaultI18nProviderAsync(
                    settings?.locale || 'en',
                    settings?.availableLocales?.map(({ locale, name }: { locale: string; name: string }) => ({ locale, name }))
                );
                setI18nProvider(provider);
            } catch (error) {
                console.error('Failed to load translations:', error);
            }
        };

        load();
    }, [settings?.locale, settings?.availableLocales]);

    return { translations, i18nProvider };
};

export default useDashDefaultLazyI18nProvider;
