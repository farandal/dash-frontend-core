import { FC, Fragment, useEffect, useMemo, useState } from "react";
import { 
    Grid, 
    Button, 
    Divider, 
    Collapse, 
    Card, 
    CardHeader, 
    CardContent, 
    CardActions,
    Typography,
    Breadcrumbs,
    Link,
    Box,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useGetList } from "react-admin";

import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

import moment from "moment";

import { useUpdate } from "react-admin";
import { useNotify } from "react-admin";
import { saveAs } from 'file-saver';

import { useNavigate } from "react-router";
import _, { isEmpty } from "lodash";
import UsersFilters from "./ProductElements/UsersFilters";
import SvgBoxCheck from "../SvgElements/SvgBoxCheck";
import { useAxios } from 'dash-axios-hook';
import React from "react";
import IUser from "../interfaces";
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';

interface IHistory {
    id: Number;
    batch_uuid: String;
    log_name: String;
    description: String;
    subject_type: String;
    subject_id: Number;
    event: String;
    created_at: String | any;
    causer_type: String;
    causer_id: Number;
    properties: {
        attributes?: {
            [key: string]: any;
        },
        old?: any
    },
    causer: IUser
}

const DICTIONARY = {
    "App\\Models\\Product": "Producto",
    "App\\Models\\Price": "Precios",
    "App\\Models\\Stock": "Stocks",
    "App\\Models\\ProductMetadata": "Metadata",
    "description": "Descripción",
    "sku": "SKU",
    "value": "Valor",
    "price": "Precio",
    "stock": "Stock",
    "created_at": "Fecha de creación",
    "updated_at": "Fecha de actualización",
    "deleted_at": "Fecha de eliminación",
}

const groupByProperty = (array: any[], property: string) => {
    const groupedToReturn = []
    array?.forEach((item: any) => {
        let added = false;
        groupedToReturn?.forEach((element: any[]) => {
            const name = element[0][property];

            if (name == item[property]) {
                element.push(item);
                added = true;
            }
        });
        if (!added) {
            groupedToReturn.push([item]);
        }
    });
    return groupedToReturn;
}

const History = ({ currentProduct }) => {
    const axios = useAxios();
    const [itemPerPage, setItemPerPage] = useState(20);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [filters, setFilters] = useState({})
    const navigate = useNavigate();
    const notify = useNotify();
    const [update] = useUpdate();

    const { data, isLoading, error, refetch, total } = useGetList(`ecommerce/product_log`, {
        pagination: { page: 1, perPage: itemPerPage },
        sort: false,
        filter: { ...filters, product_id: currentProduct.id, tenant_id: currentProduct.tenant_id },
    },
        { refetchOnWindowFocus: false });

    const authContext = useAuthContext();

    useEffect(() => {
        if (data) {
            const grouped = []
            data?.forEach((attribute: IHistory) => {
                let added = false;
                grouped?.forEach((tab: IHistory[]) => {
                    const name = tab[0]?.batch_uuid;

                    if (name == attribute?.batch_uuid) {
                        tab.push(attribute);
                        added = true;
                    }
                });
                if (!added) {
                    grouped.push([attribute]);
                }
            });
            setHistoryData(grouped);
        }
    }, [data])

    useEffect(() => {
        setFilters((prevState: any) => {
            let newState = { ...prevState };
            delete newState.start_date;
            delete newState.end_date;
            let dates = {
                ...(dateRange && dateRange[0] && { start_date: moment(dateRange[0]).format('YYYY-MM-DD') }),
                ...(dateRange && dateRange[1] && { end_date: moment(dateRange[1]).format('YYYY-MM-DD') })
            }
            return { ...newState, ...dates };
        });
    }, [dateRange])

    const restoreProduct = async (restoreData: IHistory[]) => {
        setIsRestoreLoading(true)
        try {
            let newRestoredData: any = {
                product: null,
                stocks: null,
                prices: null,
                metadata_mappings_request: currentProduct.metadata.map((item) => ({ id: item.metadata_format_id, [item.metadata_format_slug]: item.value }))
            }
            const groupedTypes = groupByProperty(restoreData, 'subject_type');

            groupedTypes.forEach((grpdType) => {
                switch (grpdType[0].subject_type) {
                    case 'App\\Models\\Product':
                        let product = {};
                        grpdType.forEach((item) => {
                            if (item.event === 'updated') { }
                            product = { ...product, ...item.properties.old }
                        });
                        newRestoredData.product = _.isEmpty(product) ? null : product;
                        break;
                    case 'App\\Models\\Price':
                        let prices = [];
                        grpdType.forEach((restoreItem) => {
                            if (restoreItem.event === 'updated') {
                                const foundPrice = currentProduct.prices.find(element => element.id === restoreItem.subject_id)
                                if (foundPrice) {
                                    prices.push({ ...foundPrice, ...restoreItem.properties.old })
                                }
                            }
                            if (restoreItem.event === 'created') {
                                const foundPrice = currentProduct.prices.find(element => element.id === restoreItem.subject_id)
                                if (foundPrice) {
                                    prices.push({ ...foundPrice, price: 0 })
                                }
                            }
                        });
                        if (_.isEmpty(prices)) {
                            newRestoredData.prices = currentProduct.prices;
                        }
                        else if (prices.length === currentProduct.prices.length)
                            newRestoredData.prices = prices;
                        else {
                            newRestoredData.prices = currentProduct.prices.filter(element => !prices.find(price => price.id === element.id))
                            newRestoredData.prices = [...newRestoredData.prices, ...prices]
                        }
                        break;
                    case 'App\\Models\\Stock':
                        let stocks = [];
                        grpdType.forEach((restoreItem) => {
                            if (restoreItem.event === 'updated') {
                                const foundStock = currentProduct.stocks.find(element => element.id === restoreItem.subject_id)
                                if (foundStock) {
                                    stocks.push({ ...foundStock, ...restoreItem.properties.old })
                                }
                            }
                            if (restoreItem.event === 'created') {
                                const foundStock = currentProduct.stocks.find(element => element.id === restoreItem.subject_id)
                                if (foundStock) {
                                    stocks.push({ ...foundStock, stock: 0 })
                                }
                            }
                        });
                        if (_.isEmpty(stocks)) {
                            newRestoredData.stocks = currentProduct.stocks;
                        }
                        else if (stocks.length === currentProduct.stocks.length)
                            newRestoredData.stocks = stocks;
                        else {
                            newRestoredData.stocks = currentProduct.stocks.filter(element => !stocks.find(stock => stock.id === element.id))
                            newRestoredData.stocks = [...newRestoredData.stocks, ...stocks]
                        }
                        break;
                    case 'App\\Models\\ProductMetadata':
                        let metadata = [];
                        grpdType.forEach((restoreItem) => {
                            if (restoreItem.event === 'updated') {
                                const foundMetadata = currentProduct.metadata.find(element => element.id === restoreItem.subject_id)
                                if (foundMetadata) {
                                    metadata.push({ id: foundMetadata.metadata_format_id, [foundMetadata.metadata_format_name.toLowerCase()]: restoreItem.properties.old.value })
                                }
                            }
                        });
                        if (metadata.length > 0 && metadata.length === currentProduct.metadata.length)
                            newRestoredData.metadata_mappings_request = metadata;
                        else if (!isEmpty(metadata)) {
                            const foundNotUsedMetadata = currentProduct.metadata.filter(element => !metadata.find(meta => meta.id === element.id)).map((item) => ({ id: item.metadata_format_id, [item.metadata_format_slug]: item.value }))
                            newRestoredData.metadata_mappings_request = [foundNotUsedMetadata, ...metadata]
                        }
                        const sortOrder = currentProduct.metadata.map(item => (item.metadata_format_id));
                        newRestoredData.metadata_mappings_request = newRestoredData.metadata_mappings_request.sort(function (a, b) {
                            return sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id);
                        });
                        break;
                }
            })

            newRestoredData = _(newRestoredData).omitBy(_.isUndefined).omitBy(_.isNull).value();
            let newProduct = { ...currentProduct, ...newRestoredData, ...(newRestoredData.product && newRestoredData.product) };

            await update(
                'product',
                { id: currentProduct.id, data: newProduct },
                {
                    onSuccess: () => { notify('Restaurado correctamente') },
                    onError: (error) => { console.error(error); notify(`Error al restaurar, ${error?.body?.message || ''}`) },
                    returnPromise: true
                }
            );
            navigate('/product')
        }
        catch (e) {
            console.error(e)
        }
        finally {
            setIsRestoreLoading(false);
        }
    }

    const downloadProductHistory = async () => {
        setIsDownloading(true);
        try {
            // const { data: file } = await axios.get(
            //     `/ecommerce/product_log/download`,
            //     {
            //         params: {
            //             product_id: currentProduct.id,
            //             tenant_id: currentProduct.tenant_id,
            //             ...filters
            //         },
            //         responseType: 'blob',
            //     }
            // );
            // saveAs(file, 'name.txt');
        } catch (error) {
            console.log(error)
        }
        finally {
            setIsDownloading(false);
        }
    }

    const deprecatedCol = () => {
        return (
            <Grid size={12}>
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: 16,
                        textAlign: "left",
                        margin: "2rem 0 0",
                        fontWeight: 'bold'
                    }}
                >
                    {currentProduct.description}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: 12,
                        textAlign: "center",
                        color: "#F57C00",
                        textTransform: "uppercase",
                        margin: "1rem 0",
                    }}
                >
                    Historial
                </Typography>
                <Button 
                    disabled={isDownloading} 
                    onClick={() => downloadProductHistory()} 
                    variant="contained"
                    sx={{ display: 'block', mx: 'auto', mb: 2 }}
                >
                    {isDownloading ? 'Descargando...' : 'Descargar historial'}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    sx={{
                        display: "block",
                        mx: "auto",
                        mt: 2,
                    }}
                >
                    Volver
                </Button>
            </Grid>
        )
    }

    const deprecatedHeader = () => {
        return (
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                        <Typography variant="h4" className="dash-page-title">
                            Historial
                        </Typography>
                    </Box>
                    <Breadcrumbs separator="/">
                        <Link underline="hover" color="inherit" href="#" className="dash-link">
                            Home
                        </Link>
                        <Link underline="hover" color="inherit" href="#" className="dash-link">
                            Dashboard
                        </Link>
                        <Link underline="hover" color="inherit" href="#" className="dash-link">
                            Productos
                        </Link>
                        <Typography color="text.primary">Trotadora ...</Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>
        )
    }

    const deprecatedFilters = () => {
        return (
            <UsersFilters
                options={authContext.user ? [{ id: -1, name: 'Seleccione' }, { id: 0, name: 'Sistema' }, ...userData] : [{ id: -1, name: 'Seleccione' }]}
                setSelectedUser={(selUser) => setFilters(prevState => ({ ...prevState, ...(selUser && { user_id: selUser }) }))}
            />
        )
    }

    return (
        <Card>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DateRangePicker onChange={setDateRange} value={dateRange} />
                    </Box>
                }
            />
            <CardContent>
                <Timeline>
                     {historyData.map((item: IHistory[], key: number) => {
                        return (
                            <TimelineItem key={key}>
                                <TimelineSeparator>
                                    <TimelineDot color="info" />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <TimeLineTable isRestoreLoading={isRestoreLoading} restoreFunct={restoreProduct} historyItems={item} />
                                </TimelineContent>
                            </TimelineItem>
                        )
                    })}
                </Timeline>
            </CardContent>
            <CardActions>
                {data?.length > 0 && data?.length < total && (
                    <Button 
                        disabled={isLoading} 
                        onClick={() => setItemPerPage((prevState) => prevState + 10)}
                        variant="outlined"
                    >
                        {isLoading ? 'Cargando...' : 'Cargar más'}
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

const TimeLineTable = ({ isRestoreLoading, historyItems, restoreFunct }: { isRestoreLoading: any, historyItems: IHistory[], restoreFunct: any }) => {
    const [tableChanges, setTableChanges] = useState([])
    const [relationChanges, setRelationChanges] = useState([])

    useEffect(() => {
        let tableChanges = [];
        let _relationChanges = [];
        historyItems.forEach((hItem: IHistory) => {
            if (hItem.subject_type === 'App\\Models\\Product') {
                let transformedKeys = [];

                if (hItem.properties?.attributes) {
                    transformedKeys = Object.keys(hItem.properties.attributes);

                    const transformedItem = Object.keys(transformedKeys).map((name) => {
                        return {
                            name,
                            newValue: hItem.properties.attributes[name],
                            ...(hItem.properties.old && { oldValue: hItem.properties.old[name] })
                        }
                    })
                    tableChanges = [
                        ...tableChanges,
                        ...transformedItem
                    ]
                }
            }
        });

        historyItems.forEach((hItem) => {
            if (hItem.subject_type !== 'App\\Models\\Product' && hItem?.properties?.attributes) {
                const transformedItem = Object.keys(hItem?.properties?.attributes).map((name) => {
                    return {
                        group: hItem.subject_type,
                        name,
                        newValue: name ? hItem.properties.attributes[name] : 0,
                        ...(hItem.properties.old && { oldValue: name ? hItem.properties.old[name] : 0 })
                    }
                })

                _relationChanges = [
                    ..._relationChanges,
                    ...transformedItem
                ]
            }
        })

        let groupedRelationChnges = [];
        _relationChanges.forEach((element: any) => {
            let added = false;
            groupedRelationChnges?.forEach((item: any[]) => {
                const name = item[0]?.group;

                if (name == element?.group) {
                    item.push(element);
                    added = true;
                }
            });
            if (!added) {
                groupedRelationChnges.push([element]);
            }
        });

        setRelationChanges(groupedRelationChnges);
        setTableChanges(tableChanges);
    }, [])

    const MemoizedComponent = useMemo(() => (historyItems: IHistory[]) => {
        return (
            <Paper className="dash-timeline-box" sx={{ p: 2 }}>
                <Box className="dash-timeline-content">
                    <Typography variant="body1" className="dash-timeline-title" sx={{ mb: 1 }}>
                        <strong>Glosa de cambios: </strong> 
                        {historyItems.length && moment(historyItems[0]?.created_at).format('HH:mm')} - 
                        {historyItems.length && moment(historyItems[0]?.created_at).format('YYYY/MM/DD')}
                    </Typography>
                    <Typography variant="body1" className="dash-timeline-title" sx={{ mb: 2 }}>
                        <strong>Autor: </strong> 
                        {historyItems.length && historyItems[0]?.causer?.name}
                    </Typography>
                    
                    <Grid container spacing={2} className="dash-my-3">
                        <Grid size={4}>
                            <Typography variant="body2">
                                <strong>Acción</strong>
                            </Typography>
                        </Grid>
                        <Grid size={8}>
                            {historyItems.length && (
                                <Typography variant="body2">
                                    {historyItems[0]?.event === 'created' ? 'Creación' : 'Actualización'} de recurso
                                </Typography>
                            )}
                        </Grid>
                    </Grid>

                    {tableChanges.length > 0 && (
                        <Grid container spacing={1} className="dash-my-3">
                            <ListItem name='Nombre' newValue='Nuevo' oldValue='Viejo' />
                            {tableChanges.map((item: any, key) => (
                                <ListItem 
                                    name={DICTIONARY[item.name]} 
                                    oldValue={item.oldValue} 
                                    newValue={item.newValue} 
                                    key={key} 
                                />
                            ))}
                        </Grid>
                    )}

                    {relationChanges.length > 0 && (
                        <Accordion
                            className="dash-timeline-collapse"
                            defaultExpanded
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Cambios sobre relaciones</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={1} className="dash-mb-3">
                                    {relationChanges?.map((grp, key) => (
                                        <Fragment key={key + 4000}>
                                            <Fragment>
                                                <Grid size={4}>
                                                    <Typography variant="body2">
                                                        <strong>{DICTIONARY[grp[0]?.group]}</strong>
                                                    </Typography>
                                                </Grid>
                                                <Grid size={4}>
                                                    <Typography variant="body2">
                                                        <strong>Nuevo</strong>
                                                    </Typography>
                                                </Grid>
                                                <Grid size={4}>
                                                    <Typography variant="body2">
                                                        <strong>Viejo</strong>
                                                    </Typography>
                                                </Grid>
                                            </Fragment>
                                            {grp.map((item, key) => (
                                                <Fragment key={key + 99}>
                                                    <Grid size={4}>
                                                        <Typography variant="body2">
                                                            {DICTIONARY[item?.name]}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={4}>
                                                        <Typography variant="body2">
                                                            {item?.newValue || ''}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={4}>
                                                        <Typography variant="body2">
                                                            {item?.oldValue || ''}
                                                        </Typography>
                                                    </Grid>
                                                </Fragment>
                                            ))}
                                        </Fragment>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Button 
                                disabled={isRestoreLoading} 
                                variant="outlined"
                                fullWidth
                                onClick={() => restoreFunct(historyItems)}
                                sx={{ minHeight: 40 }}
                            >
                                {isRestoreLoading ? 'Restaurando...' : 'Restaurar'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        )
    }, [historyItems]);

    return MemoizedComponent(historyItems);
};

const ListItem = ({ name, oldValue, newValue }: { name?: string, oldValue?: string, newValue?: string }) => {
    return (
        <>
            <Grid size={4}>
                <Typography variant="body2">{name}</Typography>
            </Grid>
            {oldValue && (
                <Grid size={4}>
                    <Typography variant="body2">{oldValue}</Typography>
                </Grid>
            )}
            {newValue && (
                <Grid size={4}>
                    <Typography variant="body2">{newValue}</Typography>
                </Grid>
            )}
        </>
    )
}

export default History;
