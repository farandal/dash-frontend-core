import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useCallback } from "react";
import { useRecordContext, useNotify, useTranslate } from "react-admin";
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PrintIcon from "@mui/icons-material/Print";
import WifiIcon from "@mui/icons-material/Wifi";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

import { Tenant } from "dash-admin/src/interfaces/Tenant";
import { useAxios } from 'dash-axios-hook';
import { playDashDefaultDigitalWatchAlarm } from 'dash-app-common';
import { getDashIPCService, isElectron } from 'dash-utils';

// ============================================================================
// Test Definitions - Add new categories and tests here
// ============================================================================

interface TestDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  type: 'api' | 'local' | 'electron';
  apiEndpoint?: string;
  localAction?: (tenant?: any) => Promise<void>;
  electronOnly?: boolean;
}

interface TestCategory {
  id: string;
  nameKey: string;
  descriptionKey: string;
  tests: TestDefinition[];
}

const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'notifications',
    nameKey: 'tenant.tests.categories.notifications',
    descriptionKey: 'tenant.tests.categories.notifications_desc',
    tests: [
      {
        id: 'fcm_notification',
        nameKey: 'tenant.tests.items.fcm_notification',
        descriptionKey: 'tenant.tests.items.fcm_notification_desc',
        icon: <NotificationsActiveIcon />,
        type: 'api',
        apiEndpoint: '/send-test-notification'
      },
      {
        id: 'audio_notification',
        nameKey: 'tenant.tests.items.audio_notification',
        descriptionKey: 'tenant.tests.items.audio_notification_desc',
        icon: <VolumeUpIcon />,
        type: 'local',
        localAction: async (tenant?: any) => {
          const alarmSettings = tenant?.settings?.alarm_settings;
          await playDashDefaultDigitalWatchAlarm(undefined, {
            alarmDurationSeconds: Math.min(alarmSettings?.alarm_duration_seconds ?? 10, 10),
            alarmFrequencyHigh: alarmSettings?.alarm_frequency_high ?? 4000,
            alarmFrequencyLow: alarmSettings?.alarm_frequency_low ?? 2500,
            beepDurationMs: alarmSettings?.beep_duration_ms ?? 100,
            beepGapMs: alarmSettings?.beep_gap_ms ?? 50,
            beepPatternGapMs: alarmSettings?.beep_pattern_gap_ms ?? 300,
          });
        }
      },
      {
        id: 'tts_notification',
        nameKey: 'tenant.tests.items.tts_notification',
        descriptionKey: 'tenant.tests.items.tts_notification_desc',
        icon: <RecordVoiceOverIcon />,
        type: 'electron',
        electronOnly: true,
        localAction: async () => {
          const ipc = getDashIPCService();
          if (ipc) {
            ipc.speak({
              message: 'This is a test notification from the tenant system. The text-to-speech feature is working correctly.',
              lang: 'es'
            });
          }
        }
      }
    ]
  },
  {
    id: 'printing',
    nameKey: 'tenant.tests.categories.printing',
    descriptionKey: 'tenant.tests.categories.printing_desc',
    tests: [
      {
        id: 'local_print',
        nameKey: 'tenant.tests.items.local_print',
        descriptionKey: 'tenant.tests.items.local_print_desc',
        icon: <PrintIcon />,
        type: 'electron',
        electronOnly: true,
        localAction: async () => {
          // Direct IPC print to local print_service
          const ipc = getDashIPCService();
          if (ipc) {
            await ipc.print('test');
          }
        }
      },
      {
        id: 'network_print',
        nameKey: 'tenant.tests.items.network_print',
        descriptionKey: 'tenant.tests.items.network_print_desc',
        icon: <WifiIcon />,
        type: 'api',
        apiEndpoint: '/send-test-print'
        // Works in all environments - sends WebSocket to kt_service
      }
    ]
  }
  // Add more categories here as needed
];

// ============================================================================
// Component Implementation
// ============================================================================

interface TenantTestsProps extends IDashAutoAdminCustomFieldComponent {}

const TenantTestsEdit: React.FC<TenantTestsProps> = ({ 
  method, 
  attribute, 
  resourceConfig,
  ...props 
}) => {
  const tenant: Tenant = useRecordContext();
  const axios = useAxios();
  const notify = useNotify();
  const translate = useTranslate();
  const [loadingTests, setLoadingTests] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const runTest = useCallback(async (test: TestDefinition, category: TestCategory) => {
    if (!tenant?.id) {
      notify(translate('tenant.tests.messages.no_tenant'), { type: 'error' });
      return;
    }

    // Check Electron requirement
    if (test.electronOnly && !isElectron()) {
      notify(translate('tenant.tests.electron_only'), { type: 'warning' });
      return;
    }

    setLoadingTests(prev => ({ ...prev, [test.id]: true }));
    setTestResults(prev => ({ ...prev, [test.id]: undefined as any }));

    try {
      if (test.type === 'api' && test.apiEndpoint) {
        // API-based test
        const response = await axios.post(`tenant/tenant/${tenant.id}${test.apiEndpoint}`);
        const result = response.data;
        
        setTestResults(prev => ({
          ...prev,
          [test.id]: {
            success: result.success !== false,
            message: result.message || translate('tenant.tests.messages.test_completed')
          }
        }));
        
        notify(result.message || translate('tenant.tests.messages.test_completed'), { 
          type: result.success !== false ? 'success' : 'warning' 
        });
      } else if ((test.type === 'local' || test.type === 'electron') && test.localAction) {
        // Local or Electron-based test - pass tenant for access to settings
        await test.localAction(tenant);
        
        setTestResults(prev => ({
          ...prev,
          [test.id]: {
            success: true,
            message: translate('tenant.tests.messages.test_executed')
          }
        }));
        
        notify(translate('tenant.tests.messages.test_executed'), { type: 'success' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || translate('tenant.tests.error');
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          success: false,
          message: errorMessage
        }
      }));
      
      notify(errorMessage, { type: 'error' });
    } finally {
      setLoadingTests(prev => ({ ...prev, [test.id]: false }));
    }
  }, [tenant, axios, notify, translate]);

  const isRunningInElectron = isElectron();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        margin: 'auto', 
        maxWidth: '100%',
        backgroundColor: 'transparent !important', 
        //backgroundImage: 'none !important',
        boxShadow: 'none !important', 
        border: 'none'
      }}
    >
      <CardHeader 
        title={attribute.label || translate('tenant.tests.title')}
        subheader={translate('tenant.tests.subtitle')}
      />
      <CardContent sx={{ backgroundColor: 'transparent !important', padding: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Chip 
            icon={<DesktopWindowsIcon />}
            label={translate('tenant.tests.electron_only')} 
            color="info" 
            size="small" 
          />
        </Box>
        
        {TEST_CATEGORIES.map((category) => (
          <Accordion
            key={category.id} 
            defaultExpanded
            elevation={0}
            sx={{ 
                backgroundColor: 'transparent !important', 
                //backgroundImage: 'none !important', 
                boxShadow: 'none !important', 
                border: 'none !important',
                '&:before': { display: 'none !important' },
                '&.Mui-expanded': { margin: 0 }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: 'transparent !important',
                padding: 0,
                minHeight: 'auto',
                '& .MuiAccordionSummary-content': { margin: '12px 0' }
              }}
            >
              <Typography variant="h6">{translate(category.nameKey)}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'transparent !important', padding: 0 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {translate(category.descriptionKey)}
              </Typography>
              
              <TableContainer          
                component={Box} 
                sx={{ 
                    backgroundColor: 'transparent !important', 
                    //backgroundImage: 'none !important',
                    boxShadow: 'none !important', 
                    border: 'none !important',
                    overflowX: 'auto !important',
                    display: 'block !important',
                    width: '100% !important'
                }}
              >
                <Table 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'transparent !important',
                    minWidth: 600, // Forces scroll if container is smaller than this
                    tableLayout: 'fixed' 
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell width="40%" sx={{ backgroundColor: 'transparent !important', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Test</TableCell>
                      <TableCell width="40%" sx={{ backgroundColor: 'transparent !important', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Status</TableCell>
                      <TableCell width="20%" align="right" sx={{ backgroundColor: 'transparent !important', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ backgroundColor: 'transparent !important' }}>
                    {category.tests.map((test) => {
                      const isLoading = loadingTests[test.id];
                      const result = testResults[test.id];
                      const isDisabled = test.electronOnly && !isRunningInElectron;
                      
                      return (
                        <TableRow key={test.id} sx={{ '& td, & th': { borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'transparent !important' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {test.icon}
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {translate(test.nameKey)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {translate(test.descriptionKey)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {result ? (
                              <Chip 
                                label={result.message}
                                color={result.success ? 'success' : 'error'}
                                size="small"
                              />
                            ) : isDisabled ? (
                              <Chip 
                                icon={<DesktopWindowsIcon style={{ fontSize: '12px', marginLeft: '4px' }} />}
                                color="info" 
                                size="small" 
                                sx={{ 
                                  minWidth: 24, 
                                  width: 24, 
                                  height: 24, 
                                  '& .MuiChip-label': { display: 'none' },
                                  '& .MuiChip-icon': { margin: 0 }
                                }} 
                              />
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => runTest(test, category)}
                              disabled={isLoading || isDisabled}
                            >
                              {isLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
};

const TenantTestsCreate: React.FC<TenantTestsProps> = ({ 
  method, 
  attribute, 
  resourceConfig,
  ...props 
}) => {
  const translate = useTranslate();
  
  return (
    <Card sx={{ margin: 'auto' }}>
      <CardHeader title={attribute.label || translate('tenant.tests.title')} />
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          Tests are available after the tenant is created.
        </Typography>
      </CardContent>
    </Card>
  );
};

const TenantTestsView: React.FC<TenantTestsProps> = ({ 
  method, 
  attribute, 
  resourceConfig, 
  ...props 
}) => {
  const translate = useTranslate();
  
  return (
    <Card sx={{ maxWidth: 400, margin: 'auto' }}>
      <CardHeader title={attribute.label || translate('tenant.tests.title')} />
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          Tests are available in edit mode.
        </Typography>
      </CardContent>
    </Card>
  );
};

const TenantTestsList: React.FC<TenantTestsProps> = ({ 
  method, 
  attribute, 
  resourceConfig, 
  ...props 
}) => {
  const translate = useTranslate();
  
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Chip label={translate('tenant.tests.title')} size="small" />
    </Box>
  );
};

const TenantTests = ({ 
  method, 
  attribute, 
  resourceConfig, 
  ...props 
}: TenantTestsProps) => {
  switch (method) {
    case "edit":
      return (
        <TenantTestsEdit 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    case "view":
      return (
        <TenantTestsView 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    case "create":
      return (
        <TenantTestsCreate 
          attribute={attribute} 
          method={method} 
          resourceConfig={resourceConfig} 
          {...props} 
        />
      );
    case "list":
      return (
        <TenantTestsList 
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

export default TenantTests;
