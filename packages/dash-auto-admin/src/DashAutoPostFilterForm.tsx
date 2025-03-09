import { useForm, FormProvider } from 'react-hook-form';
import { useListContext } from 'react-admin';

const DashAutoPostFilterForm = (filters: any) => {
	const { filterValues, displayedFilters, setFilters } = useListContext();

	const form = useForm({
		defaultValues: filterValues,
	});

	const onSubmit = (values) => {
		if (Object.keys(values).length > 0) {
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
