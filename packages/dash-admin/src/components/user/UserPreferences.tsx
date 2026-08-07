import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
    CircularProgress, 
    Box, 
    Typography, 
    Switch, 
    FormControlLabel, 
    Card, 
    CardContent, 
    Alert,
    Button,
    Snackbar,
    Tabs,
    Tab,
    TextField,
    Slider,
    InputAdornment,
} from "@mui/material";
import { 
    Save as SaveIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAxios } from 'dash-axios-hook';
import { AuthPersistenceService } from 'dash-auth';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface NotificationConfig {
    id: string;
    name: string;
    className: string;
    hasEmail: boolean;
    hasPush: boolean;
    hasSocket: boolean;
    hasDatabase: boolean;
}

interface NotificationPreference {
    id: string;
    name: string;
    email: boolean;
    push: boolean;
}

interface PreferenceFormat {
    id: string;
    group: string;
    tab: string;
    attribute: string;
    label: string;
    visible: boolean;
    required: boolean;
    custom?: boolean;
    type: 'boolean' | 'integer' | 'string' | 'textarea' | 'select' | 'custom';
    component?: string;
    editable: boolean;
    rules?: string;
    default_value: any;
    description?: string;
    min?: number;
    max?: number;
    maxLength?: number;
    rows?: number;
    options?: { value: any; label: string }[];
}

interface GroupConfig {
    label: string;
    icon: string;
    order: number;
    description?: string;
}

interface PreferencesResponse {
    preferences: Record<string, any>;
    preference_formats: PreferenceFormat[];
    groups: Record<string, GroupConfig>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getGroupIcon = (icon: string) => {
    switch (icon) {
        case 'notifications':
            return <NotificationsIcon />;
        case 'settings':
        default:
            return <SettingsIcon />;
    }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserPreferences Component
 * 
 * This component renders user preferences organized into groups (tabs).
 * It supports multiple preference types:
 * - boolean: Toggle switch
 * - integer: Number input with slider
 * - string: Text input
 * - textarea: Multi-line text input
 * - custom: Custom component (e.g., NotificationPreferences)
 * 
 * Preferences are fetched from /api/system/user/preferences
 * and saved via PUT to the same endpoint.
 */
const UserPreferences: React.FC = () => {
    // ========================================================================
    // STATE
    // ========================================================================
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    // Notification preferences (custom component)
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
    
    // Generic preferences (non-notification)
    const [genericPreferences, setGenericPreferences] = useState<Record<string, any>>({});
    
    // Schema from backend
    const [preferenceFormats, setPreferenceFormats] = useState<PreferenceFormat[]>([]);
    const [groups, setGroups] = useState<Record<string, GroupConfig>>({});
    
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    
    const axios = useAxios();

    // Get notification configs from systemValues (for custom notification component)
    // Memoize to prevent infinite re-renders
    const availableNotifications: NotificationConfig[] = useMemo(() => {
        const systemValues = AuthPersistenceService.getSystemValues();
        return systemValues?.user_notifications || [];
    }, []);
    
    // Use ref to access availableNotifications in callbacks without causing re-renders
    const availableNotificationsRef = useRef(availableNotifications);
    availableNotificationsRef.current = availableNotifications;

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================
    
    // Get sorted groups for tabs
    const sortedGroups = Object.entries(groups)
        .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
        .map(([key, config]) => ({ key, ...config }));

    // Get preferences for a specific group
    const getPreferencesForGroup = (groupKey: string): PreferenceFormat[] => {
        return preferenceFormats.filter(pf => pf.group === groupKey && pf.visible);
    };

    // ========================================================================
    // CALLBACKS
    // ========================================================================

    // Build notification preferences from user data
    const buildNotificationPreferencesFromUser = useCallback((
        userPrefs: any, 
        notifications: NotificationConfig[]
    ): NotificationPreference[] => {
        const notificationPrefs = userPrefs?.notifications || [];
        
        return notifications.map((notif) => {
            const existing = Array.isArray(notificationPrefs) 
                ? notificationPrefs.find((p: any) => p.id === notif.id)
                : null;

            return {
                id: notif.id,
                name: notif.name,
                email: existing?.email !== undefined ? existing.email : notif.hasEmail,
                push: existing?.push !== undefined ? existing.push : notif.hasPush,
            };
        });
    }, []);

    // Fetch preferences from API
    const fetchPreferences = useCallback(async () => {
        try {
            console.log('🔄 UserPreferences - Fetching preferences from API...');
            const response = await axios.get('/system/user/preferences');
            const data: PreferencesResponse = response.data;
            
            console.log('✅ UserPreferences - Fetched:', data);
            
            // Set schema
            setPreferenceFormats(data.preference_formats || []);
            setGroups(data.groups || {});
            
            // Set user preferences
            const userPrefs = data.preferences || {};
            
            // Build notification preferences (custom component)
            // Use ref to get current availableNotifications without dependency
            const builtNotifPrefs = buildNotificationPreferencesFromUser(userPrefs, availableNotificationsRef.current);
            setNotificationPreferences(builtNotifPrefs);
            
            // Build generic preferences
            const genericPrefs: Record<string, any> = {};
            (data.preference_formats || []).forEach(format => {
                if (format.type !== 'custom') {
                    genericPrefs[format.id] = userPrefs[format.id] ?? format.default_value;
                }
            });
            setGenericPreferences(genericPrefs);
            
            setIsDirty(false);
            
        } catch (error) {
            console.error('❌ UserPreferences - Fetch error:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load preferences',
                severity: 'error',
            });
        }
    }, [buildNotificationPreferencesFromUser]);

    // Initialize on mount only
    useEffect(() => {
        const init = async () => {
            await fetchPreferences();
            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    // Handle tab change
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Handle notification toggle
    const handleNotificationToggle = (notificationId: string, type: 'email' | 'push', checked: boolean) => {
        setNotificationPreferences(prev => prev.map(pref => 
            pref.id === notificationId ? { ...pref, [type]: checked } : pref
        ));
        setIsDirty(true);
    };

    // Handle generic preference change
    const handleGenericPreferenceChange = (preferenceId: string, value: any) => {
        setGenericPreferences(prev => ({ ...prev, [preferenceId]: value }));
        setIsDirty(true);
    };

    // Handle save
    const handleSave = async () => {
        setSaving(true);
        try {
            const preferencesToSave: Record<string, any> = {
                notifications: notificationPreferences,
                ...genericPreferences,
            };

            const response = await axios.put('/system/user/preferences', {
                preferences: preferencesToSave,
            });

            console.log('✅ UserPreferences - Saved:', response.data);

            setSnackbar({
                open: true,
                message: 'Preferences saved successfully!',
                severity: 'success',
            });
            setIsDirty(false);

            // Refresh to ensure UI is in sync
            await fetchPreferences();

        } catch (error: any) {
            console.error('❌ UserPreferences - Save error:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to save preferences',
                severity: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    // Get notification config
    const getNotificationConfig = (id: string): NotificationConfig | undefined => {
        return availableNotifications.find(n => n.id === id);
    };

    // Format notification name
    const formatNotificationName = (name: string): string => {
        return name.replace(/Notification$/, '').replace(/([A-Z])/g, ' $1').trim();
    };

    // Render a single generic preference field
    const renderPreferenceField = (format: PreferenceFormat) => {
        const value = genericPreferences[format.id];

        switch (format.type) {
            case 'boolean':
                return (
                    <Card key={format.id} sx={{ mb: 2 }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1">{format.label}</Typography>
                                {format.description && (
                                    <Typography variant="caption" sx={{
                                        color: "text.secondary"
                                    }}>
                                        {format.description}
                                    </Typography>
                                )}
                            </Box>
                            <Switch
                                checked={!!value}
                                onChange={(e) => handleGenericPreferenceChange(format.id, e.target.checked)}
                                disabled={saving || !format.editable}
                            />
                        </CardContent>
                    </Card>
                );

            case 'integer':
                return (
                    <Card key={format.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>{format.label}</Typography>
                            {format.description && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        display: "block",
                                        mb: 2
                                    }}>
                                    {format.description}
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Slider
                                    value={value ?? format.default_value ?? 0}
                                    onChange={(_, newValue) => handleGenericPreferenceChange(format.id, newValue)}
                                    min={format.min ?? 0}
                                    max={format.max ?? 100}
                                    disabled={saving || !format.editable}
                                    sx={{ flexGrow: 1 }}
                                    valueLabelDisplay="auto"
                                />
                                <TextField
                                    type="number"
                                    value={value ?? format.default_value ?? 0}
                                    onChange={(e) => handleGenericPreferenceChange(format.id, parseInt(e.target.value, 10))}
                                    disabled={saving || !format.editable}
                                    sx={{ width: 80 }}
                                    size="small"
                                    slotProps={{
                                        htmlInput: {
                                            min: format.min ?? 0,
                                            max: format.max ?? 100,
                                        }
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                );

            case 'string':
                return (
                    <Card key={format.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>{format.label}</Typography>
                            {format.description && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        display: "block",
                                        mb: 2
                                    }}>
                                    {format.description}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                value={value ?? ''}
                                onChange={(e) => handleGenericPreferenceChange(format.id, e.target.value)}
                                disabled={saving || !format.editable}
                                slotProps={{
                                    input: format.maxLength ? {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {(value?.length || 0)}/{format.maxLength}
                                            </InputAdornment>
                                        ),
                                    } : undefined,

                                    htmlInput: { maxLength: format.maxLength }
                                }} />
                        </CardContent>
                    </Card>
                );

            case 'textarea':
                return (
                    <Card key={format.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>{format.label}</Typography>
                            {format.description && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        display: "block",
                                        mb: 2
                                    }}>
                                    {format.description}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                multiline
                                rows={format.rows ?? 3}
                                value={value ?? ''}
                                onChange={(e) => handleGenericPreferenceChange(format.id, e.target.value)}
                                disabled={saving || !format.editable}
                                helperText={format.maxLength ? `${(value?.length || 0)}/${format.maxLength} characters` : undefined}
                                slotProps={{
                                    htmlInput: { maxLength: format.maxLength }
                                }}
                            />
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    // Render notification preferences (custom component)
    const renderNotificationPreferences = () => {
        if (availableNotifications.length === 0) {
            return (
                <Alert severity="info">
                    No notification types available.
                </Alert>
            );
        }

        return (
            <>
                {notificationPreferences.map((pref) => {
                    const config = getNotificationConfig(pref.id);
                    
                    return (
                        <Card key={pref.id} sx={{ mb: 2 }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1">
                                        {formatNotificationName(pref.name)}
                                    </Typography>
                                    <Typography variant="caption" sx={{
                                        color: "text.secondary"
                                    }}>
                                        {pref.name}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {config?.hasEmail && (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={pref.email}
                                                    onChange={(e) => handleNotificationToggle(pref.id, 'email', e.target.checked)}
                                                    color="primary"
                                                    disabled={saving}
                                                />
                                            }
                                            label="Email"
                                        />
                                    )}
                                    
                                    {config?.hasPush && (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={pref.push}
                                                    onChange={(e) => handleNotificationToggle(pref.id, 'push', e.target.checked)}
                                                    color="primary"
                                                    disabled={saving}
                                                />
                                            }
                                            label="Push"
                                        />
                                    )}

                                    {!config?.hasEmail && !config?.hasPush && (
                                        <Typography variant="caption" sx={{
                                            color: "text.secondary"
                                        }}>
                                            (No configurable channels)
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })}
            </>
        );
    };

    // Render group content
    const renderGroupContent = (groupKey: string) => {
        const groupPreferences = getPreferencesForGroup(groupKey);
        const groupConfig = groups[groupKey];

        return (
            <Box sx={{ pt: 2 }}>
                {groupConfig?.description && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mb: 3
                        }}>
                        {groupConfig.description}
                    </Typography>
                )}

                {groupPreferences.map(format => {
                    if (format.type === 'custom' && format.component === 'NotificationPreferences') {
                        return (
                            <Box key={format.id}>
                                {renderNotificationPreferences()}
                            </Box>
                        );
                    }
                    return renderPreferenceField(format);
                })}

                {groupPreferences.length === 0 && (
                    <Alert severity="info">
                        No preferences available in this group.
                    </Alert>
                )}
            </Box>
        );
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">User Preferences</Typography>
               
            </Box>

            {isDirty && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    You have unsaved changes. Click "Save Preferences" to apply them.
                </Alert>
            )}

            {/* Tabs for groups */}
            {sortedGroups.length > 1 && (
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                    {sortedGroups.map((group, index) => (
                        <Tab 
                            key={group.key}
                            label={group.label}
                            icon={getGroupIcon(group.icon)}
                            iconPosition="start"
                            id={`preference-tab-${index}`}
                            aria-controls={`preference-tabpanel-${index}`}
                        />
                    ))}
                </Tabs>
            )}

            {/* Tab content */}
            {sortedGroups.map((group, index) => (
                <Box
                    key={group.key}
                    role="tabpanel"
                    hidden={activeTab !== index}
                    id={`preference-tabpanel-${index}`}
                    aria-labelledby={`preference-tab-${index}`}
                >
                    {activeTab === index && renderGroupContent(group.key)}
                </Box>
            ))}

            {/* Single group - no tabs */}
            {sortedGroups.length === 1 && renderGroupContent(sortedGroups[0].key)}

            {/* No groups */}
            {sortedGroups.length === 0 && (
                <Alert severity="warning">
                    No preference groups configured.
                </Alert>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

             <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </Button>

        </Box>
    );
};

export default UserPreferences;