import { PropsWithChildren, useEffect } from 'react';
import { Route, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { useDialog } from 'dash-dialog';
import { IDASHAppConstants } from 'dash-constants';
import {
    Create,
    Edit,
    EditButton,
    CustomRoutes,
    Loading,
    Resource,
    Show,
    SimpleForm,
    TabbedShowLayout,
    TopToolbar,
    Toolbar,
    useNotify,
    useRedirect,
    useRefresh
} from 'react-admin';
import {
    DashAutoCreate,
    DashAutoDrawer,
    DashAutoEdit,
    DashAutoList,
    DashAutoReferenceTab,
    DashAutoTabs,
    DashAutoTitle,
    DashRedirect,
    evalActionPermission,
    IDashAutoAdminResourceConfig,
} from 'dash-auto-admin';


import { DashResourceProvider } from '../contexts/DashResourceContext';
import DashAutoAdminSaveButton from 'dash-auto-admin/src/DashAutoAdminSaveButton';
// TODO: The following dependencies shpuld not depend on @dashboard

export const ResourceTemplateFull = (
    resourceConfig: IDashAutoAdminResourceConfig,
    ResourceLayout: React.FC<PropsWithChildren<{ resourceConfig: IDashAutoAdminResourceConfig }>>,
    dashConstants: IDASHAppConstants,
) => {
    const _create = evalActionPermission(resourceConfig, resourceConfig?.create);
    const _edit = evalActionPermission(resourceConfig, resourceConfig?.edit);
    //const _delete = evalActionPermission(resourceConfig,resourceConfig?.delete)

    const _showNotifyAfterSubmit =
        resourceConfig?.showNotifyAfterSubmit === false ? false : true;
    const _showDialogAfterSubmit =
        resourceConfig?.showDialogAfterSubmit === false ? false : true;

    const showError = (error: any) => {
        if (error && error.nativeEvent) return;

        let _error: any = error;
        try {
            const _parsedError =
                typeof error === 'string' ? JSON.parse(error) : error;
            if (typeof _parsedError === 'object') {
                _error = <>{JSON.stringify(_parsedError)}</>;
            }
        } catch (e) {
            console.error(e);
        }

        toast.error(<>{_error}</>, {
            position: 'bottom-center',
            //autoClose: 10000,
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            //progress: undefined,
            /*onClose: () => {
            }*/
        });
    };

    return (
        <DashResourceProvider resourceConfig={resourceConfig}>
            <CustomRoutes>
                {typeof resourceConfig.customRoutes === 'function'
                    ? resourceConfig.customRoutes(resourceConfig)
                    : null}
                <Route
                    path={resourceConfig.model + '/inline'}
                    element={
                        <DashRedirect
                            stateHashPattern={dashConstants.system.URL_PREFIX + resourceConfig.model + '/inline'}
                            method='list'
                            drawerMethod='edit'
                            resourceConfig={resourceConfig}
                        />
                    }
                />
                <Route
                    path={resourceConfig.model + '/inline/:id'}
                    element={
                        <DashRedirect
                            stateHashPattern={
                                dashConstants.system.URL_PREFIX + resourceConfig.model + '/inline/:id/:method'
                            }
                            method='list'
                            drawerMethod='edit'
                            resourceConfig={resourceConfig}
                        />
                    }
                />
                <Route
                    path={resourceConfig.model + '/inline/:id/edit'}
                    element={
                        <DashRedirect
                            stateHashPattern={
                                dashConstants.system.URL_PREFIX + resourceConfig.model + '/inline/:id/:method'
                            }
                            method='list'
                            drawerMethod='edit'
                            resourceConfig={resourceConfig}
                        />
                    }
                />
                <Route
                    path={resourceConfig.model + '/inline/:id/show'}
                    element={
                        <DashRedirect
                            stateHashPattern={
                                dashConstants.system.URL_PREFIX + resourceConfig.model + '/inline/:id/:method'
                            }
                            method='list'
                            drawerMethod='show'
                            resourceConfig={resourceConfig}
                        />
                    }
                />
                <Route
                    path={resourceConfig.model + '/inline/create'}
                    element={
                        <DashRedirect
                            stateHashPattern={dashConstants.system.URL_PREFIX + resourceConfig.model + '/inline/create'}
                            method='list'
                            drawerMethod='create'
                            resourceConfig={resourceConfig}
                        />
                    }
                />
            </CustomRoutes>
            <Resource
                options={{ label: resourceConfig.label, group: resourceConfig.group }}
                name={resourceConfig.model}
                list={() => {
                    const notify = useNotify();
                    const redirect = useRedirect();
                    const dialog = useDialog();
                    const refresh = useRefresh();

                    useEffect(() => {
                        console.log('LIST', resourceConfig);
                    }, []);

                    const onSubmit = (data: any) => {
                        if (_showNotifyAfterSubmit) {
                            notify('Recurso Actualizado', { type: 'success' });
                        }

                        if (_showDialogAfterSubmit) {
                            dialog({
                                variant: 'info',
                                title: 'Recurso Actualizado',
                                content:
                                    'Se ha actualizado el recurso  ' + resourceConfig.label,
                                onConfirm: () => {
                                    //resourceConfig.refreshAfter && refresh();
                                    switch (resourceConfig.redirectAfterUpdate) {
                                        case false:
                                            return;
                                        case 'view':
                                            redirect(
                                                '/' + resourceConfig.model + '/' + data.id + '/show',
                                            );
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
                                onClose: () => { },
                            });
                        }

                        if (!_showDialogAfterSubmit && resourceConfig.redirectAfterUpdate) {
                            switch (resourceConfig.redirectAfterUpdate) {
                                case 'view':
                                    redirect(
                                        '/' + resourceConfig.model + '/' + data.id + '/show',
                                    );
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

                        if (resourceConfig.refreshAfter) {
                            refresh();
                        }
                    }; const onError = (error: any) => {
                        //notify(`Error!`);
                        showError(error);
                    };

                    return (
                        <ResourceLayout resourceConfig={resourceConfig}>
                            {resourceConfig.listComponent ? (
                                resourceConfig.listComponent(resourceConfig, onSubmit, onError)
                            ) : (
                                <DashAutoList
                                    resourceConfig={resourceConfig}
                                    onSubmit={onSubmit}
                                    onError={onError}
                                    // custom form Domain project:
                                    //stickyHeader={true}
                                    {...(resourceConfig.Pagination && {
                                        Pagination: resourceConfig.Pagination,
                                    })}
                                />
                            )}
                            {resourceConfig.drawer && (
                                <DashAutoDrawer
                                    resourceConfig={resourceConfig}
                                    {...(resourceConfig.drawerProps && {
                                        ...resourceConfig.drawerProps,
                                    })}
                                />
                            )}
                        </ResourceLayout>
                    );
                }}
                edit={
                    _edit &&
                    (() => {
                        useEffect(() => {
                            console.log('EDIT', resourceConfig);
                        }, []);

                        const notify = useNotify();
                        const redirect = useRedirect();
                        const dialog = useDialog();
                        const refresh = useRefresh();
                        //const location = useLocation();

                        const onEdit = (data: any) => {
                            if (_showNotifyAfterSubmit) {
                                notify('Recurso Editado');
                            }
                            if (_showDialogAfterSubmit) {
                                dialog({
                                    variant: 'info',
                                    title: 'Recurso Actualizado',
                                    content:
                                        'Se ha actualizado el recurso  ' + resourceConfig.label,
                                    onConfirm: () => {
                                        //resourceConfig.refreshAfter && refresh();
                                        switch (resourceConfig.redirectAfterUpdate) {
                                            case false:
                                                return;
                                            case 'view':
                                                redirect(
                                                    '/' + resourceConfig.model + '/' + data.id + '/show',
                                                );
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
                                    onClose: () => { },
                                });
                            }

                            if (
                                !_showDialogAfterSubmit &&
                                resourceConfig.redirectAfterUpdate
                            ) {
                                switch (resourceConfig.redirectAfterUpdate) {
                                    case 'view':
                                        redirect(
                                            '/' + resourceConfig.model + '/' + data.id + '/show',
                                        );
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

                            if (resourceConfig.refreshAfter) {
                                refresh();
                            }
                        }; const onError = (error: any) => {
                            //notify(`Error!`);
                            showError(error);
                        };

                        const onBeforeSubmit = (values: any) => {
                            return resourceConfig.beforeSubmit
                                ? resourceConfig.beforeSubmit(values)
                                : values;
                        };

                        const ToolBar = () => {
                            return (
                                <Toolbar>
                                    <DashAutoAdminSaveButton
                                        resourceConfig={resourceConfig}
                                        alwaysEnable={
                                            resourceConfig?.saveButtonAlwaysEnabled === true
                                                ? true
                                                : false
                                        }
                                       
                                    />
                                </Toolbar>
                            );
                        };

                        return resourceConfig.editComponent ? (
                            <ResourceLayout resourceConfig={resourceConfig}>
                                <Edit>
                                    {' '}
                                    <SimpleForm reValidateMode="onBlur">
                                        {resourceConfig.editComponent(resourceConfig)}
                                    </SimpleForm>
                                </Edit>
                                {resourceConfig.drawer && (
                                    <DashAutoDrawer
                                        onError={onError}
                                        onSubmit={onEdit}
                                        resourceConfig={resourceConfig}
                                        {...(resourceConfig.drawerProps && {
                                            ...resourceConfig.drawerProps,
                                        })}
                                    />
                                )}
                            </ResourceLayout>
                        ) : (
                            <ResourceLayout resourceConfig={resourceConfig}>
                                <DashAutoEdit
                                    toolbar={<ToolBar />}
                                    onError={onError}
                                    onSubmit={onEdit}
                                    beforeSubmit={onBeforeSubmit}
                                    resourceConfig={resourceConfig}
                                />
                                {resourceConfig.drawer && (
                                    <DashAutoDrawer
                                        onError={onError}
                                        onSubmit={onEdit}
                                        resourceConfig={resourceConfig}
                                        {...(resourceConfig.drawerProps && {
                                            ...resourceConfig.drawerProps,
                                        })}
                                    />
                                )}
                            </ResourceLayout>
                        );
                    })
                }
                create={
                    _create &&
                    (() => {
                        const notify = useNotify();
                        const redirect = useRedirect();
                        const refresh = useRefresh();
                        //console.log("CREATE", resourceConfig)
                        const dialog = useDialog();

                        const onCreate = (data: any) => {
                            if (_showNotifyAfterSubmit) {
                                notify('Recurso Creado');
                            }
                            if (_showDialogAfterSubmit) {
                                dialog({
                                    variant: 'info',
                                    title: 'Recurso Creado',
                                    content: 'Se ha creado el recurso  ' + resourceConfig.label,
                                    onConfirm: () => {
                                        switch (resourceConfig?.redirectAfterCreate) {
                                            case false:
                                                return;
                                            case 'view':
                                                redirect(
                                                    '/' + resourceConfig.model + '/' + data.id + '/show',
                                                );
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
                                    onClose: () => { },
                                });
                            }

                            if (
                                !_showDialogAfterSubmit &&
                                resourceConfig.redirectAfterCreate
                            ) {
                                switch (resourceConfig?.redirectAfterCreate) {
                                    case 'view':
                                        redirect(
                                            '/' + resourceConfig.model + '/' + data.id + '/show',
                                        );
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

                            if (resourceConfig.refreshAfter) {
                                refresh();
                            }
                        }; 
                        
                        const onError = (error: any) => {
                            //notify(`Error!`);
                           
                            showError(error);
                        };

                        const onBeforeSubmit = (values: any) => {
                            return resourceConfig.beforeSubmit
                                ? resourceConfig.beforeSubmit(values)
                                : values;
                        };

                        const ToolBar = () => {
                            return (
                                <Toolbar>
                                     <DashAutoAdminSaveButton
                                        resourceConfig={resourceConfig}
                                        alwaysEnable={
                                            resourceConfig?.saveButtonAlwaysEnabled === true
                                                ? true
                                                : false
                                        }
                                      
                                    />
                                </Toolbar>
                            );
                        };

                        return resourceConfig.createComponent ? (
                            <ResourceLayout resourceConfig={resourceConfig}>
                                <Create>
                                    <SimpleForm reValidateMode="onBlur">
                                        {resourceConfig.createComponent(resourceConfig)}
                                    </SimpleForm>
                                </Create>
                                {resourceConfig.drawer && (
                                    <DashAutoDrawer
                                        resourceConfig={resourceConfig}
                                        {...(resourceConfig.drawerProps && {
                                            ...resourceConfig.drawerProps,
                                        })}
                                    />
                                )}
                            </ResourceLayout>
                        ) : (
                            <ResourceLayout resourceConfig={resourceConfig}>
                                <DashAutoCreate
                                    toolbar={<ToolBar />}
                                    onError={onError}
                                    onSubmit={onCreate}
                                    beforeSubmit={onBeforeSubmit}
                                    resourceConfig={resourceConfig}
                                />
                                {resourceConfig.drawer && (
                                    <DashAutoDrawer
                                        resourceConfig={resourceConfig}
                                        {...(resourceConfig.drawerProps && {
                                            ...resourceConfig.drawerProps,
                                        })}
                                    />
                                )}
                            </ResourceLayout>
                        );
                    })
                }
                show={() => {
                    const ShowActions = ({ edit }) => (
                        <TopToolbar sx={{ mb: 2 }} >{edit !== false && <EditButton />}</TopToolbar>
                    );

                    return resourceConfig.showComponent ? (
                        <ResourceLayout resourceConfig={resourceConfig}>
                            <Show
                                title={
                                    <DashAutoTitle
                                        //schema={resourceConfig.showSchema ? resourceConfig.showSchema : resourceConfig.schema}
                                        resourceConfig={resourceConfig}
                                    />
                                }
                                actions={<ShowActions edit={resourceConfig.edit} />}
                            >
                                {resourceConfig.showComponent(resourceConfig)}
                            </Show>
                            {resourceConfig.drawer && (
                                <DashAutoDrawer
                                    resourceConfig={resourceConfig}
                                    {...(resourceConfig.drawerProps && {
                                        ...resourceConfig.drawerProps,
                                    })}
                                />
                            )}
                        </ResourceLayout>
                    ) : (
                        <ResourceLayout resourceConfig={resourceConfig}>
                            <Show
                                title={
                                    <DashAutoTitle
                                        //schema={resourceConfig.showSchema ? resourceConfig.showSchema : resourceConfig.schema}
                                        resourceConfig={resourceConfig}
                                    />
                                }
                                actions={<ShowActions edit={resourceConfig.edit} />}
                            >
                                <TabbedShowLayout syncWithLocation={false}>
                                    {DashAutoTabs(resourceConfig)}
                                    {resourceConfig.references &&
                                        resourceConfig.references.map((reference) =>
                                            DashAutoReferenceTab(reference),
                                        )}
                                </TabbedShowLayout>
                            </Show>
                            {resourceConfig.drawer && (
                                <DashAutoDrawer
                                    resourceConfig={resourceConfig}
                                    {...(resourceConfig.drawerProps && {
                                        ...resourceConfig.drawerProps,
                                    })}
                                />
                            )}
                        </ResourceLayout>
                    );
                }}
                /* @ts-ignore */
                icon={resourceConfig.icon}
            />
        </DashResourceProvider>
    );
};
export default ResourceTemplateFull;
