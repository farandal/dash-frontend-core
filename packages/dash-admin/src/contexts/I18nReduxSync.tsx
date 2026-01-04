import React, { useEffect } from 'react';
import { useSetLocale, useLocaleState } from 'react-admin';

/**
 * I18nReduxSync
 * 
 * Synchronizes the Redux locale with the react-admin locale.
 * This component MUST be rendered INSIDE AdminContext.
 */
interface I18nReduxSyncProps {
    locale?: string;
}

const I18nReduxSync: React.FC<I18nReduxSyncProps> = ({ locale }) => {
    const setLocale = useSetLocale();
    const [currentLocale] = useLocaleState();

    useEffect(() => {
        if (locale && locale !== currentLocale) {
            setLocale(locale);
        }
    }, [locale, currentLocale, setLocale]);

    return null;
};

export default I18nReduxSync;
