import { useLocation } from 'react-router';
import { useListContext, useUnselectAll } from 'react-admin';

import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import useAutoAdminLoadingStateMediator from '../hooks/useAutoAdminLoadingStateMediator';
import { useEffect, useState } from 'react';
import AutoDataGrid from '../mui/AutoDataGrid';
import {
	CircularProgress,
} from '@mui/material';
import { IDashAutoList } from '../DashAutoList';

export interface IDashAutoAdminDataGrid {
	resourceConfig: IDashAutoAdminResourceConfig;
	dataGridProps?: IDashAutoList['dataGridProps'];
}

const DashAutoListDataGridWrapper: React.FC<IDashAutoAdminDataGrid> = ({
	resourceConfig,
	dataGridProps,
}) => {
	const { setFilters } = useListContext();
	const location = useLocation();
	const [currentLocation, setCurrentLocation] = useState(location.pathname);

	// isLoafing from useListContext should have been enough, nevertheless it doesn't work as needed.
	const [loading] = useAutoAdminLoadingStateMediator('getList');
	const unselectAll = useUnselectAll((resourceConfig.listProps?.storeKey || resourceConfig.model));
	const clearFilters = () => {

		unselectAll();
		setFilters({}, []);
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
			<AutoDataGrid resourceConfig={resourceConfig} {...dataGridProps} />
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