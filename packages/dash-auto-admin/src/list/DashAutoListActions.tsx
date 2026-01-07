import { useRefresh, useUnselectAll, ListContext } from 'react-admin';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import DashAutoListTopToolbar from './DashAutoListTopToolbar';
import { FC, useState, useEffect } from 'react';

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
	
	// Sanitize the resource model by replacing / with _ for localStorage compatibility
	const sanitizedModel = resourceConfig.model.replace(/\//g, '_');
	const storeKey = `filters.collapsed.${sanitizedModel}`;
	
	// Use localStorage directly instead of useStore (for Redux compatibility)
	const [expanded, setExpandedState] = useState<boolean>(() => {
		const stored = localStorage.getItem(storeKey);
		return stored !== null ? JSON.parse(stored) : false;
	});
	
	// Persist to localStorage whenever expanded changes
	useEffect(() => {
		localStorage.setItem(storeKey, JSON.stringify(expanded));
		console.log('💾 Persisting filter state:', { storeKey, expanded });
	}, [expanded, storeKey]);

	const setExpanded = (value: boolean) => {
		console.log('🔄 Setting expanded:', { storeKey, value });
		setExpandedState(value);
	};

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

	// Return null instead of empty JSX to avoid rendering empty elements
	if (!hasToolbarItems) return null;
	
	const toolbarComponent = (
		<DashAutoListTopToolbar
			resourceConfig={resourceConfig}
			autoFilters={autoFilters}
			filters={filters}
			countFilters={countFilters}
			expanded={expanded}
			setExpanded={setExpanded}
			filterCountToCollapse={FILTERS_COLLAPSE_COUNT}
			collapsedSize={FILTERS_COLLAPSE_SIZE}
		/>
	);

	return resourceConfig.customListActions ? (
		<resourceConfig.customListActions
			resourceConfig={resourceConfig}
			listProps={listProps}
		>
			{toolbarComponent}
		</resourceConfig.customListActions>
	) : (
		toolbarComponent
	);
};

export default DashAutoListActions;
