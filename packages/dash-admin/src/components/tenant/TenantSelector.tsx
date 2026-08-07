import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useController } from 'react-hook-form';
import { useGetList } from 'react-admin';
import useAxios from '../../hooks/axios';
import { Tenant } from '../../interfaces/Tenant';
import { Loading } from 'react-admin';
import { AutocompleteInput } from 'react-admin';
import { ReferenceInput } from 'react-admin';

export type TTenantSelectorHandlers = {
	getSelectedTenant: () => Tenant;
};

export interface ITenantSelectorProps {
	selectedTenantInput?: string;
	[x: string]: any;
}

const TenantSelector = React.forwardRef<
	TTenantSelectorHandlers,
	ITenantSelectorProps
>(({ selectedTenantInput, ...props }, ref) => {
	const { axios } = useAxios();
	const [q, setQ] = useState('');
	//const [selectedTenant,setSelectedTenant] = useState<string>(selectedTenantInput ?? null);
	const [tenant, setTenant] = useState<Tenant>(null);

	const selectLabel = 'Seleccionar Cliente';
	const tenantField = useController({ name: 'tenant' });

	useImperativeHandle(ref, () => {
		return {
			getSelectedTenant: getSelectedTenant,
		};
	});

	const getSelectedTenant = () => {
		return tenant;
	};

	useEffect(() => {
		const getOne = async (_selectedTenantInput: string) => {
			const { data } = await axios.get(`tenant/${_selectedTenantInput}`);
			setTenant(data);
		};
		if (selectedTenantInput && selectedTenantInput !== 'null') {
			// porque queda guardado null en local storage como string
			//
			getOne(selectedTenantInput);
		}
	}, [selectedTenantInput]);

	const {
		data: tenants,
		total,
		isLoading,
		error: tenantsError,
	} = useGetList('tenant', {
		//pagination: false,
		filter: { q: q },
	});

	const handleSearch = (search) => {
		setQ(search);
	};

	const autocompleteOptionChange = (event: any, value: Tenant) => {
		//setSelectedTenant(value);
		tenantField.field.onChange(value);
	};

	const [open, setOpen] = React.useState(false);

	if (isLoading) {
		return <Loading />;
	}

	return (
        <>Cliente impersonado: {selectedTenantInput}
            <Autocomplete
				fullWidth
				loading={isLoading && open}
				sx={{ width: 300 }}
				options={tenants ? (tenants as Tenant[]) : []}
				open={open}
				onOpen={() => {
					setOpen(true);
				}}
				onClose={() => {
					setOpen(false);
				}}
				autoHighlight
				getOptionLabel={(option: Tenant) => option.name}
				renderOption={(props, option: Tenant) => (
					<Box
						component='li'
						sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
						{...props}
					>
						{option.name}
					</Box>
				)}
				onChange={autocompleteOptionChange}
				//onChange={handleSearch}
				defaultValue={tenant}
				renderInput={(params) => (
					<TextField
						fullWidth
						{...params}
						label={selectLabel}
						variant='outlined'
						onChange={(ev) => {
							// dont fire API if the user delete or not entered anything
							if (ev.target.value !== '' || ev.target.value !== null) {
								handleSearch(ev.target.value);
							}
						}}
						slotProps={{
                            ...params.slotProps,

                            input: {
                                ...params.slotProps.input,
                                autoComplete: 'new-password',
                                endAdornment: (
                                    <>
                                        {isLoading ? (
                                            <CircularProgress color='inherit' size={20} />
                                        ) : null}
                                        {params.slotProps.input.endAdornment}
                                    </>
                                ),
                            }
                        }}
					/>
				)}
			/>
        </>
    );
});

export default TenantSelector;
