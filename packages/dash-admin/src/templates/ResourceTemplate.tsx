/* eslint-disable no-mixed-spaces-and-tabs */

import { CustomRoutes, ResourceContextProvider, ResourceProps, RestoreScrollPosition } from 'react-admin/src';
import { Route, Routes, useParams } from 'react-router-dom';
import { isValidElementType } from 'react-is';
//import { Outlet } from 'react-router';
import {
    IDashAutoAdminResourceConfig,
    evalActionPermission,
} from 'dash-auto-admin';
import React, { ComponentType, PropsWithChildren, ReactElement, isValidElement, useEffect } from 'react';
import MotionWrapper from '../layout/MotionWrapper';
import Redirect from '../components/Redirect';
import { ResourceTemplateCreate } from './ResourceTemplateCreate';
import { ResourceTemplateEdit } from './ResourceTemplateEdit';
import { ResourceTemplateList } from './ResourceTemplateList';
import { ResourceTemplateShow } from './ResourceTemplateShow';
import {DASHAdminSystemConstants} from  'dash-constants'

import TrashTemplate from './TrashTemplate';
import { DashResourceProvider } from '../contexts/DashResourceContext';
import {Resource} from '../react-admin-dash/Resource';

//import {Resource} from "react-admin";
export interface IResourceTemplate {
    resourceConfig: IDashAutoAdminResourceConfig;
}

export const ResourceTemplate = (resourceConfig:IDashAutoAdminResourceConfig) => {
  
    const debug = true;

    const _create = evalActionPermission(resourceConfig, resourceConfig?.create);
    const _edit = evalActionPermission(resourceConfig, resourceConfig?.edit);
    const _view = evalActionPermission(resourceConfig, resourceConfig?.view);
    const _list = evalActionPermission(resourceConfig, resourceConfig?.list); // TODO: when view is false, the show routes still works.
    const _delete = evalActionPermission(resourceConfig, resourceConfig?.delete);

    /*const _showNotifyAfterSubmit =
    resourceConfig?.showNotifyAfterSubmit === false ? false : true;
    const _showDialogAfterSubmit =
    resourceConfig?.showDialogAfterSubmit === false ? false : true;*/
    const URL_PREFIX = DASHAdminSystemConstants.system.URL_PREFIX;
    const PATH = resourceConfig.model;

    /*if (debug) {
      
        console.info(`${PATH} ResourceTemplate`, {
            path: resourceConfig.path,
            resourceConfig: resourceConfig,
            evaluatedPermissions: {
                create: _create,
                edit: _edit,
                view: _view,
                list: _list,
                delete: _delete,
            },
        });
        
    }*/
    const a = '*';
    const idParamName = resourceConfig?.idParamName || 'id';
    //const { [idParamName]: id, [a]: all } = useParams();
   
   /*useEffect(()=> {
       console.log('ResourceTemplate useEffect', resourceConfig);
        console.log('ResourceTemplate _view', _view);
    },[]);*/
    
    return (
        <>
            <CustomRoutes>
                <Route element={<MotionWrapper />}>

                    {typeof resourceConfig.customRoutes === 'function' ? resourceConfig.customRoutes(resourceConfig) : <></>}

                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.create !== false && (
                        <Route
                            path={URL_PREFIX + PATH + '/create'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={
                                        URL_PREFIX + PATH + '/inline/create'
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
                            path={URL_PREFIX + PATH + '/inline'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={URL_PREFIX + PATH + '/inline'}
                                    method='list'
                                    drawerMethod='edit'
                                    resourceConfig={resourceConfig}
                                /></DashResourceProvider>
                            }
                        />
                    )}
                    {resourceConfig?.drawer === true && resourceConfig?.drawerOptions?.view !== false && (
                        <Route
                            path={URL_PREFIX + PATH + '/inline/:' + idParamName}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={
                                        URL_PREFIX +
                                        PATH +
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
                            path={URL_PREFIX + PATH + '/inline/:' + idParamName + '/edit'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={
                                        URL_PREFIX +
                                        PATH +
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
                            path={URL_PREFIX + PATH + '/inline/:' + idParamName + '/show'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={
                                        URL_PREFIX +
                                        PATH +
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
                            path={URL_PREFIX + PATH + '/inline/create'}
                            element={
                                <DashResourceProvider resourceConfig={resourceConfig}><Redirect
                                    stateHashPattern={URL_PREFIX + PATH + '/inline/create'}
                                    method='list'
                                    drawerMethod='create'
                                    resourceConfig={resourceConfig}
                                /></DashResourceProvider>
                            }
                        />
                    )}

                </Route>

                 <Route 
                    path="*" 
                    element={
                        <div>
                            <h3>ResourceTemplate Debug</h3>
                            <p>Resource: {resourceConfig.model}</p>
                            <p>Current Path: {window.location.pathname}</p>
                            <p>Expected: /{resourceConfig.model}</p>
                        </div>
                    } 
                />
            </CustomRoutes>

            <Resource
                options={{ label: resourceConfig.label, group: resourceConfig.group }}
                name={PATH}
                recordRepresentation={resourceConfig?.recordRepresentation || "name"}
                resourceConfig={resourceConfig}
                // @ts-ignore Expected mismatch types, nevertheless compatible 
                icon={resourceConfig?.icon || <></>}

                {..._list && {list : () => {
                    return <ResourceTemplateList resourceConfig={resourceConfig} />;
                } }}

                {..._create && {create : () => {
                    return <ResourceTemplateCreate resourceConfig={resourceConfig} />;
                } }}

                 {..._view && {show : () => {
                    
                    return <ResourceTemplateShow resourceConfig={resourceConfig} />;
                } }}

                  {..._edit && {edit : () => {
                 
                    return <ResourceTemplateEdit resourceConfig={resourceConfig} />;
                } }}


            >
               {/*
                {_list && <Route path={`/*`} element={ <DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateList resourceConfig={resourceConfig} /></DashResourceProvider>} />}
                {_create && <Route path={`create/*`} element={ <DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateCreate resourceConfig={resourceConfig} /></DashResourceProvider>} />}
                {_view && <Route path={`:id/show/*`}  element={ <DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateShow resourceConfig={resourceConfig} /></DashResourceProvider>} />}
                {_edit && <Route path={`:id/*`} element={<DashResourceProvider resourceConfig={resourceConfig}><ResourceTemplateEdit resourceConfig={resourceConfig} /></DashResourceProvider>} />}
              */}
              <Route path="trash/*" element={ <TrashTemplate resourceConfig={resourceConfig}  />} />
             
              

            </Resource>
        </>

    );
};
export default ResourceTemplate;