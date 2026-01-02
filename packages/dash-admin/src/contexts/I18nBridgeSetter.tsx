/**
 * I18nBridgeSetter
 * 
 * This component runs INSIDE AdminContext and sets the i18nProvider
 * to the I18nBridgeContext so components outside AdminContext can access it.
 * 
 * It should be rendered as the first child inside AdminContext.
 */
import React, { useEffect } from 'react';
import { useI18nProvider } from 'react-admin';
import { useI18nBridge } from './I18nBridgeContext';

const I18nBridgeSetter: React.FC = () => {
    const i18nProvider = useI18nProvider();
    const { setI18nProvider } = useI18nBridge();

    useEffect(() => {
        if (i18nProvider) {
            console.log('🌐 I18nBridgeSetter: Setting bridge from AdminContext', {
                hasGetLocales: !!i18nProvider.getLocales,
                locales: i18nProvider.getLocales?.(),
            });
            setI18nProvider(i18nProvider);
        }
    }, [i18nProvider, setI18nProvider]);

    // This component doesn't render anything
    return null;
};

export default I18nBridgeSetter;
