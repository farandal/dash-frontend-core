import { CircularProgress } from "@mui/material";
import { IDashAutoAdminDataGrid } from "dash-auto-admin";
import useAutoAdminLoadingStateMediator from "dash-auto-admin/hooks/useAutoAdminLoadingStateMediator";
import AutoDataGrid from "dash-auto-admin/mui/AutoDataGrid";
import { useState, useEffect } from "react";
import { useListContext, useUnselectAll } from "react-admin";
import { useLocation } from "react-router";

const DashAutoListDataGridWrapper: React.FC<IDashAutoAdminDataGrid> = ({
    resourceConfig,
    dataGridProps,
}) => {

    const { setFilters } = useListContext();
    const location = useLocation();
    const [currentLocation, setCurrentLocation] = useState(location.pathname);

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

};

export default DashAutoListDataGridWrapper;