import { useForm, FormProvider } from 'react-hook-form';
import { ListContext } from 'react-admin';
import { useContext } from 'react';

// Safe hook that doesn't throw when context is missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSafeListContext = (): any => {
	const context = useContext(ListContext);
	return context ?? null;
};

const DashAutoPostFilterForm = (filters: any) => {
	const listContext = useSafeListContext();
	const filterValues = listContext?.filterValues ?? {};
	const displayedFilters = listContext?.displayedFilters ?? [];
	const setFilters = listContext?.setFilters;

	const form = useForm({
		defaultValues: filterValues,
	});

	const onSubmit = (values) => {
		if (Object.keys(values).length > 0 && setFilters) {
			setFilters(values, displayedFilters);
		}
	};

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>{filters}</form>
		</FormProvider>
	);
};

export default DashAutoPostFilterForm;
