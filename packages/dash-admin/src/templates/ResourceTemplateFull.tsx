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
    useRefresh,
    useTranslate
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
import { parseAxiosError } from '../helpers/parseAxiosError';
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
                    const translate = useTranslate();

                    useEffect(() => {
                        console.log('LIST', resourceConfig);
                    }, []);

                    const onSubmit = (data: any) => {

                        const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });

                        if (_showNotifyAfterSubmit) {
                            notify('dash.resource.updated', { type: 'success' });
                        }

                        if (_showDialogAfterSubmit) {
                            dialog({
                                variant: 'info',
                                title: translate('dash.resource.updated'),
                                content: translate('dash.resource.updated_message', { label: translatedLabel }),
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
                        const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });
                        dialog({
                            variant: 'danger',
                            title: translate('dash.resource.error', { label: translatedLabel }),
                            content: `${parseAxiosError(error)}`,
                            onConfirm: () => {},
                            onClose: () => {},
                        });
                        //showError(error);
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
                        const translate = useTranslate();
                        //const location = useLocation();

                        const onEdit = (data: any) => {

                            const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });

                            if (_showNotifyAfterSubmit) {
                                notify('dash.resource.edited', { type: 'success' });
                            }
                            if (_showDialogAfterSubmit) {
                                dialog({
                                    variant: 'info',
                                    title: translate('dash.resource.updated'),
                                    content: translate('dash.resource.updated_message', { label: translatedLabel }),
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
                            const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });
                            dialog({
                                variant: 'danger',
                                title: translate('dash.resource.error', { label: translatedLabel }),
                                content: `${parseAxiosError(error)}`,
                                onConfirm: () => {},
                                onClose: () => {},
                            });
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
                        const dialog = useDialog();
                        const translate = useTranslate();

                        const onCreate = (data: any) => {

                            const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });

                            if (_showNotifyAfterSubmit) {
                                notify('dash.resource.created', { type: 'success' });
                            }
                            if (_showDialogAfterSubmit) {
                                dialog({
                                    variant: 'info',
                                    title: translate('dash.resource.created'),
                                    content: translate('dash.resource.created_message', { label: translatedLabel }),
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
                            const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });
                            dialog({
                                variant: 'danger',
                                title: translate('dash.resource.error', { label: translatedLabel }),
                                content: `${parseAxiosError(error)}`,
                                onConfirm: () => {},
                                onClose: () => {},
                            });
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
