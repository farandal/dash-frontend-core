import { Resource } from 'react-admin';

import { Route } from 'react-router';
import { useListContext } from 'react-admin';
import { useState } from 'react';
import { useRefresh } from 'react-admin';
import { useUnselectAll } from 'react-admin';

import { Button } from 'react-admin';
import { Confirm } from 'react-admin';


import { DashAutoList, IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useDialog } from 'dash-dialog';
import { initAxios } from '../hooks/axios';
import ApplicationLayout from '../layout/ApplicationLayout';
import { ResourceTemplateList } from './ResourceTemplateList';

export interface TrashTemplateProps {
  resourceConfig: IDashAutoAdminResourceConfig
}

const TrashTemplate: React.FC<TrashTemplateProps> = ({ resourceConfig }) => {	
    
    const TrashBulkActions = () => {
		const axios = initAxios();
		const dialog = useDialog();

		const { selectedIds } = useListContext();

		const refresh = useRefresh();
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
					title: 'Restauración Realizada',
					content: 'Se han restaurado los elementos seleccionados',
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
					title: 'Eliminación permanente realizada',
					content:
						'Se han eliminado permanentemente los elementos seleccionados',
					onConfirm: () => {},
					onClose: () => {},
				});
			} catch (error) {
				setIsRestoringLoading(false);
			}
		};

		return (
			<>
				<Button label='Restaurar' onClick={handleRestoreManyClick} />
				<Confirm
					isOpen={restoreConfirmDialogOpen}
					loading={isRestoringLoading}
					title='Restaurar'
					content='¿Está seguro de restaurar los elementos seleccionados?'
					onConfirm={handleRestoreManyConfirm}
					onClose={handleRestoreManyDialogClose}
				/>
				<Button label='Eliminar' onClick={handleDeleteManyClick} />
				<Confirm
					isOpen={pemanentDeleteConfirmDialogOpen}
					loading={isDeletingLoading}
					title='Eliminar'
					content='¿Está seguro de eliminar permanentemente los elementos seleccionados?'
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
            //bulkActionButtons: <TrashBulkActions />
        },
		BulkActions: <TrashBulkActions />, // TD: there is an unnecesary complex logic implemented for this. it should be simplified, by passing the bulk actions in the dataGriProps. 
	};
   
	return (

				<Resource
					options={{
						label: trashResourceConfig.label,
						group: trashResourceConfig.group,
					}}
					name={trashResourceConfig.model}
					list={() => <ResourceTemplateList resourceConfig={trashResourceConfig} />/*{
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
