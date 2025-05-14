/* eslint-disable no-mixed-spaces-and-tabs */
import { Resource } from 'react-admin';
import { CustomRoutes } from 'react-admin/src';
import { Route, useParams } from 'react-router-dom';
//import { Outlet } from 'react-router';
import {
    IDashAutoAdminResourceConfig,
    evalActionPermission,
} from 'dash-auto-admin';
import React, { PropsWithChildren } from 'react';
import MotionWrapper from '../layout/MotionWrapper';
import Redirect from '../components/Redirect';
import { ResourceTemplateCreate } from './ResourceTemplateCreate';
import { ResourceTemplateEdit } from './ResourceTemplateEdit';
import { ResourceTemplateList } from './ResourceTemplateList';
import { ResourceTemplateShow } from './ResourceTemplateShow';
import DASHAdminSystemConstants from '../config/DASHAdminSystemConstants';
import TrashTemplate from './TrashTemplate';
import { DashResourceProvider } from '../contexts/DashResourceContext';

export interface IResourceTemplate {
    resourceConfig: IDashAutoAdminResourceConfig;
}

export const ResourceTemplate = (resourceConfig:IDashAutoAdminResourceConfig) => {
  
    const debug = false;

    const _create = evalActionPermission(resourceConfig, resourceConfig?.create);
    const _edit = evalActionPermission(resourceConfig, resourceConfig?.edit);
    const _view = evalActionPermission(resourceConfig, resourceConfig?.view);
    const _list = evalActionPermission(resourceConfig, resourceConfig?.list); // TODO: when view is false, the show routes still works.
    const _delete = evalActionPermission(resourceConfig, resourceConfig?.delete);

    /*const _showNotifyAfterSubmit =
    resourceConfig?.showNotifyAfterSubmit === false ? false : true;
    const _showDialogAfterSubmit =
    resourceConfig?.showDialogAfterSubmit === false ? false : true;*/

    if (debug) {
        console.info(`${resourceConfig.model} ResourceTemplate`, {
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
    const a = '*';
    const idParamName = resourceConfig?.idParamName || 'id';
    //const { [idParamName]: id, [a]: all } = useParams();
    const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX;
  
    return (
        <>
            <CustomRoutes>
                <Route element={<MotionWrapper />}>

                    {typeof resourceConfig.customRoutes === 'function' ? resourceConfig.customRoutes(resourceConfig) : <></>}

                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.create !== false && (
                        <Route
                            path={URL_PREFIX + resourceConfig.model + '/create'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={
                                        URL_PREFIX + resourceConfig.model + '/inline/create'
                                    }
                                    method='list'
                                    drawerMethod='create'
                                    resourceConfig={resourceConfig}
                                /></DashResourceProvider>
                            }
                        />
                    )}
                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.edit !== false && (
                        <Route
                            path={URL_PREFIX + resourceConfig.model + '/inline'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={URL_PREFIX + resourceConfig.model + '/inline'}
                                    method='list'
                                    drawerMethod='edit'
                                    resourceConfig={resourceConfig}
                                /></DashResourceProvider>
                            }
                        />
                    )}
                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.view !== false && (
                        <Route
                            path={URL_PREFIX + resourceConfig.model + '/inline/:' + idParamName}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
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
                                /></DashResourceProvider>
                            }
                        />
                    )}
                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.edit !== false && (
                        <Route
                            path={URL_PREFIX + resourceConfig.model + '/inline/:' + idParamName + '/edit'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
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
                                /></DashResourceProvider>
                            }
                        />
                    )}
                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.view !== false && (
                        <Route
                            path={URL_PREFIX + resourceConfig.model + '/inline/:' + idParamName + '/show'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
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
                                /></DashResourceProvider>
                            }
                        />
                    )}
                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.create !== false && (
                        <Route
                            path={URL_PREFIX + resourceConfig.model + '/inline/create'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={URL_PREFIX + resourceConfig.model + '/inline/create'}
                                    method='list'
                                    drawerMethod='create'
                                    resourceConfig={resourceConfig}
                                /></DashResourceProvider>
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

                <Route path="trash/*" element={ <DashResourceProvider resourceConfig={resourceConfig}><TrashTemplate resourceConfig={resourceConfig} /></DashResourceProvider>} />
                {_list && <Route path={`/*`} element={ <DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateList resourceConfig={resourceConfig} /></DashResourceProvider>} />}
                {_create && <Route path={`create/*`} element={ <DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateCreate resourceConfig={resourceConfig} /></DashResourceProvider>} />}
                {_view && <Route path={`:id/show/*`}  element={ <DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateShow resourceConfig={resourceConfig} /></DashResourceProvider>} />}
                {_edit && <Route path={`:id/*`} element={<DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateEdit resourceConfig={resourceConfig} /></DashResourceProvider>} />}
              
            </Resource>
        </>

    );
};
export default ResourceTemplate;