
import CloseIcon from '@mui/icons-material/Close';
import {
    SwipeableDrawer,
    IconButton,
    Typography,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Paper,
    CircularProgress,
    TextField,
    LinearProgress,
    Alert,
    Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useState } from 'react';
import {
    useRecordContext,
    Button,
    AppBar,
    Toolbar,
    useEditContext,
    useGetOne,
    Loading,
    useNotify,
    useRefresh
} from 'react-admin';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';
import { useAxios } from 'dash-axios-hook';
import { ITenantMarketplace } from '../../schemas/tenantMarketplace';
import { DASHAdminSystemConstants } from 'dash-constants';
import { useDialog } from 'dash-dialog';
import { AppDialogOptions } from 'dash-dialog/src/IAppDialogProps';
import nativeAxios from 'axios';


const LoadingProgress: React.FC<{ message: string }> = ({ message }) => (
    <Box sx={{ width: '100%', p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
            {message}
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
    </Box>
);

const TenantMarketplaceTestsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const [openModal, setOpenModal] = useState(false);
    const { record, isPending } = useEditContext();
    const [testResults, setTestResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const axios = useAxios();
    const notify = useNotify();
    const refresh = useRefresh();
    const dialog = useDialog();

    const { resourceConfig, method } = props;


    const successDialog = (message = "", options?: Partial<AppDialogOptions>) => {
        dialog(
            {
                variant: "info",
                title: "Conexión realizada exitosamente",
                content: message,
                ...options
            })
    }

    const errorDialog = (message, options?: Partial<AppDialogOptions>) => {
        dialog(
            {
                variant: "danger",
                title: "Ha ocurrido un error.",
                content: message,
                ...options
            })
    }



    const getSettings = async () => {
        if (!record?.id) return;

        try {
            const url = DASHAdminSystemConstants.system.API_URL + "/api/ecommerce/marketplace/" + record.id + "/oauth/getSettings";
            const response = await axios.get(url);
            console.log("getSettings", response);
            refresh();
            notify("Configuración obtenida exitosamente", { type: 'success' });
        } catch (error) {
            console.error("Error getting settings:", error);
            notify("Error al obtener la configuración", { type: 'error' });
        }
    }

    const getTenantMarketplaceConnectionURL = async () => {
        if (!record?.id) return;

        const getTenantMarketplaceConnectionURL = DASHAdminSystemConstants.system.API_URL + "/api/ecommerce/marketplace/" + record.id + "/oauth/setUpConnection";

        try {
            const response = await axios.post(getTenantMarketplaceConnectionURL);

            if (response.data && response.data.method === "TOKEN") {
                // Assumed success, continue...
                successDialog();
                refresh();
            } else if (response.data && response.data.auth_url) {
                try {
                    // This request performs OAuth authentication using the provided credentials and parameters
                    const oauthResponse = await nativeAxios.request({
                        url: response.data.auth_url,
                        method: response.data.method,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: new URLSearchParams(response.data.params)
                    });

                    successDialog();
                    refresh();
                    return oauthResponse.data;
                } catch (error) {
                    errorDialog(JSON.stringify(error));
                    console.error('OAuth request failed:', error);
                } finally {
                    notify("Proceso de conexión finalizado");
                }
            } else {
                // For other cases handle success
                successDialog();
                refresh();
            }
        } catch (e: any) {
            console.error("getTenantMarketplaceConnectionURL", e);
            const response = e.response;

            if (!response) {
                errorDialog("Error de conexión. Por favor intente nuevamente.");
                return;
            }

            switch (response.status) {
                case 301:
                    console.log("REDIRECT", response.data.auth_url);
                    window.location = response.data.auth_url;
                    break;
                case 422:
                    errorDialog(response.data.response?.body || response.data.message || "Error");
                    break;
                case 500:
                    errorDialog(response.data.message);
                    break;
                default:
                    errorDialog(response.data.message || e.message || "Ha ocurrido un error, vuelva a intentarlo.");
                    break;
            }
        } finally {
            notify("Proceso de conexión finalizado");
        }
    }





    const {
        data: connectionFormat,
        isLoading: connectionFormatLoading,
        error: connectionFormatError
    } = useGetOne(
        "ecommerce/marketplace/" + record?.id + "/connectionParamFormats",
        {
            id: record?.tenant_system_marketplace_id,
        },
        {
            refetchOnWindowFocus: false,
            enabled: !!(record?.id && record?.tenant_system_marketplace_id)
        }
    );






    function changeOpenModal() {
        openModal ? setOpenModal(false) : setOpenModal(true);
    }

    const handleClose = () => {
        setOpenModal(false);
    };

    const runTest = async (testIndex: number, testName: string) => {
        if (!record?.id) return;

        setLoading(prev => ({ ...prev, [testName]: true }));

        try {
            const response = await axios.post(`ecommerce/marketplace/${record.id}/test/${testIndex}`);
            setTestResults(prev => ({
                ...prev,
                [testName]: {
                    data: response.data,
                    status: response.status,
                    timestamp: new Date().toISOString()
                }
            }));
            notify(`Test "${testName}" executed successfully`, { type: 'success' });
        } catch (error: any) {
            console.error('Test execution failed:', error);
            setTestResults(prev => ({
                ...prev,
                [testName]: {
                    error: error.response?.data || error.message,
                    status: error.response?.status || 500,
                    timestamp: new Date().toISOString()
                }
            }));
            notify(`Test "${testName}" failed: ${error.response?.data?.message || error.message}`, { type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, [testName]: false }));
        }
    };

    // Handle different loading states with specific messages
    if (isPending || !record) {
        return <LoadingProgress message="Cargando información del marketplace..." />;
    }

    if (connectionFormatLoading) {
        return <LoadingProgress message="Cargando configuración de pruebas..." />;
    }

    // Handle error case
    /*if (connectionFormatError) {
        console.error('Connection format error:', connectionFormatError);
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error al cargar la configuración de pruebas: {connectionFormatError?.message || 'Error desconocido'}
                </Alert>
                <Button onClick={changeOpenModal} variant="outlined" className="btn-width-lg" style={{ marginLeft: 'auto' }}>
                    Panel de pruebas
                </Button>
            </Box>  
        );
    }*/

    return <Box 
    style={{
        display: 'flex',
        flexDirection: 'column'
    }} 
    sx={{ mb: 1 }}
    >

        {connectionFormatError ? <Alert>
            {connectionFormatError?.message || 'Error'}
        </Alert> : <></>}


        {(method === "edit" && (record?.connection_params)) ?
            <>
                <Button variant="outlined" onClick={() => getTenantMarketplaceConnectionURL()}>
                    {record.active ? "Re-Establecer conexión / renovar token" : "Establecer conexión - obtener token"}
                </Button>
                <Button variant="outlined" onClick={() => getSettings()}>
                    Obtener configuración
                </Button>
                <Button variant="outlined" onClick={changeOpenModal} >
                    Panel de pruebas
                </Button>
            </>
            :
            <></>}





        <SwipeableDrawer
            anchor={'right'}
            onClose={handleClose}
            open={openModal}
            slotProps={{
                paper: { sx: { width: '650px' } }
            }}
            onOpen={function (): void {
                throw new Error('Function not implemented.');
            }}>
            <Box sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                position: 'relative',
                padding: '8px 16px'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '64px'
                }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Pruebas
                    </Typography>
                </Box>
            </Box>

            <DialogContent>
                <section style={{ width: '600', maxWidth: '800' }}>
                    {connectionFormat?.tests && connectionFormat.tests.length > 0 ? (
                        connectionFormat.tests.map((test, index) => (
                            <Accordion key={test.name}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{test.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2">URL: {test.url}</Typography>
                                        <Typography variant="subtitle2">Method: {test.method}</Typography>
                                        <Typography variant="subtitle2">Response Type: {test.responseType}</Typography>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => runTest(index, test.name)}
                                            disabled={loading[test.name]}
                                            sx={{ mt: 1 }}
                                        >
                                            {loading[test.name] ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CircularProgress size={20} color="inherit" />
                                                    <Typography variant="button">Ejecutando...</Typography>
                                                </Box>
                                            ) : (
                                                'Ejecutar Prueba'
                                            )}
                                        </Button>
                                    </Box>

                                    {testResults[test.name] && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Status: {testResults[test.name].status}
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Timestamp: {testResults[test.name].timestamp}
                                            </Typography>
                                            {testResults[test.name].error ? (
                                                <TextField
                                                    sx={{ maxWidth: '600' }}
                                                    fullWidth
                                                    multiline
                                                    variant="outlined"
                                                    value={JSON.stringify(testResults[test.name].error, null, 2)}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                            style: { fontFamily: 'monospace' }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <TextField
                                                    sx={{ maxWidth: '600' }}
                                                    fullWidth
                                                    multiline
                                                    variant="outlined"
                                                    value={JSON.stringify(testResults[test.name].data, null, 2)}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                            style: { fontFamily: 'monospace', fontSize: '9px' }
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Typography>No tests available for this marketplace</Typography>
                    )}
                </section>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="primary" onClick={changeOpenModal}>
                    Volver
                </Button>
            </DialogActions>
        </SwipeableDrawer>
    </Box>
}

/** View component */
const TenantMarketplaceTestsView: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record: ITenantMarketplace = useRecordContext();
    return (
        <>
            <MUISimpleJsonTable vertical tableData={record?.tests} />
        </>
    )
}

/** Configuration Component */
const TenantMarketplaceTests = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <TenantMarketplaceTestsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <TenantMarketplaceTestsView attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "create":
            return <></>
    }
}

export default TenantMarketplaceTests
