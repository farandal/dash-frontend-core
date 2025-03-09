import { useStore } from 'react-admin';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import DashAutoListTopToolbar from './DashAutoListTopToolbar';
import { FC } from 'react';

/* TODO: currently restricted to vite env variables */
export const getEnv = (key: string, defaultValue?:any) => {
	/* @ts-ignore Expected , access to process */
	return process.env['VITE_' + key] || (defaultValue || null);
};

const FILTERS_COLLAPSE_COUNT = getEnv('FILTERS_COLLAPSE_COUNT');
const FILTERS_COLLAPSE_SIZE = getEnv('FILTERS_COLLAPSE_SIZE');

export interface IDashAutoListActions {
	resourceConfig: IDashAutoAdminResourceConfig;
	filters: any;
	autoFilters: any;
	listProps: any;
}

const DashAutoListActions: FC<IDashAutoListActions> = (props) => {
	const { filters, resourceConfig, autoFilters, listProps } = props;
	//const { data, isLoading } = useListContext();
	//const [collapsed, setCollapsed] = useState<boolean>(false);
	const [collapsed, setCollapsed] = useStore('DashAutoList.collapsed', true);

	//const [countFilters] = useState(resourceConfig.referenceFilters.length || 0);

	const countFilters = resourceConfig.referenceFilters && resourceConfig.referenceFilters.length ? resourceConfig.referenceFilters.length : 0;

	let hasToolbarItems: boolean =
		filters ||
		resourceConfig.create ||
		resourceConfig.exporter ||
		resourceConfig.customToolbarElements
			? true
			: false;

	if (resourceConfig?.toolbar === false) {
		hasToolbarItems = false;
	}



	/*
		https://marmelab.com/react-admin/FilteringTutorial.html#custom-filter-form
		TODO Tip: No need to pass any filters to the list anymore, as the <PostFilterForm> component will display them.
	*/
	//return <></>;
	if (!hasToolbarItems) return <></>;
	
	return resourceConfig.customListActions ? 
	
		<resourceConfig.customListActions
			resourceConfig={resourceConfig}
			listProps={listProps}
			//isLoading={isLoading}
			//data={data}
		>
			<DashAutoListTopToolbar
				resourceConfig={resourceConfig}
				autoFilters={autoFilters}
				filters={filters}
				countFilters={countFilters}
				collapsed={collapsed}
				setCollapsed={setCollapsed}
				filterCountToCollapse={FILTERS_COLLAPSE_COUNT}
				collapsedSize={FILTERS_COLLAPSE_SIZE}
			/>
		</resourceConfig.customListActions>
	
		:
	
		<DashAutoListTopToolbar
			resourceConfig={resourceConfig}
			autoFilters={autoFilters}
			filters={filters}
			countFilters={countFilters}
			collapsed={collapsed}
			setCollapsed={setCollapsed}
			filterCountToCollapse={FILTERS_COLLAPSE_COUNT}
			collapsedSize={FILTERS_COLLAPSE_SIZE}
		/>;

};

export default DashAutoListActions;
