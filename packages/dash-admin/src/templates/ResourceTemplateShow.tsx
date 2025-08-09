
/* eslint-disable no-mixed-spaces-and-tabs */




import { FC, useEffect } from 'react';


//import { Outlet } from 'react-router';
import {
	DashAutoDrawer,
} from 'dash-auto-admin';



import DashAutoShow from 'dash-auto-admin/src/DashAutoShow';
//import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';
//import { AnimatePresence, motion } from 'framer-motion';


//import { useForm } from 'react-hook-form';
import React from 'react';
import ResourceLayout from '../layout/ResoureLayout';
import { useDashResource } from '../contexts/DashResourceContext';
import { IResourceTemplate } from './ResourceTemplate';


export const ResourceTemplateShow: FC<IResourceTemplate> = (props) => {
	//const {resourceConfig} = useDashResource()
      const {resourceConfig} = props;

	/*const ShowActions = ({ edit }) => (
    <TopToolbar>{edit !== false && <EditButton />}</TopToolbar>
  );*/
  /*useEffect(() => {
    debugger;
  },[]);*/

	return resourceConfig.showComponent ? (
		<ResourceLayout resourceConfig={resourceConfig}>
			{/* <Show
        title={
          <DashAutoTitle
            //schema={resourceConfig.showSchema ? resourceConfig.showSchema : resourceConfig.schema}
            resourceConfig={resourceConfig}
          />
        }
        actions={<ShowActions edit={resourceConfig.edit} />}
      >
        {resourceConfig.showComponent(resourceConfig)}
      </Show>*/}
			<DashAutoShow resourceConfig={resourceConfig} />

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
			{/*<Show
        title={
          <DashAutoTitle
            //schema={resourceConfig.showSchema ? resourceConfig.showSchema : resourceConfig.schema}
            resourceConfig={resourceConfig}
          />
        }
        actions={<ShowActions edit={resourceConfig.edit} />}
      >
        <DashAutoShow resourceConfig={resourceConfig} />
      </Show>*/}
			<DashAutoShow resourceConfig={resourceConfig} />
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
};
