import FabButton from '../common/components/FabButton';
import { SavedQueriesList, useListContext, useRefresh, useUnselectAll } from 'react-admin/src';
import { TopToolbar, FilterForm } from 'react-admin/src';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import { FC, ReactNode } from 'react';
import { Box, Button, Collapse, Fab, Grid, Portal } from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DashAutoListFilterFormWithButton, { IToolbarFiltersHandler } from './DashAutoListFilterFormWithButton';
import React from 'react';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Search from '@mui/icons-material/Search';
import { ToolbarCreateButton, ToolbarExportButton } from '../toolbar/buttons/ToolbarButtons';
import { Refresh } from '@mui/icons-material';

export interface IToolbarFilters {
	resourceConfig: IDashAutoAdminResourceConfig;
	filters: any;
	filterButtonText?: string;
}

const ToolbarFilters = React.forwardRef<IToolbarFiltersHandler, IToolbarFilters>((props, forwardedRef) => {
	const handleSubmit = () => {
		console.error('handleSubmit at ToolbarFilters not implemented');
	};

	const reset = () => {
		console.error('reset at ToolbarFilters not implemented');
	};

	React.useImperativeHandle(forwardedRef, () => ({
		submit() {
			handleSubmit();
		},
		reset() {
			reset();
		},
	}));

	const { resourceConfig, filters } = props;
	return resourceConfig.hideDefaultFilters !== true ? <FilterForm filters={filters} /> : <></>;
});

// Add display name for debugging
ToolbarFilters.displayName = 'ToolbarFilters';

export interface IDashAutoListTopToolbar {
	resourceConfig: IDashAutoAdminResourceConfig,
	autoFilters: JSX.Element[],
	filters: ReactNode[],
	countFilters: number,
	collapsed: boolean,
	setCollapsed: (collapsed: boolean) => void, // Better typing
	filterCountToCollapse?: number,
	collapsedSize?: number | string,
}

const DashAutoListTopToolbar: FC<IDashAutoListTopToolbar> = (props) => {
	const { 
		resourceConfig, 
		autoFilters, 
		filters, 
		countFilters, 
		collapsed, 
		setCollapsed, 
		filterCountToCollapse = 5, 
		collapsedSize = '60px' 
	} = props;
	
	const { setFilters } = useListContext();
	const unselectAll = useUnselectAll(resourceConfig.listProps?.storeKey || resourceConfig.model);
	
	const FilterComponent = resourceConfig.FilterFormComponent 
		? resourceConfig.FilterFormComponent 
		: (resourceConfig.filterWithSubmit === true ? DashAutoListFilterFormWithButton : ToolbarFilters);

	type FilterComponentHandle = React.ElementRef<React.ForwardRefExoticComponent<IToolbarFilters & React.RefAttributes<IToolbarFiltersHandler>>>;

	const ref = React.useRef<FilterComponentHandle>(null); 
    const refresh = useRefresh();
	const clearFilters = () => {
		unselectAll();
		setFilters({}, []);
		ref.current?.reset();
	};
    
    const refreshList = () => {
        refresh();
    };

	return  <div>



            <div
									style={{
										display: 'flex',
										justifyContent: 'flex-start',
										flexWrap: 'wrap',
									}}
									className='toolbar-actions'
								>
	                                <ToolbarCreateButton mode='create' resourceConfig={resourceConfig}/>
									<ToolbarExportButton mode='create' resourceConfig={resourceConfig}/>

									{typeof resourceConfig.customToolbarElements === 'function'
										? resourceConfig.customToolbarElements(filters)
										: resourceConfig.customToolbarElements}

									{typeof resourceConfig.customToolbarActions === 'function'
										? resourceConfig.customToolbarActions(filters)
										: resourceConfig.customToolbarActions}
							
									{!!resourceConfig.showSavedQueries && <SavedQueriesList />}

						
								</div>



						
							{countFilters ? (
								<div>
									<Collapse
										className='toolbar-collapse'
										orientation='vertical'
										collapsedSize={collapsedSize}
										in={collapsed}
										timeout='auto'
									>
										<div className='toolbar-filters'>
											<FilterComponent ref={ref} resourceConfig={resourceConfig} filters={filters} />
										</div>
									</Collapse>
								</div>
							) : null}
					
							
						
								
	                    

									{countFilters && resourceConfig?.filterWithSubmit === true && resourceConfig?.filterButtonPosition !== 'filters-container' &&
                                      <div
									style={{
										display: 'flex',
										justifyContent: 'flex-end',
										flexWrap: 'wrap',
									}}
									className='toolbar-buttons'
								>
										<Button 
											endIcon={<Search/>}
											variant='contained'
											onClick={() => { 
												ref.current?.submit();
											}}
										>
											Filtrar
										</Button>
									</div>}
							


        <Box sx={{ 
				position: 'absolute',
				top: 0,
				right: 0,
				display: 'flex',
				gap: 1,
                padding: 1
			}}>
            <FabButton
					onClick={refreshList}
					size='small'
					aria-label='refresh'
					color='primary'
					icon={<Refresh sx={{ fontSize: '1rem' }} />}
					tooltip={'Refrescar'}
                    style={{
						width: '30px',
						height: '30px',
						minHeight: '30px'
					}}
				/>
            {countFilters && autoFilters ? (
				<FabButton
					onClick={clearFilters}
					size='small'
					aria-label='refresh'
					color='primary'
					icon={<FilterAltOffIcon sx={{ fontSize: '1rem' }} />}
					tooltip={'Borrar filtros'}
                    style={{
						width: '30px',
						height: '30px',
						minHeight: '30px'
					}}
				/>
			) : null}

			{countFilters/*> (Number(filterCountToCollapse) || 3)*/ ? (
				<Fab
					size='small'
					aria-label='collapse'
					color='primary'
					onClick={() => setCollapsed(!collapsed)}
					style={{
						width: '30px',
						height: '30px',
						minHeight: '30px'
					}}
					className='toolbar-collapse-button'
				>
					{collapsed ? <KeyboardArrowUp sx={{ fontSize: '1rem' }} /> : <KeyboardArrowDown sx={{ fontSize: '1rem' }} />}
				</Fab>
			) : null}




            </Box>	

						
					</div>
	
};

export default DashAutoListTopToolbar;
