import { Resource, TabbedShowLayout } from 'react-admin';
import { Show } from 'react-admin';
import { IAppResourceConfig } from '../../interfaces/IAppResourceConfig';
import { TopToolbar } from 'react-admin';
import { EditButton } from 'react-admin';
import { CustomRoutes } from 'react-admin';
import TrashTemplate from '../Trash/TrashTemplate';
import {
	DashAutoList,
	DashAutoReferenceTab,
	DashAutoTabs,
	DashAutoTitle,
} from 'dash-auto-admin';
import ApplicationLayout from '../../layout/ApplicationLayout';

export const LogResource = (resourceConfig: IAppResourceConfig) => {
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
                    flexGrow: 1,
                    transition: (theme: any) =>
                        theme.transitions.create(['all'], {
                            duration: theme.transitions.duration.enteringScreen,
                        })
                }}*/

								/*search={resourceConfig.search} schema={resourceConfig.listSchema ? resourceConfig.listSchema : resourceConfig.schema} BulkActions={resourceConfig.BulkActions} create={resourceConfig.create}*/ resourceConfig={
									resourceConfig
								}
							/>
						</ApplicationLayout>
					);
				}}
				show={() => {
					const ShowActions = ({ edit }) => (
						<TopToolbar sx={{ mb: 2 }} >{edit !== false && <EditButton />}</TopToolbar>
					);
					return (
						<ApplicationLayout resourceConfig={resourceConfig}>
							<Show
								title={
									<DashAutoTitle
										resourceConfig={resourceConfig}
										//schema={resourceConfig.showSchema ? resourceConfig.showSchema : resourceConfig.schema}
									/>
								}
								actions={<ShowActions edit={resourceConfig.edit} />}
							>
								<TabbedShowLayout>
									{DashAutoTabs(resourceConfig)}
									{resourceConfig.references &&
                                        resourceConfig.references.map((reference) => DashAutoReferenceTab(reference) )}
								</TabbedShowLayout>
							</Show>
						</ApplicationLayout>
					);
				}}
				/* @ts-ignore Known issue type mismatch */
				icon={resourceConfig.icon}
			/>
		</>
	);
};
export default LogResource;
