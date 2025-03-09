import FabButton from '../common/components/FabButton';
import {  SavedQueriesList, useListContext, useUnselectAll } from 'react-admin/src';

import {
	TopToolbar,
	FilterForm,
} from 'react-admin/src';


import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import { FC, ReactNode } from 'react';
import {
	Box,
	Button,
	Collapse,
	Fab,
	Grid,
} from '@mui/material';


import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DashAutoListFilterFormWithButton, { IToolbarFiltersHandler } from './DashAutoListFilterFormWithButton';
import React from 'react';

import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Search from '@mui/icons-material/Search';
import { ToolbarCreateButton, ToolbarExportButton } from '../toolbar/buttons/ToolbarButtons';

export interface IToolbarFilters {
	resourceConfig: IDashAutoAdminResourceConfig;
	filters: any;
	filterButtonText?: string;
}

/*const ToolbarFilters:React.ForwardRefRenderFunction<IToolbarFiltersHandler, IToolbarFilters> = (
  props,
  forwardedRef,
) => {
*/

//const ToolbarFilters:React.FC<IToolbarFilters> = React.forwardRef((props ,forwardedRef: React.Ref<IToolbarFiltersHandler>)=> {
const ToolbarFilters = React.forwardRef<IToolbarFiltersHandler, IToolbarFilters>((props, forwardedRef) => {
	const handleSubmit = () => {
		console.error('handleSubmit at ToolbarFilters not implemented');
	};

	const reset = () => {
		console.error('handleSubmit at ToolbarFilters not implemented');
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

}) as  React.ForwardRefRenderFunction<IToolbarFiltersHandler, IToolbarFilters>;

export interface IDashAutoListTopToolbar {
	resourceConfig: IDashAutoAdminResourceConfig,
	autoFilters: JSX.Element[],
	filters: ReactNode[],
	countFilters: number,
	collapsed: boolean,
	setCollapsed: any,
	filterCountToCollapse?: number,
	collapsedSize?: number | string,
}

const DashAutoListTopToolbar:FC<IDashAutoListTopToolbar> = (props) => {

	const { resourceConfig, autoFilters, filters, countFilters, collapsed, setCollapsed, filterCountToCollapse = 5, collapsedSize = '60px' } = props;
	
	const { setFilters } = useListContext();
	const unselectAll = useUnselectAll((resourceConfig.listProps?.storeKey || resourceConfig.model) );
	

	const FilterComponent = resourceConfig.FilterFormComponent ? resourceConfig.FilterFormComponent : (resourceConfig.filterWithSubmit === true ? DashAutoListFilterFormWithButton : ToolbarFilters);

	type FilterComponentHandle = React.ElementRef<React.ForwardRefExoticComponent<IToolbarFilters & React.RefAttributes<IToolbarFiltersHandler>>>;

	const ref = React.useRef<FilterComponentHandle>(); 

	const clearFilters = () => {
		unselectAll();
		setFilters({}, []);
		ref.current.reset();
	};

	return (
		<>
			{countFilters && autoFilters ? (
				<FabButton
					onClick={() => clearFilters()}
					size='small'
					aria-label='refresh'
					color='primary'
					icon={<FilterAltOffIcon />}
					tooltip={'Borrar filtros'}
				/>
			) : <></>}

			{countFilters > (Number(filterCountToCollapse) || 5) ? (
				<Fab
					size='small'
					aria-label='collpase'
					color='primary'
					onClick={() => setCollapsed(!collapsed)}
					style={{
						position: 'absolute',
					}}
					className='toolbar-collapse-button'
				>
					{collapsed ? (
						<KeyboardArrowUp />
					) : (
						<KeyboardArrowDown />
					)}
				</Fab>
			) : <></>}

			<TopToolbar >

				<Grid container spacing={0}   >
				
					{countFilters ? <Grid item xs={12}>
						<Collapse
							className='toolbar-collapse'
							orientation={'vertical'}
							collapsedSize={collapsedSize}
							in={collapsed}
							timeout='auto'
						>
							<Box className='toolbar-filters'>
								<FilterComponent ref={ref} resourceConfig={resourceConfig} filters={filters} />
							</Box>
						</Collapse>
					</Grid> : <></>}
					<Grid sx={{
						display: 'flex',
						justifyContent: 'space-between',
					}} item xs={12}>

						<Box
							sx={{
								display: 'flex',
								justifyContent: 'flex-start',
								flexWrap: 'wrap',
							}}
							className='toolbar-buttons'
						>
						
							<ToolbarCreateButton mode={'create'} resourceConfig={resourceConfig}/>
							<ToolbarExportButton mode={'create'} resourceConfig={resourceConfig}/>

							{typeof resourceConfig.customToolbarElements === 'function'
								? resourceConfig.customToolbarElements(filters)
								: resourceConfig.customToolbarElements}
							{/*<SavedQueriesList /> */}

						</Box>

						<Box
							sx={{
								display: 'flex',
								justifyContent: 'flex-end',
								flexWrap: 'wrap',
							}}
							className='toolbar-actions'
						>

							{typeof resourceConfig.customToolbarActions === 'function'
								? resourceConfig.customToolbarActions(filters)
								: resourceConfig.customToolbarActions}
							
							{/* TODO: not tested */}
							{!!resourceConfig.showSavedQueries && <SavedQueriesList /> }

							{ countFilters && resourceConfig?.filterWithSubmit === true && resourceConfig?.filterButtonPosition !== 'filters-container' ?
								<Button 
									endIcon={<Search/>}
									variant={'contained'}
									onClick={() => { 
										ref.current.submit();
									}}>Filtrar</Button> : <></>}
						</Box>
						
					</Grid>
				</Grid>
			</TopToolbar>
			
			
		</>
	);
};


export default DashAutoListTopToolbar;