import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, Email as EmailIcon, Notifications as PushIcon } from '@mui/icons-material';
import { useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { AuthPersistenceService } from 'dash-auth';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

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

// Helper functions - moved outside component
const getNestedValue = (obj: any, path: string): any => {
    if (!path || !obj) return [];
    const keys = path.split('.');
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : []), obj);
};

const setNestedValue = (obj: any, path: string, value: any): any => {
    if (!path) return value;
    const keys = path.split('.');
    const lastKey = keys.pop();
    const result = { ...obj };
    let current = result;
    
    for (const key of keys) {
        if (!current[key]) current[key] = {};
        current = current[key];
    }
    
    if (lastKey) {
        current[lastKey] = value;
    }
    return result;
};

/**
 * NotificationPreferencesEdit - Edit mode component
 * All hooks are called unconditionally at the top level
 */
export const NotificationPreferencesEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { attribute } = props;
    
    // ALL HOOKS CALLED UNCONDITIONALLY AT TOP LEVEL
    const record = useRecordContext();
    const formContext = useFormContext();
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [localPreferences, setLocalPreferences] = React.useState<NotificationPreference[] | null>(null);

    // Get form methods safely
    const setValue = formContext?.setValue;
    const getValues = formContext?.getValues;

    // Calculate attribute paths
    const attributePath = attribute?.attribute || '';
    const isNestedSetting = attributePath.startsWith('preferences.');
    const preferencesPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;

    // Get available notifications from systemValues (memoized)
    const availableNotifications = useMemo<NotificationConfig[]>(() => {
        const systemValues = AuthPersistenceService.getSystemValues();
        console.log('🔔 NotificationPreferencesEdit - systemValues:', systemValues);
        const notifications = systemValues?.user_notifications || [];
        console.log('🔔 NotificationPreferencesEdit - user_notifications:', notifications);
        return notifications;
    }, []);

    // Get current preferences from record/form (memoized)
    const initialPreferences = useMemo<NotificationPreference[]>(() => {
        let currentPrefs: NotificationPreference[] = [];
        
        if (record) {
            const recordValue = isNestedSetting
                ? getNestedValue(record, preferencesPath)
                : record[attributePath];
            currentPrefs = Array.isArray(recordValue) ? recordValue : [];
            console.log('🔔 NotificationPreferencesEdit - preferences from record:', currentPrefs);
        } else if (getValues) {
            const formValues = getValues();
            const formValue = isNestedSetting
                ? getNestedValue(formValues, preferencesPath)
                : formValues[attributePath];
            currentPrefs = Array.isArray(formValue) ? formValue : [];
            console.log('🔔 NotificationPreferencesEdit - preferences from form:', currentPrefs);
        }

        // Map available notifications to preferences with defaults
        return availableNotifications.map(notification => {
            const existing = currentPrefs.find(p => p.id === notification.className);
            return existing || {
                id: notification.className,
                name: notification.name,
                email: notification.hasEmail,
                push: notification.hasPush,
            };
        });
    }, [availableNotifications, record, attributePath, isNestedSetting, preferencesPath, getValues]);

    // Use local state if modified, otherwise use initial
    const preferences = localPreferences ?? initialPreferences;

    // Filter preferences based on search term
    const filteredPreferences = useMemo(() => {
        if (!searchTerm.trim()) return preferences;
        return preferences.filter(pref =>
            pref.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [preferences, searchTerm]);

    // Update form value when preferences change
    const updateFormValue = (newPreferences: NotificationPreference[]) => {
        if (!setValue) return;
        
        if (isNestedSetting) {
            const formValues = getValues?.() || {};
            const updatedValues = setNestedValue({ ...formValues }, preferencesPath, newPreferences);
            setValue(attributePath, getNestedValue(updatedValues, preferencesPath), { shouldDirty: true });
        } else {
            setValue(attributePath, newPreferences, { shouldDirty: true });
        }
    };

    // Handle toggle
    const handleToggle = (notificationId: string, channel: 'email' | 'push') => {
        const updatedPreferences = preferences.map(pref =>
            pref.id === notificationId
                ? { ...pref, [channel]: !pref[channel] }
                : pref
        );
        setLocalPreferences(updatedPreferences);
        updateFormValue(updatedPreferences);
    };

    // Early return if no form context
    if (!formContext) {
        return (
            <Alert severity="warning">
                Form context not available. This component must be used within a form.
            </Alert>
        );
    }

    // Early return if no notifications
    if (availableNotifications.length === 0) {
        return (
            <Alert severity="info">No notifications available to configure.
                                <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                        mt: 1
                    }}>
                    Debug: No user_notifications found in systemValues.
                    Try logging out and logging back in to refresh auth data.
                </Typography>
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                Notification Preferences
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    mb: 2
                }}>
                Configure which notifications you want to receive via email and push notifications
            </Typography>

            {/* Search Box */}
            {preferences.length > 5 && (
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchTerm('')} edge="end" size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            )}

            {/* No results message */}
            {searchTerm && filteredPreferences.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No notifications found matching "{searchTerm}"
                </Alert>
            )}

            {/* Notification list */}
            {filteredPreferences.map((preference) => {
                const notification = availableNotifications.find(n => n.className === preference.id);
                if (!notification) return null;

                return (
                    <Card
                        key={preference.id}
                        variant="outlined"
                        sx={{
                            mb: 1,
                            '&:hover': {
                                boxShadow: 2,
                            },
                        }}
                    >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: "bold"
                                    }}>
                                        {preference.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        {notification.hasSocket && (
                                            <Chip label="Real-time" size="small" color="info" />
                                        )}
                                        {notification.hasDatabase && (
                                            <Chip label="Stored" size="small" color="default" />
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    {notification.hasEmail && (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preference.email}
                                                    onChange={() => handleToggle(preference.id, 'email')}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EmailIcon fontSize="small" />
                                                    <Typography variant="body2">Email</Typography>
                                                </Box>
                                            }
                                        />
                                    )}
                                    {notification.hasPush && (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preference.push}
                                                    onChange={() => handleToggle(preference.id, 'push')}
                                                    color="secondary"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PushIcon fontSize="small" />
                                                    <Typography variant="body2">Push</Typography>
                                                </Box>
                                            }
                                        />
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
};

/**
 * NotificationPreferencesView - View mode component
 * All hooks are called unconditionally at the top level
 */
export const NotificationPreferencesView: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { attribute } = props;
    
    // ALL HOOKS CALLED UNCONDITIONALLY AT TOP LEVEL
    const record = useRecordContext();
    const [searchTerm, setSearchTerm] = React.useState<string>('');

    // Calculate attribute paths
    const attributePath = attribute?.attribute || '';
    const isNestedSetting = attributePath.startsWith('preferences.');
    const preferencesPath = isNestedSetting ? attributePath.split('.').slice(1).join('.') : attributePath;

    // Get available notifications from systemValues (memoized)
    const availableNotifications = useMemo<NotificationConfig[]>(() => {
        const systemValues = AuthPersistenceService.getSystemValues();
        return systemValues?.user_notifications || [];
    }, []);

    // Get current preferences from record (memoized)
    const preferences = useMemo<NotificationPreference[]>(() => {
        if (!record) return [];
        const recordValue = isNestedSetting
            ? getNestedValue(record, preferencesPath)
            : record[attributePath];
        return Array.isArray(recordValue) ? recordValue : [];
    }, [record, attributePath, isNestedSetting, preferencesPath]);

    // Filter preferences based on search term
    const filteredPreferences = useMemo(() => {
        if (!searchTerm.trim()) return preferences;
        return preferences.filter(pref =>
            pref.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [preferences, searchTerm]);

    // Early return if no notifications
    if (availableNotifications.length === 0) {
        return (
            <Alert severity="info">
                No notification preferences configured.
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                Notification Preferences
            </Typography>

            {/* Search Box */}
            {preferences.length > 5 && (
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchTerm('')} edge="end" size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            )}

            {/* Notification list */}
            {filteredPreferences.map((preference) => {
                const notification = availableNotifications.find(n => n.className === preference.id);
                if (!notification) return null;

                return (
                    <Card key={preference.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: "bold"
                                    }}>
                                        {preference.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        {notification.hasSocket && (
                                            <Chip label="Real-time" size="small" color="info" />
                                        )}
                                        {notification.hasDatabase && (
                                            <Chip label="Stored" size="small" color="default" />
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {notification.hasEmail && (
                                        <Chip
                                            icon={<EmailIcon />}
                                            label="Email"
                                            color={preference.email ? 'primary' : 'default'}
                                            variant={preference.email ? 'filled' : 'outlined'}
                                        />
                                    )}
                                    {notification.hasPush && (
                                        <Chip
                                            icon={<PushIcon />}
                                            label="Push"
                                            color={preference.push ? 'secondary' : 'default'}
                                            variant={preference.push ? 'filled' : 'outlined'}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}

            {preferences.length === 0 && (
                <Alert severity="info">
                    No notification preferences configured
                </Alert>
            )}
        </Box>
    );
};

/**
 * NotificationPreferences - Main component
 * NO CONDITIONAL HOOKS - All hooks called at top level
 * Renders appropriate view based on method prop
 */
const NotificationPreferences: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {



    const { method="edit", attribute=null, resourceConfig=null } = props;
    
    console.log('🔔 NotificationPreferences - method:', method);
    console.log('🔔 NotificationPreferences - attribute:', attribute);

    // Determine which component to render based on method
    // No hooks, no conditional logic, just a simple switch
    switch (method) {
        case 'edit':
        case 'create':
            return <><NotificationPreferencesEdit method={method} attribute={attribute} resourceConfig={resourceConfig} /></>;
        case 'view':
            return <><NotificationPreferencesView method={method} attribute={attribute} resourceConfig={resourceConfig} /></>;
        default:
            console.log('🔔 NotificationPreferences - unsupported method:', method);
            return null;
    }
};

export default NotificationPreferences;
