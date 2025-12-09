import moment from 'moment';
import { useEffect, useState } from 'react';
// import { useAxios } from '../utils/hooks/axios';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Button, Input } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

export const monthNames: Array<string> = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const StatsFilters = ({
    open,
    noMonthDates = false,
    setFiltersOpen,
    _setFilters,
    fields,
    resetFilters
}) => {
    const fieldsArray = fields ? Object.keys(fields).map((objKey) => ({fieldName: objKey, ...fields[objKey]})) : [];
    const [filters, setFilters] = useState({ year: moment().year(), page: 1 });
    const [selectValues, setSelecValues] = useState({});
    console.log(filters, 'filters')

    useEffect(() => {
        setFilters({ year: moment().year(), page: 1, ...(filters['month'] && {month: filters['month']}) });
        setSelecValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetFilters])


    const onInputChange = ({target}) => {
        try {
            if(target.value.length !== 0)
                setFilters({
                    ...filters,
                    [target.name]: target.value || undefined
                });
            else{
                let aux = filters;
                delete(aux[target.name]);
                setFilters((filters) => ({...aux, page: 1}));
            }
        }
        catch (error) {
        }
        finally{
        }
    };

    const getInput = (field) => {
        switch (field.type) {
            case 'input':
                return (
                    <FormControl style={{width: '100%'}} variant="filled">
                        <TextField type="text" name={field.fieldName} label={field.label} variant="outlined" onChange={(e) => onInputChange(e)}/>
                    </FormControl>
                )
            case 'select':
                return (
                    <FormControl style={{width: '100%'}} variant="filled">
                        {/* <InputLabel id="demo-multiple-name-label">{field.label}</InputLabel> */}
                        <Select
                            label={field.label}
                            placeholder='Seleccione'
                            multiple={field.multiple}
                            name={field.fieldName}
                            variant='outlined'
                            value={selectValues[field.fieldName] || []}
                            onChange={({target}) => {
                                let val = target.value;
                                setSelecValues({...selectValues, [field.fieldName]: val});
                                if(val && !Array.isArray(val)){
                                    setFilters({...filters, [field.fieldName]: val});
                                }
                                else{
                                    if(Array.isArray(val) && val?.length > 0)
                                        setFilters({...filters, [field.fieldName]: val});
                                    else{
                                        let aux = filters;
                                        delete(aux[field.fieldName]);
                                        setFilters({...aux, page: 1})
                                    }
                                }

                            }}
                        >
                            {field.values.map((item, key) => {
                                return (
                                    <MenuItem key={key}value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                )
            default:
                break;
        }
    }

    return (
        <Box
        component='form'
        sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        style={{ width: '100%', height: '100%', alignContent: 'center',paddingRight: 25 }}
        title='Filtrar'
        >
                {/* Filtrar */}
                    {!noMonthDates ?
                    <>
                        <DatePicker
                            value={filters['start'] ?
                                moment(filters['start'], 'YYYY-MM-DD'):
                                moment().startOf('month').toDate()
                            }
                            onChange={(e) => onInputChange({target: {name: 'start', value: moment(e).format('YYYY-MM-DD')}})}
                            label="Desde"
                            renderInput={(props) => (
                                <TextField variant="outlined" style={{width: '100%', margin: '8px 0 4px'}} {...props} />
                            )}
                            
                        />
                        <DatePicker
                            value={filters['end'] ?
                                moment(filters['end'], 'YYYY-MM-DD'):
                                moment().startOf('month').toDate()
                            }
                            onChange={(e) => onInputChange({target: {name: 'end', value: moment(e).format('YYYY-MM-DD')}})}
                            label="Hasta"
                            renderInput={(props) => (
                                <TextField variant="outlined" style={{width: '100%', margin: '8px 0 4px'}} {...props} />
                            )}
                        />
                    </> : <div>
                        <FormControl style={{width: '100%'}} >
                            <Select style={{width: '100%'}} className="select" label="Meses" variant='outlined' name='month'  onChange={(e) => {onInputChange(e);}} defaultValue={filters['month'] || (moment().month()+1).toString().padStart(2, '0')}>
                                <MenuItem value={-1}>
                                    Seleccione
                                </MenuItem>
                                {monthNames.map((monthName, key) => <MenuItem key={key} value={(key+1).toString().padStart(2, '0')}>{monthName}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl style={{width: '100%'}} >
                            <TextField className={`input`} name='year' type="number" label="Año" variant='outlined' style={{width: '100%', margin: '8px 0 4px'}} placeholder={moment().year().toString()} defaultValue={filters.year || moment().year()} onChange={(e) => {onInputChange(e);}}/>
                        </FormControl>
                    </div>
                    }
                    {fieldsArray.map((fild) => getInput(fild))}
                    <br/>
                    <br/>
                    <FormControl style={{width: '100%'}} className="form__item">
                        <Button 
                            type='button' className="btn btn--full" size='medium'
                            style={{
                                backgroundColor: '#242943', 
                                color: '#fff', 
                                fontSize: 16, 
                                fontWeight: 'bold',
                                height: 45,
                                textTransform: 'uppercase',
                                borderRadius: 8,
                                margin: '0 0 15px'}} 
                            onClick={() => {_setFilters({...filters, updater: Math.random()}); console.log('Filtros interos: ', filters)}}>
                            Filtrar
                        </Button>
                        <Button 
                            type='reset' className="btn btn--full" size='medium' 
                            style={{
                                backgroundColor: '#242943', 
                                color: '#fff', 
                                fontSize: 16, 
                                fontWeight: 'bold',
                                height: 45,
                                textTransform: 'uppercase',
                                borderRadius: 8,
                                margin: '0 0 15px'}} 
                            onClick={() => {
                                setSelecValues({});
                                setFilters({ year: moment().year(), page: 1, ...(filters['month'] && {month: filters['month']}) });
                                _setFilters({ year: filters.year, ...(filters['month'] && {month: filters['month']}) });
                            }}>Limpiar</Button>
                        <Button 
                            type='button' onClick={() => setFiltersOpen(false)} 
                            style={{
                                backgroundColor: 'transparent', 
                                border: '1px solid #242943', 
                                color: '#242943',
                                fontSize: 16, 
                                fontWeight: 'bold',
                                height: 43,
                                textTransform: 'uppercase',
                                borderRadius: 8,
                                margin: '0 0 15px'}}>
                                Cancelar
                            </Button>
                    </FormControl>
        </Box>
    )
}

export default StatsFilters


