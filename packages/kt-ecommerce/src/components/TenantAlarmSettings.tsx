import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useCallback, useEffect } from "react";
import { useRecordContext, useNotify, useTranslate } from "react-admin";
import { useFormContext } from "react-hook-form";
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Typography,
  Slider,
  Button,
  TextField,
  CircularProgress
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RestoreIcon from "@mui/icons-material/Restore";

import { Tenant } from "dash-admin/src/interfaces/Tenant";
import { playDashDefaultDigitalWatchAlarm } from 'dash-app-common';

// Default alarm settings
const DEFAULT_ALARM_SETTINGS = {
  alarm_duration_seconds: 10,
  alarm_frequency_high: 4000,
  alarm_frequency_low: 2500,
  beep_duration_ms: 100,
  beep_gap_ms: 50,
  beep_pattern_gap_ms: 300,
};

interface AlarmSettings {
  alarm_duration_seconds: number;
  alarm_frequency_high: number;
  alarm_frequency_low: number;
  beep_duration_ms: number;
  beep_gap_ms: number;
  beep_pattern_gap_ms: number;
}

interface TenantAlarmSettingsProps extends IDashAutoAdminCustomFieldComponent {}

const TenantAlarmSettingsEdit: React.FC<TenantAlarmSettingsProps> = ({ 
  method, 
  attribute, 
  resourceConfig,
  ...props 
}) => {
  const tenant: Tenant = useRecordContext();
  const notify = useNotify();
  const translate = useTranslate();
  const formContext = useFormContext();
  
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_ALARM_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load settings from tenant on mount
  useEffect(() => {
    if (tenant?.settings?.alarm_settings) {
      setSettings({
        ...DEFAULT_ALARM_SETTINGS,
        ...tenant.settings.alarm_settings
      });
    }
  }, [tenant]);

  // Update form context whenever settings change
  useEffect(() => {
    if (formContext) {
      // Get current form settings and merge alarm_settings
      const currentSettings = formContext.getValues('settings') || {};
      formContext.setValue('settings', {
        ...currentSettings,
        alarm_settings: settings
      }, { shouldDirty: true });
    }
  }, [settings, formContext]);

  const handleSettingChange = useCallback((key: keyof AlarmSettings) => (
    _event: Event,
    value: number | number[]
  ) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setSettings(prev => ({ ...prev, [key]: newValue }));
  }, []);

  const handleInputChange = useCallback((key: keyof AlarmSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  const handleTestAlarm = useCallback(async () => {
    setIsPlaying(true);
    try {
      // Pass current settings to the alarm function
      await playDashDefaultDigitalWatchAlarm(undefined, {
        alarmDurationSeconds: Math.min(settings.alarm_duration_seconds, 10),
        alarmFrequencyHigh: settings.alarm_frequency_high,
        alarmFrequencyLow: settings.alarm_frequency_low,
        beepDurationMs: settings.beep_duration_ms,
        beepGapMs: settings.beep_gap_ms,
        beepPatternGapMs: settings.beep_pattern_gap_ms,
      });
      notify(translate('tenant.alarm_settings.test_completed'), { type: 'success' });
    } catch (error) {
      notify(translate('tenant.alarm_settings.test_error'), { type: 'error' });
    } finally {
      setIsPlaying(false);
    }
  }, [settings, notify, translate]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_ALARM_SETTINGS);
  }, []);

  const sliderSettings: Array<{
    key: keyof AlarmSettings;
    labelKey: string;
    min: number;
    max: number;
    step: number;
    unitKey: string;
    descriptionKey: string;
  }> = [
    {
      key: 'alarm_duration_seconds',
      labelKey: 'tenant.alarm_settings.settings.alarm_duration',
      min: 1,
      max: 10,
      step: 1,
      unitKey: 'tenant.alarm_settings.units.seconds',
      descriptionKey: 'tenant.alarm_settings.settings.alarm_duration_desc'
    },
    {
      key: 'alarm_frequency_high',
      labelKey: 'tenant.alarm_settings.settings.high_frequency',
      min: 2000,
      max: 6000,
      step: 100,
      unitKey: 'tenant.alarm_settings.units.hertz',
      descriptionKey: 'tenant.alarm_settings.settings.high_frequency_desc'
    },
    {
      key: 'alarm_frequency_low',
      labelKey: 'tenant.alarm_settings.settings.low_frequency',
      min: 1000,
      max: 4000,
      step: 100,
      unitKey: 'tenant.alarm_settings.units.hertz',
      descriptionKey: 'tenant.alarm_settings.settings.low_frequency_desc'
    },
    {
      key: 'beep_duration_ms',
      labelKey: 'tenant.alarm_settings.settings.beep_duration',
      min: 50,
      max: 300,
      step: 10,
      unitKey: 'tenant.alarm_settings.units.milliseconds',
      descriptionKey: 'tenant.alarm_settings.settings.beep_duration_desc'
    },
    {
      key: 'beep_gap_ms',
      labelKey: 'tenant.alarm_settings.settings.beep_gap',
      min: 0,
      max: 200,
      step: 10,
      unitKey: 'tenant.alarm_settings.units.milliseconds',
      descriptionKey: 'tenant.alarm_settings.settings.beep_gap_desc'
    },
    {
      key: 'beep_pattern_gap_ms',
      labelKey: 'tenant.alarm_settings.settings.pattern_gap',
      min: 0,
      max: 500,
      step: 50,
      unitKey: 'tenant.alarm_settings.units.milliseconds',
      descriptionKey: 'tenant.alarm_settings.settings.pattern_gap_desc'
    }
  ];

  return (
    <Card 
    
    sx={{ 
        margin: 'auto', 
        maxWidth: '100%',
    
        backgroundColor: 'transparent', // Fully transparent
        boxShadow: 'none',             // Removes default MUI elevation shadow
        border: 'none' // Optional: add a subtle border

    }}
    
    
    >
      <CardHeader 
        title={attribute.label || translate('tenant.alarm_settings.title')}
        subheader={translate('tenant.alarm_settings.subtitle')}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestoreIcon />}
              onClick={handleReset}
            >
              {translate('tenant.alarm_settings.reset')}
            </Button>
            <Button
              variant="contained"
              startIcon={isPlaying ? <CircularProgress size={16} /> : <VolumeUpIcon />}
              onClick={handleTestAlarm}
              disabled={isPlaying}
            >
              {isPlaying ? translate('tenant.alarm_settings.playing') : translate('tenant.alarm_settings.test_alarm')}
            </Button>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {sliderSettings.map((setting) => {
            const unit = translate(setting.unitKey);
            return (
              <Box key={setting.key} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">{translate(setting.labelKey)}</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings[setting.key]}
                    onChange={handleInputChange(setting.key)}
                    sx={{ width: 100 }}
                    InputProps={{
                      endAdornment: <Typography variant="caption">{unit}</Typography>
                    }}
                  />
                </Box>
                <Slider
                  value={settings[setting.key]}
                  onChange={handleSettingChange(setting.key)}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}${unit}`}
                />
                <Typography variant="caption" color="textSecondary">
                  {translate(setting.descriptionKey)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

const TenantAlarmSettingsCreate: React.FC<TenantAlarmSettingsProps> = ({ 
  method, 
  attribute, 
  resourceConfig,
  ...props 
}) => {
  const translate = useTranslate();
  
  return (
    <Card sx={{ margin: 'auto' }}>
      <CardHeader title={attribute.label || translate('tenant.alarm_settings.title')} />
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {translate('tenant.alarm_settings.create_first')}
        </Typography>
      </CardContent>
    </Card>
  );
};

const TenantAlarmSettingsView: React.FC<TenantAlarmSettingsProps> = ({ 
  method, 
  attribute, 
  resourceConfig, 
  ...props 
}) => {
  const tenant: Tenant = useRecordContext();
  const translate = useTranslate();
  const settings = tenant?.settings?.alarm_settings || DEFAULT_ALARM_SETTINGS;

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto' }}>
      <CardHeader title={attribute.label || translate('tenant.alarm_settings.title')} />
      <CardContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {translate('tenant.alarm_settings.settings.alarm_duration')}
            </Typography>
            <Typography>{settings.alarm_duration_seconds}{translate('tenant.alarm_settings.units.seconds')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {translate('tenant.alarm_settings.settings.high_frequency')}
            </Typography>
            <Typography>{settings.alarm_frequency_high} {translate('tenant.alarm_settings.units.hertz')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {translate('tenant.alarm_settings.settings.low_frequency')}
            </Typography>
            <Typography>{settings.alarm_frequency_low} {translate('tenant.alarm_settings.units.hertz')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {translate('tenant.alarm_settings.settings.beep_duration')}
            </Typography>
            <Typography>{settings.beep_duration_ms} {translate('tenant.alarm_settings.units.milliseconds')}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const TenantAlarmSettingsList: React.FC<TenantAlarmSettingsProps> = ({ 
  method, 
  attribute, 
  resourceConfig, 
  ...props 
}) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <VolumeUpIcon fontSize="small" color="action" />
    </Box>
  );
};

const TenantAlarmSettings = ({ 
  method, 
  attribute, 
  resourceConfig, 
  ...props 
}: TenantAlarmSettingsProps) => {
  switch (method) {
    case "edit":
      return (
        <TenantAlarmSettingsEdit 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    case "view":
      return (
        <TenantAlarmSettingsView 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    case "create":
      return (
        <TenantAlarmSettingsCreate 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    case "list":
      return (
        <TenantAlarmSettingsList 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    default:
      return <></>;
  }
};

export default TenantAlarmSettings;
