
import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import { FilterFormBase, ListContext } from 'react-admin';

// Safe hook that doesn't throw when context is missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSafeListContext = (): any => {
	const context = React.useContext(ListContext);
	return context ?? null;
};

import { IToolbarFilters } from './DashAutoListTopToolbar';

export interface IToolbarFiltersHandler {
	submit: () => void;
	reset: () => void;
}

//const DashAutoListFilterFormWithButton:React.ForwardRefRenderFunction<IToolbarFiltersHandler, IToolbarFilters> = (
//	props,
//  forwardedRef,
//) => {
//const DashAutoListFilterFormWithButton:React.FC<IToolbarFilters> = React.forwardRef((props ,forwardedRef: React.Ref<IToolbarFiltersHandler>)=> {

const DashAutoListFilterFormWithButton = React.forwardRef<IToolbarFiltersHandler, IToolbarFilters>((props, forwardedRef) => {

	const { filters, resourceConfig } = props;
	
	const listContext = useSafeListContext();
	const displayedFilters = listContext?.displayedFilters ?? [];
	const filterValues = listContext?.filterValues ?? {};
	const setFilters = listContext?.setFilters;

	const form = useForm({
		defaultValues: filterValues,
	});

	
	const onSubmit = (values) => {

		if (Object.keys(values).length > 0 && setFilters) {
			setFilters(values, displayedFilters);
		}
	};
	
	React.useEffect(() => {
		const keyDownHandler = event => {
			if (event.key === 'Enter') {
				event.preventDefault();
				form.handleSubmit(onSubmit)();
			}
		};
		document.addEventListener('keydown', keyDownHandler);
		return () => {
			document.removeEventListener('keydown', keyDownHandler);
		};
	}, []);
	const { reset } = form;
	const handleSubmit = form.handleSubmit(onSubmit);

	React.useImperativeHandle(forwardedRef, () => ({
		submit() {
			handleSubmit();
		},
		reset() {
			reset();
		},
	}));

	
	return (
        <FormProvider {...form}>
            <Box sx={{
                mb: 1
            }}>
				<FilterFormBase
					onSubmit={onSubmit}
					filters={filters}
					
				/>
				{ resourceConfig?.filterButtonPosition === 'filters-container' &&
				<Button className='toolbar-filters-filter-button' onClick={() => form.handleSubmit(onSubmit)()} variant={'contained'} color="primary" type="button">
                Filtrar
				</Button>}
			</Box>

        </FormProvider>
    );
  
});


export default DashAutoListFilterFormWithButton;