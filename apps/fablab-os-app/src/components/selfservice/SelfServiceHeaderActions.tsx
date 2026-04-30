import React, { useState, useEffect, PropsWithChildren } from 'react';
import { useQuery, useQueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashQueryClient, useI18nBridge } from 'dash-admin';
// I18nContext is imported from ra-core below
import { Box, IconButton, Badge, Drawer, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import SelfServiceNotificationsCenter, { ISelfServiceNotification } from '../../kt-selfservice/components/SelfServiceNotificationsCenter';
import SelfServiceSettingsForm from '../../kt-selfservice/components/SelfServiceSettingsForm';
import { useSelfServiceEcho } from '../../kt-selfservice/contexts/SelfServiceEchoContext';
import { useAxios } from 'dash-axios-hook';
import { useTranslate } from 'react-admin';
import { toast } from 'react-toastify';
import { playDigitalWatchAlarm, unlockAudio } from '../Notifications/CustomNotificationsProcessing';

const SelfServiceHeaderActionsContent: React.FC<PropsWithChildren> = (props) => {
    const translate = useTranslate();
    const axios = useAxios();
    
    // Notification drawer state
    const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
    
    // Settings drawer state
    const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

    // Extract session hash from URL
    const pathMatch = window.location.pathname.match(/\/selfservice\/([A-Z0-9]{5,})/i);
    const sessionHash = pathMatch ? pathMatch[1] : '';

    const queryClient = useQueryClient();

    // Fetch notifications for count
    const { 
        data: notifications = [], 
        refetch: fetchNotifications 
    } = useQuery<ISelfServiceNotification[]>({
        queryKey: ['selfservice', 'notifications', sessionHash],
        queryFn: async () => {
            if (!sessionHash) return [];
            const response = await axios.get(`/public/selfservice/${sessionHash}/notifications`);
            return response.data?.notifications || [];
        },
        enabled: !!sessionHash,
        staleTime: 1000 * 10, // 10 seconds
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Get websocket events
    const { lastEvent } = useSelfServiceEcho();

    // Update count when new events arrive
    useEffect(() => {
        if (lastEvent?.event === 'selfservice_session_order_status_update') {
            // New notification arrived, invalidate cache to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['selfservice', 'notifications', sessionHash] });

            // Show toast
            const message = lastEvent.message || 
                          lastEvent.data?.message || 
                          lastEvent.status_localized || 
                          lastEvent.data?.status_localized ||
                          translate('selfservice.notifications.new_update', { _: 'Nueva actualización del pedido' });
            
            if (message) {
                 toast.info(message, {
                    position: 'top-center',
                    autoClose: 3000,
                 });
            }

            // Play alarm for delivered orders
            const status = lastEvent.status || lastEvent.data?.status;
            if (status === 'DELIVERED') {
                 console.log('🔔 Order DELIVERED - Playing alarm');
                 playDigitalWatchAlarm();
            }
        }
    }, [lastEvent, translate, queryClient, sessionHash]);

    // Unlock audio on first interaction
    useEffect(() => {
        const handleInteraction = () => {
            unlockAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    // Callback to refresh count when drawer closes (after marking as read)
    const handleNotificationsDrawerClose = () => {
        setIsNotificationsDrawerOpen(false);
        // Refresh count after drawer closes
        setTimeout(fetchNotifications, 300);
    };

    // Handle settings save
    const handleSettingsSave = () => {
        setIsSettingsDrawerOpen(false);
        // Optionally show a success message or refresh data
    };

    return (
        <>
                {/* Settings Button */}
                <IconButton 
                    onClick={() => setIsSettingsDrawerOpen(true)}
                    color="inherit"
                    size="large"
                    title={translate('selfservice.settings.title', { _: 'Configuración' })}
                >
                    <SettingsIcon />
                </IconButton>

                {/* Notifications Button */}
                <IconButton 
                    onClick={() => setIsNotificationsDrawerOpen(true)}
                    color="inherit"
                    size="large"
                    title={translate('selfservice.notifications.title', { _: 'Notificaciones' })}
                >
                    <Badge 
                        badgeContent={unreadCount} 
                        color="error" 
                        invisible={unreadCount === 0}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
          
            {/* Notifications Drawer */}
            <Drawer
                anchor="right"
                open={isNotificationsDrawerOpen}
                onClose={handleNotificationsDrawerClose}
            >
                <Box sx={{ width: 350, maxWidth: '90vw', height: '100%' }}>
                    {isNotificationsDrawerOpen && (
                        <SelfServiceNotificationsCenter 
                            sessionHash={sessionHash} 
                        />
                    )}
                </Box>
            </Drawer>

            {/* Settings Drawer */}
            <Drawer
                anchor="right"
                open={isSettingsDrawerOpen}
                onClose={() => setIsSettingsDrawerOpen(false)}
            >
                <Box sx={{ width: 350, maxWidth: '90vw', height: '100%' }}>
                    <SelfServiceSettingsForm
                        onSave={handleSettingsSave}
                        onClose={() => setIsSettingsDrawerOpen(false)}
                        showCloseButton={true}
                        showTitle={true}
                        title={translate('selfservice.settings.title', { _: 'Configuración de sesión' })}
                    />
                </Box>
            </Drawer>
        </>
    );
};

import { I18nContext } from 'ra-core';

// ...

const SelfServiceHeaderActions: React.FC<PropsWithChildren> = (props) => {
    // We try to get the query client from the shared context to avoid "No QueryClient set"
    // which happens when multiple versions of @tanstack/react-query exist in a monorepo.
    const queryClient = useDashQueryClient();

    // Get the bridged i18n provider
    const { i18nProvider, locale } = useI18nBridge();

    const i18nContext = React.useMemo(() => ({
        translate: (key: string, options?: any) => i18nProvider ? i18nProvider.translate(key, options) : key,
        changeLocale: (locale: string) => i18nProvider ? i18nProvider.changeLocale(locale) : Promise.resolve(),
        getLocale: () => locale,
    }), [i18nProvider, locale]);

    if (!queryClient) {
        // Even if no query client (fallback), we should still try to provide translations if possible
        if (i18nProvider) {
            return (
                <I18nContext.Provider value={i18nContext}>
                    <SelfServiceHeaderActionsContent {...props} />
                </I18nContext.Provider>
            );
        }
        return <SelfServiceHeaderActionsContent {...props} />;
    }

    return (
        <QueryClientProvider client={queryClient as any}>
            <I18nContext.Provider value={i18nContext}>
                <SelfServiceHeaderActionsContent {...props} />
            </I18nContext.Provider>
        </QueryClientProvider>
    );
};

export default SelfServiceHeaderActions;