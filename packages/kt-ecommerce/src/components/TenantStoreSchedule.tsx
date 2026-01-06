import React, { useEffect, useState } from 'react';
import { useRecordContext, useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  IconButton,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Alert
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

// Enable custom parsing for time strings
dayjs.extend(customParseFormat);

// Interface for schedule data
interface SchedulePeriod {
  start_time: string;
  end_time: string;
}

interface DaySchedule {
  day_of_week: number;
  enabled: boolean;
  time_periods: SchedulePeriod[];
}

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

const TenantStoreSchedule: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
  attribute,
  method
}) => {
  const record = useRecordContext();
  const translate = useTranslate();
  const { setValue, watch } = useFormContext();

  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const scheduleEnabled = watch('schedule_enabled') ?? record?.schedule_enabled ?? false;

  // Initialize empty schedule structure
  const getEmptySchedule = (): DaySchedule[] => {
    return DAYS_OF_WEEK.map(day => ({
      day_of_week: day,
      enabled: false,
      time_periods: [{ start_time: '09:00', end_time: '18:00' }]
    }));
  };

  const getDayName = (day: number) => {
    return dayjs().day(day).format('dddd'); // Localized day name
  };

  // Helper to flatten schedules for API
  const flattenSchedules = (currentSchedules: DaySchedule[]) => {
      return currentSchedules
        .filter(day => day.enabled)
        .flatMap(day => day.time_periods.map(period => ({
            day_of_week: day.day_of_week,
            open_time: period.start_time,
            close_time: period.end_time,
            is_active: true
        })));
  };

  // Initialize from record
  useEffect(() => {
    if (record?.schedules) {
        // Merge fetched schedules with empty structure
        const mergedSchedules = getEmptySchedule().map(emptyDay => {
            const fetchedDaySchedules = record.schedules.filter((s: any) => s.day_of_week === emptyDay.day_of_week && s.is_active);
            
            if (fetchedDaySchedules.length > 0) {
                return {
                    day_of_week: emptyDay.day_of_week,
                    enabled: true,
                    time_periods: fetchedDaySchedules.map((s: any) => ({
                        // Handle HH:mm:ss vs HH:mm
                        start_time: s.open_time.substring(0, 5),
                        end_time: s.close_time.substring(0, 5)
                    }))
                };
            }
            return emptyDay;
        });
        
        setSchedules(mergedSchedules);
        
        // Sync initial state to form
        if (record.schedule_enabled !== undefined) {
             setValue('schedule_enabled', record.schedule_enabled);
        }
        setValue('schedules', flattenSchedules(mergedSchedules));
    } else {
        // Init empty
        setSchedules(getEmptySchedule());
    }
  }, [record]); // Run once on record load

  // Sync back to form whenever local schedules change
  useEffect(() => {
      if (schedules.length > 0) {
          setValue('schedules', flattenSchedules(schedules), { shouldDirty: true });
      }
  }, [schedules, setValue]);

  const toggleDay = (dayIndex: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].enabled = !newSchedules[dayIndex].enabled;
    setSchedules(newSchedules);
  };

  const updateTime = (dayIndex: number, periodIndex: number, field: keyof SchedulePeriod, value: Dayjs | null) => {
    if (!value) return;
    const newSchedules = [...schedules];
    newSchedules[dayIndex].time_periods[periodIndex][field] = value.format('HH:mm');
    setSchedules(newSchedules);
  };

  const addPeriod = (dayIndex: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].time_periods.push({ start_time: '09:00', end_time: '18:00' });
    setSchedules(newSchedules);
  };

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    const newSchedules = [...schedules];
    if (newSchedules[dayIndex].time_periods.length > 1) {
      newSchedules[dayIndex].time_periods.splice(periodIndex, 1);
      setSchedules(newSchedules);
    }
  };

  // Helper for TimePicker value
  const parseTime = (timeStr: string): Dayjs | null => {
      if (!timeStr) return null;
      // Normalize to HH:mm format (strip seconds if present)
      const normalized = timeStr.substring(0, 5);
      return dayjs(normalized, 'HH:mm');
  };

  // If view mode
  if (method === 'view' || method === 'list') {
       const isEnabled = record?.schedule_enabled;
       const viewSchedules = schedules.length > 0 ? schedules : getEmptySchedule(); // Should init from record in useEffect but redundant safety

      return (
          <Card
          
          sx={{ 
                backgroundColor: 'transparent', // Fully transparent
                boxShadow: 'none',             // Removes default MUI elevation shadow
                border: 'none' // Optional: add a subtle border
        }}


          >
              <CardContent>
                  <Typography variant="h6" gutterBottom>{translate('tenant.store_schedule.title')}</Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                  
                      {isEnabled ? translate('tenant.store_schedule.enabled') : translate('tenant.store_schedule.disabled')}
                  </Typography>
                  
                  {isEnabled && (
                      <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                              <TableBody>
                                  {viewSchedules.filter(d => d.enabled).map((day) => (
                                      <TableRow key={day.day_of_week}>
                                          <TableCell width="30%">{getDayName(day.day_of_week)}</TableCell>
                                          <TableCell>
                                              {day.time_periods.map((p, i) => (
                                                  <Box key={i}>{p.start_time} - {p.end_time}</Box>
                                              ))}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                  )}
              </CardContent>
          </Card>
      );
  }

  return (
    <Card sx={{ maxWidth: '100%', margin: 'auto',


                backgroundColor: 'transparent', // Fully transparent
                boxShadow: 'none',             // Removes default MUI elevation shadow
                border: 'none' // Optional: add a subtle border
       


    }}>
      <CardHeader
        title={translate('tenant.store_schedule.title')}
        subheader={translate('tenant.store_schedule.subtitle')}
      />
      <CardContent>
        <Box mb={3}>
            <FormControlLabel
                control={
                    <Switch
                        checked={scheduleEnabled}
                        onChange={(e) => {
                            setValue('schedule_enabled', e.target.checked, { shouldDirty: true });
                        }}
                        color="primary"
                    />
                }
                label={translate('tenant.store_schedule.enable_schedule')}
            />
         
            {!scheduleEnabled && (
                <Alert severity="info" sx={{ mt: 1 }}>
                    {translate('tenant.store_schedule.disabled_warning')}
                </Alert>
            )}
        </Box>

        {scheduleEnabled && (
            <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                <TableRow>
                    <TableCell width="15%">{translate('tenant.store_schedule.day')}</TableCell>
                    <TableCell width="5%">{translate('tenant.store_schedule.active')}</TableCell>
                    <TableCell width="75%">{translate('tenant.store_schedule.hours')}</TableCell>
                    <TableCell width="5%">{translate('tenant.store_schedule.add')}</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {schedules.map((day, dayIndex) => (
                    <TableRow key={day.day_of_week} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                        {getDayName(day.day_of_week)}
                    </TableCell>
                    <TableCell>
                        <Checkbox
                            checked={day.enabled}
                            onChange={() => toggleDay(dayIndex)}
                            color="primary"
                            size="small"
                        />
                    </TableCell>
                    <TableCell>
                        {day.enabled && (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {day.time_periods.map((period, periodIndex) => (
                                    <Box key={periodIndex} display="flex" alignItems="center" gap={2} width="100%">
                   
                                        <TimePicker
                                            
                                            label={translate('tenant.store_schedule.open')}
                                            value={parseTime(period.start_time)}
                                            onChange={(newValue) => updateTime(dayIndex, periodIndex, 'start_time', newValue)}
                                            format="HH:mm"
                                            slotProps={{  textField: { fullWidth: true } }}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock, // keeping standard view
                                            }}
                                            sx={{ flex: 1 }}
                                        />
                                       
                                        <TimePicker
                                        
                                            label={translate('tenant.store_schedule.close')}
                                            value={parseTime(period.end_time)}
                                            onChange={(newValue) => updateTime(dayIndex, periodIndex, 'end_time', newValue)}
                                            format="HH:mm"
                                            slotProps={{ textField: { fullWidth: true } }}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                            }}
                                            sx={{ flex: 1 }}
                                        />
                                        
                                        <IconButton 
                                            size="medium" 
                                            color="error"
                                            onClick={() => removePeriod(dayIndex, periodIndex)}
                                            disabled={day.time_periods.length <= 1}
                                        >
                                            <DeleteIcon fontSize="inherit" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </TableCell>
                    <TableCell>
                        <IconButton 
                            size="medium" 
                            color="primary"
                            onClick={() => addPeriod(dayIndex)}
                            disabled={!day.enabled}
                        >
                            <AddIcon fontSize="inherit" />
                        </IconButton>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantStoreSchedule;
