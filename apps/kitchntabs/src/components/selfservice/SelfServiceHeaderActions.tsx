import React, { useState, useEffect, useCallback } from 'react';
import { PropsWithChildren } from 'react';
import { Box, IconButton, Badge, Drawer, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import SelfServiceNotificationsCenter from '../../kt-selfservice/components/SelfServiceNotificationsCenter';
import SelfServiceSettingsForm from '../../kt-selfservice/components/SelfServiceSettingsForm';
import { useSelfServiceEcho } from '../../kt-selfservice/contexts/SelfServiceEchoContext';
import { useAxios } from 'dash-axios-hook';
import { useTranslate } from 'react-admin';

const SelfServiceHeaderActions: React.FC<PropsWithChildren> = (props) => {
    const translate = useTranslate();
    const axios = useAxios();
    
    // Notification drawer state
    const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Settings drawer state
    const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
    
    // Extract session hash from URL
    const pathMatch = window.location.pathname.match(/\/selfservice\/([A-Z0-9]{5,})/i);
    const sessionHash = pathMatch ? pathMatch[1] : '';

    // Get websocket events
    const { lastEvent } = useSelfServiceEcho();

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!sessionHash) return;
        try {
            const response = await axios.get(`/public/selfservice/${sessionHash}/notifications`);
            if (response.data?.notifications) {
                const unread = response.data.notifications.filter((n: any) => !n.is_read).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error('Failed to fetch notification count', err);
        }
    }, [sessionHash]);

    // Initial fetch
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Update count when new events arrive
    useEffect(() => {
        if (lastEvent?.event === 'selfservice_session_order_status_update') {
            // New notification arrived, increment count
            setUnreadCount(prev => prev + 1);
        }
    }, [lastEvent]);

    // Callback to refresh count when drawer closes (after marking as read)
    const handleNotificationsDrawerClose = () => {
        setIsNotificationsDrawerOpen(false);
        // Refresh count after drawer closes
        setTimeout(fetchUnreadCount, 300);
    };

    // Handle settings save
    const handleSettingsSave = () => {
        setIsSettingsDrawerOpen(false);
        // Optionally show a success message or refresh data
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', gap: 1 }}>
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
            </Box>

            {/* Notifications Drawer */}
            <Drawer
                anchor="right"
                open={isNotificationsDrawerOpen}
                onClose={handleNotificationsDrawerClose}
            >
                <Box sx={{ width: 350, maxWidth: '90vw', height: '100%' }}>
                    <SelfServiceNotificationsCenter 
                        sessionHash={sessionHash} 
                        onNotificationsRead={fetchUnreadCount}
                    />
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

export default SelfServiceHeaderActions;