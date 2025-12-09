// in posts.js
import { matchPath, Route, useLocation, useNavigate } from "react-router";
import {
    ShowBase,
    Resource,
    useNotify,
    useGetList,
    useRefresh,
    useRedirect,
    CustomRoutes,
    Button,
    DeleteButton,
    EditBase,
    SaveButton,
    Toolbar
} from "react-admin";


import { useMediaQuery, Drawer } from "@mui/material";
import ApplicationLayout from "dash-admin/src/layout/ApplicationLayout";
import { useDialog } from "dash-dialog";
import moment from "moment";
import React, { useCallback, useMemo, Suspense } from "react";
import { Theme } from "react-pick-color";
import { 
    DashAutoList, 
    DashAutoEdit, 
    DashAutoCreate,
    DashAutoDrawer,
    IDashAutoAdminResourceConfig,
    evalActionPermission
} from "dash-auto-admin";
import MotionWrapper from "dash-admin/src/layout/MotionWrapper";
import Redirect from "dash-admin/src/components/Redirect";
import {DASHAdminSystemConstants} from "dash-constants";
import TrashTemplate from "dash-admin/src/templates/TrashTemplate";
import { DashResourceProvider } from "dash-admin/src/contexts/DashResourceContext";
import { parseAxiosError } from "dash-admin/src/helpers/parseAxiosError";
import ResourceLayout from "dash-admin/src/layout/ResoureLayout";
import { IAppResourceConfig } from "kt-utils/src/interfaces";


// Lazy load the heavy CampaignEdit component (747 lines)
const CampaignEdit = React.lazy(() => import("./components/Campaign/CampaignEdit"));

export interface ICampaignFormMarketplaces {
    id: number,
    source_primary_pricelist_id: number,
    source_sale_pricelist_id: number,
    source_stock_type_id: number,
    overwrite_prices: boolean,
    overwrite_stocks: boolean,
    republish_products: boolean,
}

export interface ICampaignForm {
    tenant_id: number,
    name: string,
    description: string
    start_date: string //"2022-08-10 00:00:00",
    end_date: string //"2022-08-17 00:00:00",
    product_ids: number[],
    marketplaces: ICampaignFormMarketplaces[]
}

export const CampaignResourceTemplate = (resourceConfig: IAppResourceConfig & IDashAutoAdminResourceConfig) => {
    const debug = false;

    // Evaluate permissions like ResourceTemplate
    const _create = evalActionPermission(resourceConfig, resourceConfig?.create);
    const _edit = evalActionPermission(resourceConfig, resourceConfig?.edit);
    const _view = evalActionPermission(resourceConfig, resourceConfig?.view);
    const _list = evalActionPermission(resourceConfig, resourceConfig?.list);
    const _delete = evalActionPermission(resourceConfig, resourceConfig?.delete);

    if (debug) {
        console.info(`${resourceConfig.model} CampaignResource`, {
            resourceConfig: resourceConfig,
            evaluatedPermissions: {
                create: _create,
                edit: _edit,
                view: _view,
                list: _list,
                delete: _delete,
            },
        });
    }

    const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX;
    const idParamName = resourceConfig?.idParamName || 'id';

    const beforeSubmit = (data) => {
        const toReturn = {
            ...data,
            start_date: moment(data.start_date).format("YYYY-MM-DD HH:mm:ss"),
            end_date: moment(data.end_date).format("YYYY-MM-DD HH:mm:ss"),
        };
        console.log(toReturn);
        return toReturn;
    }

    // Campaign List Component following ResourceTemplateList pattern exactly
    const CampaignListComponent = () => {
        const notify = useNotify();
        const redirect = useRedirect();
        const dialog = useDialog();
        const refresh = useRefresh();

        // Memoize these boolean values to prevent unnecessary re-renders
        const showNotifyAfterSubmit = useMemo(() => 
            resourceConfig?.showNotifyAfterSubmit !== false, 
            [resourceConfig?.showNotifyAfterSubmit]
        );
        
        const showDialogAfterSubmit = useMemo(() => 
            resourceConfig?.showDialogAfterSubmit !== false, 
            [resourceConfig?.showDialogAfterSubmit]
        );

        // Memoize the onSubmit function with proper dependencies
        const onSubmit = useCallback((data: any) => {
            if (showNotifyAfterSubmit) {
                notify('Recurso Actualizado', { type: 'success' });
            }

            if (showDialogAfterSubmit) {
                dialog({
                    variant: 'info',
                    title: 'Recurso Actualizado',
                    content: 'Se ha actualizado el recurso  ' + resourceConfig.label,
                    onConfirm: () => {
                        switch (resourceConfig.redirectAfterUpdate) {
                            case false:
                                return;
                            case 'view':
                                redirect('/' + resourceConfig.model + '/' + data.id + '/show');
                                break;
                            case 'edit':
                                redirect('/' + resourceConfig.model + '/' + data.id);
                                break;
                            case 'list':
                            default:
                                redirect('/' + resourceConfig.model);
                                break;
                        }
                    },
                    onClose: () => {},
                });
            }

            if (!showDialogAfterSubmit && resourceConfig.redirectAfterUpdate) {
                switch (resourceConfig?.redirectAfterUpdate) {
                    case 'view':
                        redirect('/' + resourceConfig.model + '/' + data.id + '/show');
                        break;
                    case 'edit':
                        redirect('/' + resourceConfig.model + '/' + data.id);
                        break;
                    case 'list':
                    default:
                        redirect('/' + resourceConfig.model);
                        break;
                }
            }

            if (resourceConfig?.refreshAfter !== false) {
                refresh();
            }
        }, [
            showNotifyAfterSubmit,
            showDialogAfterSubmit,
            notify,
            dialog,
            redirect,
            refresh,
            resourceConfig.label,
            resourceConfig.model,
            resourceConfig.redirectAfterUpdate,
            resourceConfig.refreshAfter
        ]);
        
        // Memoize the onError function with proper dependencies
        const onError = useCallback((_error: any) => {
            if (resourceConfig.onError) {
                resourceConfig.onError('list', _error);
                return;
            } 

            dialog({
                variant: 'danger',
                title: `${resourceConfig.label} Error`,
                content: `${parseAxiosError(_error)}`,
                onConfirm: () => {},
                onClose: () => {},
            });
        }, [
            resourceConfig.onError,
            resourceConfig.label,
            dialog
        ]);

        // Memoize the drawer props to prevent unnecessary re-renders
        const drawerProps = useMemo(() => ({
            onSubmit,
            onError,
            resourceConfig,
            ...(resourceConfig.drawerProps && {
                ...resourceConfig.drawerProps,
            }),
        }), [onSubmit, onError, resourceConfig]);

        // Memoize the pagination props
        const paginationProps = useMemo(() => 
            resourceConfig.Pagination ? { Pagination: resourceConfig.Pagination } : {},
            [resourceConfig.Pagination]
        );

        return (
            <ResourceLayout resourceConfig={resourceConfig}>
                <DashAutoList
                    resourceConfig={resourceConfig}
                    onSubmit={onSubmit}
                    onError={onError}
                    {...paginationProps}
                />

                {resourceConfig.drawer && (
                    <DashAutoDrawer {...drawerProps} />
                )}
            </ResourceLayout>
        );
    };

    // Legacy CampaignList for backward compatibility
    const CampaignList = () => {
        return <ApplicationLayout resourceConfig={resourceConfig}>
            <DashAutoList resourceConfig={resourceConfig} />
        </ApplicationLayout>
    }

    const CampaignListDrawer = () => {
        const location = useLocation();
        const navigate = useNavigate();
        const notify = useNotify();
        const redirect = useRedirect();
        const dialog = useDialog();
        const refresh = useRefresh();

        const handleCloseDrawer = useCallback(() => {
            navigate("/" + resourceConfig.model);
        }, [navigate]);

        const drawerWidth = 600;
        const edit_mode = matchPath(resourceConfig.model + '/inline/:id', location.pathname);
        const create_mode = matchPath(resourceConfig.model + '/inline/create', location.pathname);

        let mode = "list";
        let showDrawer = false;

        if (edit_mode) { showDrawer = true; mode = "edit"; }
        if (create_mode) { showDrawer = true; mode = "create"; }

        const DrawerToolbar = () => (
            <Toolbar>
                {mode === "edit" && <SaveButton label="Guardar" />}
                {mode === "create" && <SaveButton label="Crear" />}
                {resourceConfig?.listDeleteButton?.enabled && <DeleteButton label="Eliminar" />}
                <Button onClick={handleCloseDrawer}><>Cerrar</></Button>
            </Toolbar>
        );

        // Enhanced onSubmit and onError handlers for drawer mode
        const onSubmit = useCallback((data: any) => {
            notify('Recurso Actualizado', { type: 'success' });
            dialog({
                variant: 'info',
                title: 'Recurso Actualizado',
                content: 'Se ha actualizado el recurso  ' + resourceConfig.label,
                onConfirm: () => {
                    switch (resourceConfig.redirectAfterUpdate) {
                        case false:
                            return;
                        case 'view':
                            redirect('/' + resourceConfig.model + '/' + data.id + '/show');
                            break;
                        case 'edit':
                            redirect('/' + resourceConfig.model + '/' + data.id);
                            break;
                        case 'list':
                        default:
                            redirect('/' + resourceConfig.model);
                            break;
                    }
                },
                onClose: () => {},
            });
            if (resourceConfig?.refreshAfter !== false) {
                refresh();
            }
        }, [notify, dialog, redirect, refresh, resourceConfig]);

        const onError = useCallback((_error: any) => {
            if (resourceConfig.onError) {
                resourceConfig.onError('list', _error);
                return;
            } 
            dialog({
                variant: 'danger',
                title: `${resourceConfig.label} Error`,
                content: `${parseAxiosError(_error)}`,
                onConfirm: () => {},
                onClose: () => {},
            });
        }, [resourceConfig.onError, resourceConfig.label, dialog]);

        const paginationProps = useMemo(() => 
            resourceConfig.Pagination ? { Pagination: resourceConfig.Pagination } : {},
            [resourceConfig.Pagination]
        );

        return <ApplicationLayout resourceConfig={resourceConfig}>
            <DashAutoList
                resourceConfig={resourceConfig}
                onSubmit={onSubmit}
                onError={onError}
                {...paginationProps}
            />

            <Drawer
                variant="persistent"
                open={!!showDrawer}
                anchor="right"
                onClose={handleCloseDrawer}
                sx={{ zIndex: 100 }}
            >
                {!!showDrawer && (
                    <>
                        {mode === "edit" &&
                            <div className="grouppedForm" style={{ width: drawerWidth + "px" }}>
                                <DashAutoEdit 
                                    toolbar={<DrawerToolbar />} 
                                    id={(edit_mode as any).params.id} 
                                    resourceConfig={{ ...resourceConfig, formGroupMode: "groups" }}
                                    beforeSubmit={beforeSubmit} 
                                    onCancel={handleCloseDrawer} 
                                />
                            </div>
                        }
                        {mode === "create" &&
                            <div className="grouppedForm" style={{ width: drawerWidth + "px" }}>
                                <DashAutoCreate 
                                    toolbar={<DrawerToolbar />} 
                                    id={(create_mode as any).params.id} 
                                    resourceConfig={{ ...resourceConfig, formGroupMode: "groups" }}
                                    beforeSubmit={beforeSubmit} 
                                    onCancel={handleCloseDrawer} 
                                />
                            </div>
                        }
                    </>
                )}
            </Drawer>
        </ApplicationLayout>
    }

    return <>
        <CustomRoutes>
            <Route element={<MotionWrapper />}>
                {/* Original Campaign-specific route */}
                <Route 
                    key={resourceConfig.model + "/marketplace/:id/:idmp"} 
                    path={resourceConfig.model + "/marketplace/:id/:idmp"} 
                    element={
                        <ApplicationLayout resourceConfig={resourceConfig}>
                            <Suspense >
                                <CampaignEdit />
                            </Suspense>
                        </ApplicationLayout>
                    }
                />

                {/* Custom routes from resourceConfig */}
                {typeof resourceConfig.customRoutes === 'function' ? resourceConfig.customRoutes(resourceConfig) : <></>}

                {/* Drawer routes from ResourceTemplate */}
                {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.create !== false && (
                    <Route
                        path={URL_PREFIX + resourceConfig.model + '/create'}
                        element={
                            <DashResourceProvider resourceConfig={resourceConfig}>
                                <Redirect
                                    stateHashPattern={URL_PREFIX + resourceConfig.model + '/inline/create'}
                                    method='list'
                                    drawerMethod='create'
                                    resourceConfig={resourceConfig}
                                />
                            </DashResourceProvider>
                        }
                    />
                )}
                {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.edit !== false && (
                    <Route
                        path={URL_PREFIX + resourceConfig.model + '/inline'}
                        element={
                            <DashResourceProvider resourceConfig={resourceConfig}>
                                <Redirect
                                    stateHashPattern={URL_PREFIX + resourceConfig.model + '/inline'}
                                    method='list'
                                    drawerMethod='edit'
                                    resourceConfig={resourceConfig}
                                />
                            </DashResourceProvider>
                        }
                    />
                )}
                {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.view !== false && (
                    <Route
                        path={URL_PREFIX + resourceConfig.model + '/inline/:' + idParamName}
                        element={
                            <DashResourceProvider resourceConfig={resourceConfig}>
                                <Redirect
                                    stateHashPattern={
                                        URL_PREFIX +
                                        resourceConfig.model +
                                        '/inline/:' +
                                        idParamName +
                                        '/:method'
                                    }
                                    method='list'
                                    drawerMethod='edit'
                                    resourceConfig={resourceConfig}
                                />
                            </DashResourceProvider>
                        }
                    />
                )}
                {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.edit !== false && (
                    <Route
                        path={URL_PREFIX + resourceConfig.model + '/inline/:' + idParamName + '/edit'}
                        element={
                            <DashResourceProvider resourceConfig={resourceConfig}>
                                <Redirect
                                    stateHashPattern={
                                        URL_PREFIX +
                                        resourceConfig.model +
                                        '/inline/:' +
                                        idParamName +
                                        '/:method'
                                    }
                                    method='list'
                                    drawerMethod='edit'
                                    resourceConfig={resourceConfig}
                                />
                            </DashResourceProvider>
                        }
                    />
                )}
                {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.view !== false && (
                    <Route
                        path={URL_PREFIX + resourceConfig.model + '/inline/:' + idParamName + '/show'}
                        element={
                            <DashResourceProvider resourceConfig={resourceConfig}>
                                <Redirect
                                    stateHashPattern={
                                        URL_PREFIX +
                                        resourceConfig.model +
                                        '/inline/:' +
                                        idParamName +
                                        '/:method'
                                    }
                                    method='list'
                                    drawerMethod='show'
                                    resourceConfig={resourceConfig}
                                />
                            </DashResourceProvider>
                        }
                    />
                )}
                {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.create !== false && (
                    <Route
                        path={URL_PREFIX + resourceConfig.model + '/inline/create'}
                        element={
                            <DashResourceProvider resourceConfig={resourceConfig}>
                                <Redirect
                                    stateHashPattern={URL_PREFIX + resourceConfig.model + '/inline/create'}
                                    method='list'
                                    drawerMethod='create'
                                    resourceConfig={resourceConfig}
                                />
                            </DashResourceProvider>
                        }
                    />
                )}
            </Route>
        </CustomRoutes>

        <Resource 
            options={{ label: resourceConfig.label, group: resourceConfig.group }} 
            name={resourceConfig.model}
            recordRepresentation={resourceConfig?.recordRepresentation || "name"}
            resourceConfig={resourceConfig}
            // @ts-ignore Expected mismatch types, nevertheless compatible 
            icon={resourceConfig?.icon || <></>}
        >
            {/* Routes from ResourceTemplate */}
            <Route path="trash/*" element={<TrashTemplate resourceConfig={resourceConfig} />} />
            {_list && <Route path={`/*`} element={
                // Use the new CampaignListComponent that follows ResourceTemplateList pattern
                <CampaignListComponent />
            } />}
            {_create && <Route path={`create/*`} element={(() => {
                const CreateComponent = () => {
                    const notify = useNotify();
                    const redirect = useRedirect();
                    const dialog = useDialog();
                    const refresh = useRefresh();
                    
                    const onCreate = (data: any) => {
                        notify(`Recurso Creado`, { type: 'success' });
                        
                        if (resourceConfig?.showDialogAfterSubmit !== false) {
                            dialog({
                                variant: "info",
                                title: "Recurso Creado",
                                content: "Se ha creado el recurso " + resourceConfig.label,
                                onConfirm: () => {
                                    // Refresh the list first
                                    refresh();
                                    
                                    // Then redirect
                                    switch (resourceConfig.redirectAfterCreate) {
                                        case 'view':
                                            redirect('/' + resourceConfig.model + '/' + data.id + '/show');
                                            break;
                                        case 'edit':
                                            redirect('/' + resourceConfig.model + '/' + data.id);
                                            break;
                                        case 'list':
                                        default:
                                            redirect('/' + resourceConfig.model);
                                            break;
                                    }
                                },
                                onClose: () => {
                                    // Also refresh and redirect on close
                                    refresh();
                                    if (resourceConfig.redirectAfterCreate !== false) {
                                        redirect('/' + resourceConfig.model);
                                    }
                                }
                            });
                        } else {
                            // No dialog - refresh and redirect directly
                            refresh();
                            switch (resourceConfig.redirectAfterCreate) {
                                case 'view':
                                    redirect('/' + resourceConfig.model + '/' + data.id + '/show');
                                    break;
                                case 'edit':
                                    redirect('/' + resourceConfig.model + '/' + data.id);
                                    break;
                                case 'list':
                                default:
                                    redirect('/' + resourceConfig.model);
                                    break;
                            }
                        }
                    };
                    
                    const onError = (error: any) => {
                        if (resourceConfig.onError) {
                            resourceConfig.onError('create', error);
                            return;
                        }
                        dialog({
                            variant: 'danger',
                            title: `${resourceConfig.label} Error`,
                            content: `${parseAxiosError(error)}`,
                            onConfirm: () => {},
                            onClose: () => {},
                        });
                    };

                    return (
                        <ResourceLayout resourceConfig={resourceConfig}>
                            <DashAutoCreate 
                                beforeSubmit={beforeSubmit}
                                resourceConfig={resourceConfig}
                                onSubmit={onCreate}
                                onError={onError}
                            />
                        </ResourceLayout>
                    );
                };
                return <CreateComponent />;
            })()} />}
            {_view && <Route path={`:${idParamName}/show/*`} element={
                <ResourceLayout resourceConfig={resourceConfig}>
                    <EditBase>
                        <Suspense >
                            <CampaignEdit />
                        </Suspense>
                    </EditBase>
                </ResourceLayout>
            } />}
            {_edit && <Route path={`:${idParamName}/*`} element={(() => {
                const EditComponent = () => {
                    const refresh = useRefresh();
                    const notify = useNotify();
                    const redirect = useRedirect();
                    const dialog = useDialog();
                    
                    const onSubmit = (values: any) => {
                        notify(`Recurso Actualizado!`, { type: 'success' });
                        
                        if (resourceConfig?.showDialogAfterSubmit !== false) {
                            dialog({
                                variant: "info",
                                title: "Recurso Actualizado",
                                content: "Se ha actualizado el recurso " + resourceConfig.label,
                                onConfirm: () => {
                                    refresh();
                                    switch (resourceConfig.redirectAfterUpdate) {
                                        case false:
                                            return;
                                        case 'view':
                                            redirect('/' + resourceConfig.model + '/' + values.id + '/show');
                                            break;
                                        case 'edit':
                                            redirect('/' + resourceConfig.model + '/' + values.id);
                                            break;
                                        case 'list':
                                        default:
                                            redirect('/' + resourceConfig.model);
                                            break;
                                    }
                                },
                                onClose: () => {
                                    refresh();
                                }
                            });
                        } else {
                            refresh();
                            switch (resourceConfig.redirectAfterUpdate) {
                                case false:
                                    return;
                                case 'view':
                                    redirect('/' + resourceConfig.model + '/' + values.id + '/show');
                                    break;
                                case 'edit':
                                    redirect('/' + resourceConfig.model + '/' + values.id);
                                    break;
                                case 'list':
                                default:
                                    redirect('/' + resourceConfig.model);
                                    break;
                            }
                        }
                    };

                    return (
                        <ResourceLayout resourceConfig={resourceConfig}>
                            <DashAutoEdit 
                                beforeSubmit={beforeSubmit}
                                resourceConfig={resourceConfig}
                                onSubmit={onSubmit}
                            />
                        </ResourceLayout>
                    );
                };
                return <EditComponent />;
            })()} />}
        </Resource>
    </>
}

export default CampaignResourceTemplate;
