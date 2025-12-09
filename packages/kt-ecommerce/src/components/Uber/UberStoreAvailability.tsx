import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRecordContext } from 'react-admin';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

dayjs.extend(customParseFormat);

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimePeriod {
  start_time: string;
  end_time: string;
}

interface DayAvailability {
  day_of_week: DayOfWeek;
  time_periods: TimePeriod[];
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const DAY_DISPLAY_NAMES = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const DEFAULT_AVAILABILITY: DayAvailability[] = DAYS_OF_WEEK.map(day => ({
  day_of_week: day,
  time_periods: [
    {
      start_time: '00:00',
      end_time: '23:59'
    }
  ]
}));

const UberStoreAvailabilityEditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  attribute,
  method
}) => {
  const record = useRecordContext();
  const { setValue, getValues } = useFormContext();
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [enabledDays, setEnabledDays] = useState<Record<DayOfWeek, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });

  useEffect(() => {
    let initialAvailability = DEFAULT_AVAILABILITY;

    if (method === 'edit' && record?.connection_params?.service_availability) {
      const recordAvailability = record.connection_params.service_availability;
      const enabledState = { ...enabledDays };
      
        /*

        Array format: [{day_of_week: 'monday', time_periods: [...]}]
        Object format: {monday: {enabled: true, time_periods: [...]}, ...}

        */

      // Handle both array format and object format
      if (Array.isArray(recordAvailability)) {
        // Format is array of objects with day_of_week and time_periods
        const availabilityArray = DAYS_OF_WEEK.map(day => {
          const dayData = recordAvailability.find((d: any) => d.day_of_week === day);
          enabledState[day] = !!dayData;
          return {
            day_of_week: day,
            time_periods: dayData?.time_periods || [{
              start_time: '00:00',
              end_time: '23:59'
            }]
          };
        });
        initialAvailability = availabilityArray;
      } else if (typeof recordAvailability === 'object') {
        // Format is object with day keys
        const availabilityArray = DAYS_OF_WEEK.map(day => {
          const dayData = recordAvailability[day];
          enabledState[day] = dayData?.enabled || false;
          return {
            day_of_week: day,
            time_periods: dayData?.time_periods || [{
              start_time: '00:00',
              end_time: '23:59'
            }]
          };
        });
        initialAvailability = availabilityArray;
      }
      
      setEnabledDays(enabledState);
    }

    setAvailability(initialAvailability);
  }, [record, method]);

  useEffect(() => {
    if (availability.length > 0) {
      // Convert to the format expected by the backend
      const formValue = availability
        .filter(day => enabledDays[day.day_of_week])
        .map(day => ({
          day_of_week: day.day_of_week,
          time_periods: day.time_periods
        }));
      
      setValue(attribute.attribute, formValue, { shouldDirty: true });
    }
  }, [availability, enabledDays, setValue, attribute.attribute]);

  const handleDayToggle = (day: DayOfWeek) => {
    const newEnabledDays = { ...enabledDays, [day]: !enabledDays[day] };
    
    if (Object.values(newEnabledDays).some(value => value)) {
      setEnabledDays(newEnabledDays);
    }
  };

  const handleTimeChange = (
    day: DayOfWeek,
    periodIndex: number,
    field: 'start_time' | 'end_time',
    time: dayjs.Dayjs
  ) => {
    const newAvailability = [...availability];
    const dayIndex = newAvailability.findIndex(item => item.day_of_week === day);
    
    if (dayIndex !== -1 && time) {
      newAvailability[dayIndex].time_periods[periodIndex][field] = time.format('HH:mm');
      setAvailability(newAvailability);
    }
  };

  const addTimePeriod = (day: DayOfWeek) => {
    const newAvailability = [...availability];
    const dayIndex = newAvailability.findIndex(item => item.day_of_week === day);
    
    if (dayIndex !== -1) {
      newAvailability[dayIndex].time_periods.push({
        start_time: '00:00',
        end_time: '23:59'
      });
      setAvailability(newAvailability);
    }
  };

  const removeTimePeriod = (day: DayOfWeek, periodIndex: number) => {
    const newAvailability = [...availability];
    const dayIndex = newAvailability.findIndex(item => item.day_of_week === day);
    
    if (dayIndex !== -1 && newAvailability[dayIndex].time_periods.length > 1) {
      newAvailability[dayIndex].time_periods.splice(periodIndex, 1);
      setAvailability(newAvailability);
    }
  };

  const set24Hours = (day: DayOfWeek, periodIndex: number) => {
    const newAvailability = [...availability];
    const dayIndex = newAvailability.findIndex(item => item.day_of_week === day);
    
    if (dayIndex !== -1) {
      newAvailability[dayIndex].time_periods[periodIndex] = {
        start_time: '00:00',
        end_time: '23:59'
      };
      setAvailability(newAvailability);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width="15%">Día</TableCell>
            <TableCell width="15%">Disponible</TableCell>
            <TableCell width="55%">Horarios</TableCell>
            <TableCell width="15%">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {DAYS_OF_WEEK.map(day => {
            const dayData = availability.find(item => item.day_of_week === day);
            if (!dayData) return null;
            
            return (
              <TableRow key={day}>
                <TableCell>
                  <Typography variant="body2">{DAY_DISPLAY_NAMES[day]}</Typography>
                </TableCell>
                <TableCell >
                  <Checkbox
                    size="small"
                    checked={enabledDays[day]}
                    onChange={() => handleDayToggle(day)}
                  />
                </TableCell>
                <TableCell >
                  {enabledDays[day] && (
                    <div style={{  paddingTop:15 }}>
                      {dayData.time_periods.map((period, periodIndex) => (
                        <Box 
                          key={periodIndex} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1 
                          }}
                        >
                          <TimePicker
                            label="Hora inicio"
                            value={dayjs(period.start_time, 'HH:mm')}
                            onChange={(time) => 
                              time && handleTimeChange(day, periodIndex, 'start_time', time)
                            }
                            format="HH:mm"
                            viewRenderers={{
                              hours: renderTimeViewClock,
                              minutes: renderTimeViewClock,
                            }}
                            sx={{ mr: 2 }}
                            slotProps={{ textField: { size: 'small' } }}
                          />
                          <TimePicker
                            label="Hora fin"
                            value={dayjs(period.end_time, 'HH:mm')}
                            onChange={(time) => 
                              time && handleTimeChange(day, periodIndex, 'end_time', time)
                            }
                            format="HH:mm"
                            viewRenderers={{
                              hours: renderTimeViewClock,
                              minutes: renderTimeViewClock,
                            }}
                            sx={{ mr: 2 }}
                            slotProps={{ textField: { size: 'small' } }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => set24Hours(day, periodIndex)}
                            sx={{ mr: 2 }}
                          >
                            24H
                          </Button>
                          <IconButton 
                            size="small"
                            color="error" 
                            onClick={() => removeTimePeriod(day, periodIndex)}
                            disabled={dayData.time_periods.length <= 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {enabledDays[day] && (
                    <IconButton
                      size="small"
                      onClick={() => addTimePeriod(day)}
                      color="primary"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const UberStoreAvailabilityViewComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  attribute
}) => {
  const record = useRecordContext();
  const serviceAvailability = record?.connection_params?.service_availability || [];
  
  // Convert service availability to a consistent format
  const availability = DAYS_OF_WEEK.map(day => {
    let dayData;
    
    // Handle both array format and object format
    if (Array.isArray(serviceAvailability)) {
      dayData = serviceAvailability.find((d: any) => d.day_of_week === day);
    } else if (typeof serviceAvailability === 'object') {
      dayData = serviceAvailability[day];
    }
    
    return {
      day_of_week: day,
      enabled: Array.isArray(serviceAvailability) 
        ? !!dayData 
        : !!(dayData && dayData.enabled),
      time_periods: (Array.isArray(serviceAvailability) 
        ? dayData?.time_periods 
        : dayData?.time_periods) || [{
        start_time: '00:00',
        end_time: '23:59'
      }]
    };
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width="30%">Día</TableCell>
            <TableCell width="70%">Horarios</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {DAYS_OF_WEEK.map(day => {
            const dayData = availability.find(item => item.day_of_week === day);
            if (!dayData) return null;

            return (
              <TableRow key={day}>
                <TableCell>
                  <Typography variant="body2">{DAY_DISPLAY_NAMES[day]}</Typography>
                </TableCell>
                <TableCell>
                  {dayData.enabled ? (
                    dayData.time_periods.map((period, index) => (
                      <Typography key={index} variant="body2">
                        {period.start_time} - {period.end_time}
                        {index < dayData.time_periods.length - 1 && ', '}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No disponible
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const UberStoreAvailability = ({
  method,
  attribute,
  resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case 'edit':
    case 'create':
      return <UberStoreAvailabilityEditComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case 'view':
    case 'list':
      return <UberStoreAvailabilityViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    default:
      return null;
  }
};

export default UberStoreAvailability;