import { Resource, TabbedShowLayout } from 'react-admin';
import { Show } from 'react-admin';
// @ts-ignore - Layout may not exist
import ApplicationLayout from '../../layouts/ApplicationLayout';
import { IAppResourceConfig } from '../../interfaces/IAppResourceConfig';
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
// @ts-ignore - Dialog service may not exist
import { useDialog } from '../../components/Dialog/DialogService';
import { TopToolbar } from 'react-admin';
import { EditButton } from 'react-admin';
import { CustomRoutes } from 'react-admin';
import { Route } from 'react-router';
import TrashTemplate from '../Trash/TrashTemplate';
// @ts-ignore - dash-auto-admin imports may not be available
import AutoCreate from 'dash-auto-admin/AutoCreate';
// @ts-ignore - dash-auto-admin imports may not be available
import AutoEdit from 'dash-auto-admin/AutoEdit';
// @ts-ignore - dash-auto-admin imports may not be available
import DashAutoList from 'dash-auto-admin/DashAutoList';
// @ts-ignore - dash-auto-admin imports may not be available
import AutoReferenceTab from 'dash-auto-admin/AutoReferenceTab';
// @ts-ignore - dash-auto-admin imports may not be available
import AutoTabs from 'dash-auto-admin/AutoTabs';
// @ts-ignore - dash-auto-admin imports may not be available
import { AutoTitle } from 'dash-auto-admin';

export const BrandResource = (resourceConfig: IAppResourceConfig) => {
	const beforeSubmut = (data: any) => {
		data.input_brand_mappings = data.input_brand_mappings.map(
			(ele) => ele.text,
		);
		return data;
	};

	return (
		<>
			<CustomRoutes>{TrashTemplate(resourceConfig)}</CustomRoutes>
			<Resource
				options={{ label: resourceConfig.label, group: resourceConfig.group }}
				name={resourceConfig.model}
				list={() => {
					return (
						<ApplicationLayout resourceConfig={resourceConfig}>
							<DashAutoList
								/*sx={{
                    flexGrow: 1
                }}*/
								/*search={resourceConfig.search} schema={resourceConfig.listSchema ? resourceConfig.listSchema : resourceConfig.schema} BulkActions={resourceConfig.BulkActions} create={resourceConfig.create}*/ resourceConfig={
									resourceConfig
								}
							/>
						</ApplicationLayout>
					);
				}}
				edit={() => (
					<ApplicationLayout resourceConfig={resourceConfig}>
						<AutoEdit
							beforeSubmit={beforeSubmut}
							//schema={resourceConfig.editSchema ? resourceConfig.editSchema : resourceConfig.schema}
							resourceConfig={resourceConfig}
						/>
					</ApplicationLayout>
				)}
				create={() => {
					const notify = useNotify();
					const redirect = useRedirect();
					const dialog = useDialog();
					const onCreate = (data: any) => {
						notify(`Recurso Creado`,{type:'success'});
						dialog({
							variant: 'info',
							title: 'Recurso Creado',
							description: 'Se ha creado el recurso  ' + resourceConfig.label,
							onConfirm: () => {
								redirect('/' + resourceConfig.model);
							},
							onClose: () => {},
						});
					};
					const onError = (error: any) => {
						notify(`Error!`);
					};
					return (
						<ApplicationLayout resourceConfig={resourceConfig}>
							<AutoCreate
								beforeSubmit={beforeSubmut}
								//schema={resourceConfig.createSchema ? resourceConfig.createSchema : resourceConfig.schema}
								onError={onError}
								onSubmit={onCreate}
								/*toolbar={<ResourceCreateToolbar />}*/ resourceConfig={
									resourceConfig
								} /*toolbar={<ResourceCreateToolbar />}*/
							/>
						</ApplicationLayout>
					);
				}}
				show={() => {
					const ShowActions = ({ edit }) => (
						<TopToolbar sx={{mb:2}} >{edit !== false && <EditButton />}</TopToolbar>
					);
					return (
						<ApplicationLayout resourceConfig={resourceConfig}>
							<Show
								title={
									<AutoTitle
										//schema={resourceConfig.showSchema ? resourceConfig.showSchema : resourceConfig.schema} />}
										//actions={<ShowActions edit={resourceConfig.edit}
										resourceConfig={resourceConfig}
									/>
								}
							>
								<TabbedShowLayout>
									{AutoTabs(resourceConfig.schema)}
									{resourceConfig.references &&
										resourceConfig.references.map((reference) =>
											AutoReferenceTab(reference),
										)}
								</TabbedShowLayout>
							</Show>
						</ApplicationLayout>
					);
				}}
				// @ts-ignore - icon type compatibility issue
				icon={resourceConfig.icon}
			/>
		</>
	);
};
export default BrandResource;
