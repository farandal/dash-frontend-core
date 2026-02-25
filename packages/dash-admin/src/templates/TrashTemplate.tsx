import { Resource } from 'react-admin';

import { Route } from 'react-router';
import { useListContext } from 'react-admin';
import { useState } from 'react';
import { useRefresh, useTranslate } from 'react-admin';
import { useUnselectAll } from 'react-admin';

import { Button } from 'react-admin';
import { Confirm } from 'react-admin';


import { DashAutoList, IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useDialog } from 'dash-dialog';
import { initAxios } from '../hooks/axios';
import ApplicationLayout from '../layout/ApplicationLayout';
import { ResourceTemplateList } from './ResourceTemplateList';
import { useDashResource } from '../contexts/DashResourceContext';
import { IResourceTemplate } from './ResourceTemplate';


const TrashTemplate = (resourceConfig: IDashAutoAdminResourceConfig, locale?: string) => {	
    const TrashBulkActions = () => {
       
		const axios = initAxios();
		const dialog = useDialog();

		const { selectedIds } = useListContext();

		const refresh = useRefresh();
		const translate = useTranslate();
		const unselectAll = useUnselectAll(trashResourceConfig.model);

		// RestoreMany
		const [isRestoringLoading, setIsRestoringLoading] =
			useState<boolean>(false);
		const [restoreConfirmDialogOpen, setRestoreConfirmDialogOpen] =
			useState(false);
		const handleRestoreManyClick = () => setRestoreConfirmDialogOpen(true);
		const handleRestoreManyDialogClose = () =>
			setRestoreConfirmDialogOpen(false);
		const handleRestoreManyConfirm = () => {
			restoreMany();
			setRestoreConfirmDialogOpen(false);
		};

		// DeleteMany
		const [isDeletingLoading, setIsDeletingLoading] = useState<boolean>(false);
		const [pemanentDeleteConfirmDialogOpen, setPermanentDeleteDialogOpen] =
			useState(false);
		const handleDeleteManyClick = () => setPermanentDeleteDialogOpen(true);
		const handleDeleteManyDialogClose = () =>
			setPermanentDeleteDialogOpen(false);
		const handleDeleteManyConfirm = () => {
			deleteMany();
			setPermanentDeleteDialogOpen(false);
		};

		const restoreMany = async () => {
			setIsRestoringLoading(true);
			try {
				await axios.post(`${trashResourceConfig.model}/updateMany`, {
					ids: selectedIds,
				});
				setIsRestoringLoading(false);
				refresh();
				unselectAll();
				dialog({
					variant: 'info',
					title: translate('dash.resource.updated'),
					content: translate('dash.resource.updated_message', { label: translate(trashResourceConfig.label, { _: trashResourceConfig.label }) }),
					onConfirm: () => {},
					onClose: () => {},
				});
			} catch (error) {
				setIsRestoringLoading(false);
			}
		};

		const deleteMany = async () => {
			setIsRestoringLoading(true);
			try {
				await axios.post(`${trashResourceConfig.model}/deleteMany`, {
					ids: selectedIds,
				});
				setIsRestoringLoading(false);
				refresh();
				unselectAll();
				dialog({
					variant: 'info',
					title: translate('dash.resource.updated'),
					content: translate('dash.resource.updated_message', { label: translate(trashResourceConfig.label, { _: trashResourceConfig.label }) }),
					onConfirm: () => {},
					onClose: () => {},
				});
			} catch (error) {
				setIsRestoringLoading(false);
			}
		};

		return (
			<>
        
				<Button label={translate('dash.action.restore')} onClick={handleRestoreManyClick} />
				<Confirm
					isOpen={restoreConfirmDialogOpen}
					loading={isRestoringLoading}
					title={translate('dash.action.restore')}
					content={translate('dash.message.are_you_sure')}
					onConfirm={handleRestoreManyConfirm}
					onClose={handleRestoreManyDialogClose}
				/>
				<Button label={translate('ra.action.delete')} onClick={handleDeleteManyClick} />
				<Confirm
					isOpen={pemanentDeleteConfirmDialogOpen}
					loading={isDeletingLoading}
					title={translate('ra.action.delete')}
					content={translate('dash.message.are_you_sure')}
					onConfirm={handleDeleteManyConfirm}
					onClose={handleDeleteManyDialogClose}
				/>
			</>
		);
	};
    
	const trashResourceConfig: IDashAutoAdminResourceConfig = {
		...resourceConfig,
		model:  resourceConfig.model+'/trash',
		listDeleteButton: {
			enabled: true,
			props: { label: 'Eliminar definitivamente' },
		},
		listEditButton: { enabled: false },
		listViewButton: { enabled: false },
		customListButtons: null,
        dataGridProps: {
            ...resourceConfig.dataGridProps,
            bulkActionButtons: <TrashBulkActions />
        },
        
	};
  
	return (

				<Resource
					options={{
						label: trashResourceConfig.label,
						group: trashResourceConfig.group,
					}}
					name={trashResourceConfig.model}
					list={() => <><ResourceTemplateList resourceConfig={trashResourceConfig} locale={locale} /></>/*{
						return (
							<ApplicationLayout
								//icon={trashResourceConfig.icon} 
                                //title={trashResourceConfig.label} menu={trashResourceConfig.menu} 
                                //mainAction={trashResourceConfig.mainAction} 
								resourceConfig={resourceConfig}
							>
								<DashAutoList
                                    //BulkActions={trashResourceConfig.BulkActions}
    
									//search={trashResourceConfig.search} schema={trashResourceConfig.listSchema ? trashResourceConfig.listSchema : trashResourceConfig.schema}
                                    //BulkActions={trashResourceConfig.BulkActions} 
                                    //create={trashResourceConfig.create} 
									resourceConfig={trashResourceConfig}
								/>
							</ApplicationLayout>
						);
                        
					}*/}
					// @ts-ignore 
					icon={trashResourceConfig.icon}
				/>
                );
      

};

export default TrashTemplate;
