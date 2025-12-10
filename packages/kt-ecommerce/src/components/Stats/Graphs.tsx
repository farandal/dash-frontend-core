import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  registerables,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Box, Button, Card, Drawer, Grid, Typography } from '@mui/material';

import moment from 'moment';
//import { Button } from 'react-admin';
import { useNavigate, useParams } from 'react-router';
import StatsFilters from './StatsFilters';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { capitalize, filter } from 'lodash';
import MaterialUIDrawer from './MUIDrawer';
import ContentFilter from '@mui/icons-material/FilterList';

import { Download, KeyboardBackspace, Visibility } from '@mui/icons-material';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useAxios } from 'dash-axios-hook';
import React from 'react';


ChartJS.register(ChartDataLabels);

const pivots: { name: String, param: String, title: String }[] = [
  {
    name: 'orders-status',
    param: '?pivot[]=status',
    title: 'Estatus'
  },
  {
    name: 'orders-brokerstatus',
    param: '?pivot[]=broker_status',
    title: 'Estatus de broker'
  },
  {
    name: 'orders-brandid',
    param: '?pivot[]=brand_id',
    title: 'Marcas'
  },
  {
    name: 'orders-marketplaceid',
    param: '?pivot[]=marketplace_id',
    title: 'Marketplace'
  }
];

interface IGrpahs {
  resourceConfig: IDashAutoAdminResourceConfig
}

export const monthNames: Array<string> = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const Graphs: React.FC<IGrpahs> = ({ resourceConfig }) => {

  const axios = useAxios();
  const { id } = useParams();
  const navigate = useNavigate();
  const [graphData, setGraphdata] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [statError, setStatError] = useState(false);
  const [filters, setFilters] = useState(undefined);
  const [resetFilters, setResetFilters] = useState(0);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (id) {
      getData({ page: 1, ...filters });
    }
  }, [id]);

  useEffect(() => {
    getData({ page: 1, ...filters });
  }, []);

  useEffect(() => {
    if (filters)
      if (id)
        getFilteredSelectedStat();
      else
        getData(filters, true);
  }, [filters])

  const getFilteredSelectedStat = async () => {
    setStatError(false);
    setLoading(true);
    try {
      const options = {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: selectedStat.name,
          },
        }
      };
      const graph = await getStatData(selectedStat, options, filters);
      setSelectedStat(graph)
    } catch (error) {
      setStatError(true);
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }

  const getStatData = async (statData, options?, params?) => {
    let filters = params;
    try {
      let chartData;
      let dateFilter = {};
      if (filters && filters?.month && (!filters?.start && !filters?.end)) {
        dateFilter = {
          start: `${filters?.year ? filters?.year : moment().year()}-${filters?.month}-01`,
          end: `${moment(`${filters?.year || moment().year()}-${filters?.month}-01`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD')}`
        };
      }
      else
        if (filters && (filters?.start || filters?.end)) {
          dateFilter = {
            ...(filters?.start ?
              { start: filters?.start } :
              { start: filters['month'] ? `${filters?.year ? filters?.year : moment().year()}-${filters?.month}-01` : moment().startOf('month').format('YYYY-MM-DD') }),
            ...(filters?.end ?
              { end: filters?.end } :
              filters['month'] ?
                { end: moment(`${filters?.year ? filters?.year : moment().year()}-${filters?.month}-01`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD') } :
                { end: moment().endOf('month').format('YYYY-MM-DD') }),
          }
        }
        else {
          dateFilter = {
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD')
          }
        }


      params && console.log('filters', Object.keys(params))

      let transformedFilters = {}
      const notTransform = ['pivot', 'year', 'end', 'start', 'dater'];
      if (params)
        Object.keys(params)?.forEach((item: any) => {
          if (!notTransform.includes(item)) {
            transformedFilters = ({
              ...transformedFilters,
              [item]: Array.isArray(params[item]) ? params[item] : [params[item]]
            })
          }
          else
            transformedFilters = { ...transformedFilters, [item]: params[item] }
        })
      console.log('transformedFilters', transformedFilters)
      const { data: monthlyData } = await axios.get(`${statData.endpoint}/monthly${statData.customParam ?? ''}`, { params: { ...dateFilter, ...transformedFilters } });
      let graphPromises = [];

      statData.graph.forEach(element => {
        graphPromises.push(axios.get(`${statData.endpoint}${statData.customParam ?? ''}`, { params: { ...transformedFilters, ...dateFilter, type: element } }));
      });

      let graphData;

      await Promise.allSettled(graphPromises).then((promiseData) => {
        promiseData.forEach((statData: any) => {
          if (statData.status === 'fulfilled') {
            if (statData.value.data.config.graph.type.includes('Bar')) {
              graphData = {
                ...graphData,
                bar: {
                  labels: statData.value.data.config.graph.labels,
                  datasets: statData.value.data.config.graph.datasets
                }
              }
            }
            if (statData.value.data.config.graph.type.includes('Pie')) {
              options.plugins = {
                datalabels: {
                  display: true,
                  //align: 'bottom',
                  backgroundColor: '#0080c5',
                  color: '#ffffff',
                  borderRadius: 3,
                  font: {
                    size: 14,
                  },
                  formatter: (value, ctx) => {
                    let datasets = ctx.chart.data.datasets;
                    if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                      let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                      let percentage = Math.round((value / sum) * 100);
                      if (percentage > 0 && percentage !== Infinity) {
                        return percentage + "%";
                      } else {
                        return null;
                      }
                    } else {
                      return null;
                    }
                  }
                },

              }
              graphData = {
                ...graphData,
                pie: {
                  labels: statData.value.data.config.graph.labels,
                  datasets: statData.value.data.config.graph.datasets
                }
              }
            }
            chartData = statData.value.data;
          }
        })
      });

      let graphs = {
        ...statData,
        barGraph: () => { },
        pieGraph: () => { },
        monthlyData,
        chartData,
        total: 0
      };

      statData.graph.forEach(element => {
        switch (element) {
          case 'Bar':
            graphs.barGraph = (w?, h?) => (
              <Card>
                <Bar width={w || 600} height={h || 480} options={options} data={graphData.bar} />
              </Card>
            )
            break;
          case 'Pie':
            graphs.pieGraph = (w?, h?) => (
              <Card>
                <Pie width={w || 600} height={h || 480} options={options} data={graphData.pie} />
              </Card>
            )
            break;
          default:
            break;
        }
      });

      let total = monthlyData.results.records.reduce((prevVal, currValue) => prevVal + currValue.results, 0)
      graphs.total = total;
      return graphs;
    }
    catch (error) {
      console.log(error);
      throw new Error('Ocurrio un error');
    }
    finally {
      setLoading(false)
    }
  }

  const getData = async (params, monthly = false) => {
    try {
      const { data: { config } } = await axios.get('ecommerce/stats', { params: { ...params } });
      let dataWithGraph = [];
      let graphPromises = [];
      config.forEach(element => {
        let options = {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: element.title,
            }
          }
        };
        if (element.name === 'orders') {
          pivots.forEach((item) => graphPromises.push(getStatData(
            {
              ...element,
              customParam: item.param,
              name: item.name,
              title: item.title
            },
            {
              responsive: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: item.title,
                }
              }
            },
            monthly && params)
          ))
        }
        else
          graphPromises.push(getStatData(element, options, monthly && params))
      });
      await Promise.allSettled(graphPromises).then((promiseData) => {
        promiseData.forEach(statData => {
          if (statData.status === 'fulfilled')
            dataWithGraph.push(statData.value);
        });
      });

      if (id) {
        const filteredStat = dataWithGraph.filter((item) => item.name === id)[0];
        console.log(filteredStat)
        setSelectedStat(filteredStat)
      }
      setStatsData([...dataWithGraph]);
    }
    catch (data) {
      //console.log(data)
    }
    finally {
      setLoading(false)
    }
  }

  const getXlsx = async () => {
    try {
      let dateFilter = {};
      if (filters && filters.month && (!filters.start && !filters.end)) {
        dateFilter = {
          start: `${filters.year ? filters.year : moment().year()}-${filters.month}-01`,
          end: `${moment(`${filters.year || moment().year()}-${filters.month}-01`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD')}`
        };
      }
      else
        if (filters && (filters.start || filters.end)) {
          dateFilter = {
            ...(filters.start ?
              { start: filters.start } :
              { start: filters['month'] ? `${filters.year ? filters.year : moment().year()}-${filters.month}-01` : moment().startOf('month').format('YYYY-MM-DD') }),
            ...(filters.end ?
              { end: filters.end } :
              filters['month'] ?
                { end: moment(`${filters.year ? filters.year : moment().year()}-${filters.month}-01`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD') } :
                { end: moment().endOf('month').format('YYYY-MM-DD') }),
          }
        }
        else {
          dateFilter = {
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD')
          }
        }
      let { data } = await axios.get(`${selectedStat.endpoint}/`, { params: { ...filters, ...dateFilter, set: 'all', format: 'xls', responseType: 'blob' } });
      const file = new Blob([data], {
        type: ''
      });
      const fileURL = URL.createObjectURL(file);

      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Estadistica_${selectedStat.title}_${'set'}.xls`);
      document.body.appendChild(link);

      link.click();
    }
    catch (data) {
      //console.log(data);
    }
  }

  ChartJS.register(
    ...registerables
  );

  const SelectedGraphView = ({ selectedStat }) => {
    const [graphType, setGraphType] = useState('bar');


    const getButtonGraph = () => {
      let toReturn;
      toReturn = selectedStat.graph.map((item) => {
        switch (item) {
          case 'Bar':
            {/* @ts-ignore */ }
            return <Grid xs={12} md={6}>
              <Button
                sx={{ backgroundColor: '#242943', color: '#fff', width: '100%' }}
                onClick={() => setGraphType('bar')}>
                <Typography>Grafico de barra</Typography>
              </Button>
            </Grid>
          case 'Pie':
             {/* @ts-ignore */ }
            return <Grid xs={12} md={6}>
              <Button
                sx={{ backgroundColor: '#242943', color: '#fff', width: '100%' }}
                onClick={() => setGraphType('pie')}>
                <Typography>Grafico de pie</Typography>
              </Button>
            </Grid>;
          default:
             {/* @ts-ignore */ }
            return <Grid xs={12} md={6}>
              <Button
                sx={{ backgroundColor: '#242943', color: '#fff', width: '100%' }}
                onClick={() => setGraphType('bar')}>
                <Typography>Grafico de barra</Typography>
              </Button>
            </Grid>
        }
      }); return toReturn;
    }

    const getText = () => {
      let toReturn;
      console.log('filters', filters)
      if (filters && filters.month && (!filters.start && !filters.end)) {
        toReturn = (
          <span style={{ display: 'block', margin: 0 }}>
            Mes de {monthNames[parseInt(filters.month) - 1]}
          </span>)
      }
      else
        if (filters && (filters.start || filters.end)) {
          toReturn = `Rango de fecha: ${filters &&
            (filters.start ?
              filters.start : filters['month'] ?
                `${filters.year ? filters.year : moment().year()}-${filters.month}-01` : moment().startOf('month').format('YYYY-MM-DD'))} -
                    ${filters && (filters.end ?
              filters.end : filters['month'] ?
                moment(`${filters.year ? filters.year : moment().year()}-${filters.month}-01`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD') : moment().endOf('month').format('YYYY-MM-DD'))}`
        }
        else {
          toReturn = <span style={{ display: 'block', margin: 0 }}>
            Mes de {(monthNames[moment().month()]).toString()}
          </span>
        }
      return toReturn;
    }
    console.log('selectedStat', selectedStat)

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', padding: '1rem 2rem', width: '100%' }}>
          <div>
            {!id && <h3 style={{ display: 'block', margin: 0, fontWeight: 'bold' }}>
              {selectedStat.title}
            </h3>}
            {getText()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {id && <>
              <Button
                style={{ border: 'none', backgroundColor: 'transparent', color: '#222' }}
                disabled={loading} onClick={() => getXlsx()}>
                <Download style={{ color: 'orange', marginRight: '.5rem' }} />
                Descargar Excel
              </Button>
              <Button
                style={{ border: 'none', backgroundColor: 'transparent', color: '#222' }}
                disabled={(!showTable && loading) ? true : false} onClick={() => {
                  if (showTable) {
                    setShowTable(false);
                  }
                  else {
                    navigate('/stats');
                  }
                }}>
                <KeyboardBackspace style={{ color: 'orange', marginRight: '.5rem' }} />
                Volver
              </Button>
            </>}

            <Button
              style={{ border: 'none', backgroundColor: 'transparent', color: '#222' }}
              onClick={() => {
                if (id) {
                  setShowTable(true);
                }
                else {
                  navigate(selectedStat.name);
                  setViewDetails(true);
                }
              }}>
              <Visibility style={{ color: 'orange', marginRight: '.5rem' }} />
              Ver Detalle
            </Button>
          </div>
        </div>
        <div style={{ width: '100%', padding: '0 2rem 2rem' }}>
          <Grid container spacing={3}>
            {id && getButtonGraph()}
          </Grid>
          <br />
          {graphType === 'bar' && selectedStat.barGraph(900, 600)}
          {graphType === 'pie' && selectedStat.pieGraph(900, 600)}
          <br />
          <h3 style={{ display: 'block', margin: 0, fontWeight: 'bold' }}>Total: {selectedStat.total}</h3>
          <br />
        </div>

      </>
    )
  }

  return (
    <>
      <MaterialUIDrawer
        title='Filtros'
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        <StatsFilters
          resetFilters={resetFilters}
          open={filtersOpen}
          noMonthDates={id ? false : true}
          setFiltersOpen={setFiltersOpen}
          _setFilters={setFilters}
          fields={id && (selectedStat?.filters || {})}
        />
      </MaterialUIDrawer>
      <Card >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ display: 'block', margin: 0, paddingLeft: '2rem', fontWeight: 'bold' }}>Informes</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {id && <>
              <Button
                disabled={loading} onClick={() => getXlsx()}
                style={{ border: 'none', backgroundColor: 'transparent', color: '#222' }}
              >
                <Download style={{ color: 'orange', marginRight: '.5rem' }} />
                Descargar Excel
              </Button>
              <Button
                style={{ border: 'none', backgroundColor: 'transparent', color: '#222' }}
                disabled={(!showTable && loading) ? true : false} onClick={() => {
                  if (showTable) {
                    setShowTable(false);
                  }
                  else {
                    navigate('/stats');
                  }
                }}>
                <KeyboardBackspace style={{ color: 'orange', marginRight: '.5rem' }} />
                Volver
              </Button>
            </>}
            <Button
              disabled={loading}
              color="secondary"
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={{ border: 'none', backgroundColor: 'transparent', color: '#222' }}
            >
              <ContentFilter style={{ color: 'orange', marginRight: '.5rem' }} />
              Filtrar
            </Button>
          </div>
        </div>
      </Card>
      <br />
      <Grid container spacing={3}>
        {!id && statsData?.map((item, key) => {
             {/* @ts-ignore */ }
          return <Grid xs={24} md={12} key={key}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* <span style={{display: 'inline-block', fontSize: 20}}>Total: </span> */}
                <span style={{ display: 'inline-block', fontSize: 20, fontWeight: 'bold', backgroundColor: '#fff', padding: '1rem .5rem', width: '100%' }}>
                  <SelectedGraphView selectedStat={item} />
                </span>
              </div>
            </Card>
          </Grid>
        })}
      </Grid>
      {id && selectedStat && !loading ? <>
        <Card style={{ padding: '1rem' }}>
          <h3 style={{ display: 'block', margin: 0, fontWeight: 'bold' }}>{selectedStat.title}</h3>
          <br />
          {showTable ?
            <MUITable data={selectedStat?.chartData?.config?.table || []} /> :
            <Grid container spacing={3}>
              {selectedStat.chartData.config.results.map((item, key) => {
                 {/* @ts-ignore */ }
                return <Grid xs={24} md={8} key={key}>
                  <Card style={{ padding: '1rem', backgroundColor: 'aliceblue', }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'inline-block', fontSize: 20 }}>{item[Object.keys(item)[0]]} </span>
                      <span style={{ display: 'inline-block', fontSize: 20, fontWeight: 'bold', backgroundColor: '#fff', padding: '.5rem 1rem ' }}>
                        {item[Object.keys(item)[Object.keys(item).length - 1]]}
                      </span>
                    </div>
                  </Card>
                </Grid>
              })}
              <SelectedGraphView selectedStat={selectedStat} />
            </Grid>
          }
        </Card>
      </> : 'Cargando...'}
    </>
  )
}


const MUITable = ({ data }) => {
  return (<>
    {data.length !== 0 ? <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="Tabla estadisticas">
        <TableHead>
          <TableRow>
            {Object.keys(data[0]).map((item, key) => <TableCell key={key}>{capitalize(item)}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, key) => (
            <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {Object.entries(item).map(([key, value], index) => <TableCell key={index}>{String(value)}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer> : <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="">
        <TableBody>
          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell align="center">Sin datos</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>}
  </>)
}
