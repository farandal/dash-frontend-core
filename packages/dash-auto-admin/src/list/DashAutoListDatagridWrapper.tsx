import { useLocation } from 'react-router';
import { useUnselectAll, ListContext } from 'react-admin';

import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import useAutoAdminLoadingStateMediator from '../hooks/useAutoAdminLoadingStateMediator';
import { useContext, useEffect, useState } from 'react';
import AutoDataGrid from '../mui/AutoDataGrid';
import {
	CircularProgress,
} from '@mui/material';
import { IDashAutoList } from '../DashAutoList';

// Safe hook that doesn't throw when context is missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSafeListContext = (): any => {
	const context = useContext(ListContext);
	return context ?? null;
};

export interface IDashAutoAdminDataGrid {
	resourceConfig: IDashAutoAdminResourceConfig;
	dataGridProps?: IDashAutoList['dataGridProps'];
	locale?: string;
}

const DashAutoListDataGridWrapper: React.FC<IDashAutoAdminDataGrid> = ({
	resourceConfig,
	dataGridProps,
	locale,
}) => {
	const listContext = useSafeListContext();
	const setFilters = listContext?.setFilters;
	const location = useLocation();
	const [currentLocation, setCurrentLocation] = useState(location.pathname);

	// isLoafing from useListContext should have been enough, nevertheless it doesn't work as needed.
	const [loading] = useAutoAdminLoadingStateMediator('getList');
	const unselectAll = useUnselectAll((resourceConfig.listProps?.storeKey || resourceConfig.model));
	const clearFilters = () => {

		unselectAll();
		if (setFilters) {
			setFilters({}, []);
		}
	};

	useEffect(() => {
		if (currentLocation !== location.pathname) {
			if (resourceConfig?.resetFiltersOnLocationChange === true) {
				console.info('Resetting Filters on Location change');
				clearFilters();
			}
			setCurrentLocation(location.pathname);
		}
	}, [location, currentLocation]);

	return (
		<div className={loading ? 'loading-overlay' : 'default-overlay'}>
			{loading && <CircularProgress className={'datagrid-olverlay-loading'} />}
			<AutoDataGrid resourceConfig={resourceConfig} {...dataGridProps} locale={locale} />
		</div>
	);

	/*return (
    <div className={ "loading-overlay"}>
      
        <CircularProgress className={"datagrid-olverlay-loading"} />
    
      <AutoDataGrid resourceConfig={resourceConfig} {...dataGridProps} />
    </div>
  );*/
};

export default DashAutoListDataGridWrapper;