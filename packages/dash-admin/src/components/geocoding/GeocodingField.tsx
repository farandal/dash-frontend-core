import React, { useEffect, useState } from 'react';
import { TextInput, TextField as RATextField } from 'react-admin';
import { useRecordContext } from 'react-admin';
import PlacesAutocomplete, {
	geocodeByAddress,
} from 'react-places-autocomplete';
import { useController } from 'react-hook-form';

import { TextField as MUITextField } from '@mui/material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

const GeocodingFieldView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const record = useRecordContext();
	// return <>{record.geocoded_address}</>
	return (
		<RATextField
			label={attribute.label}
			source={attribute.attribute}
			options={attribute.fieldProps}
		/>
	);
};

const GeocodingFieldEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const [address, setAddress] = useState('');
	const record = useRecordContext();

	const searchOptions = {
		componentRestrictions: { country: 'CL' },
		/* @ts-ignore */
		location: new google.maps.LatLng(-34, 151),
		radius: 2000,
		types: ['address'],
	};

	/*const {field: { onChange, onBlur, name, value, ref } } = useController({
        name: attribute.listAttribute,
        // rules: { required: true },
        defaultValue: "",
    });*/

	const addressFormField = useController({
		name: attribute.attribute,
		// rules: { required: true },
		defaultValue: '',
	});

	const handleSelect = (address) => {
		// clearErrors(name)
		geocodeByAddress(address)
			.then((results) => {
				// if(!results[0].address_components[0].types.includes("street_number"))
				//     setError(name, {type: 'custom', message: 'No es una direccion valida'});
				// else
				//     setInputError(false)
				addressFormField.field.onChange(JSON.stringify(results[0]));
				setAddress(results[0].formatted_address);
			})
			.catch((error) => console.error('Error', error));
	};

	//const addressFormField = useController({ name: attribute.attribute });
	useEffect(() => {
		record?.geocoded_address && setAddress(record.geocoded_address);
	}, [record]);

	return (
		<PlacesAutocomplete
			value={address}
			onChange={(address) => setAddress(address)}
			onSelect={(selected) => handleSelect(selected)}
			searchOptions={searchOptions}
		>
			{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
				return (
					<div className='form__item'>
						<div className='form__item__icon'>
							{/*<TextInput
                        defaultValue={address}
                        label={attribute.label}
                        source={attribute.attribute}
                        options={{...attribute.fieldProps}}
                        {...getInputProps({})}
                    />*/}

							<MUITextField
								//id={attribute.attribute}
								label={attribute.label}
								{...addressFormField.field}
								{...getInputProps({
									placeholder: attribute.label,
									className: `input location-search-input`,
								})}
								options={{ ...attribute.fieldProps }}
								autoComplete='off'
								defaultValue={address}
								variant='filled'
							/>

							{/*
                    <input 
                        name={attribute.attribute} 
                       
                        value={address} 
                        {...getInputProps({
                            placeholder: attribute.label,
                            className: `input location-search-input`,
                        })}
                        autoComplete='off'
                    />*/}
						</div>
						<div className='autocomplete-dropdown-container'>
							{loading && <div>Cargando...</div>}
							{suggestions.map((suggestion, key) => {
								const className = suggestion.active
									? 'suggestion-item--active'
									: 'suggestion-item';
								// inline style for demonstration purpose
								const style = suggestion.active
									? { backgroundColor: '#fafafa', cursor: 'pointer' }
									: { backgroundColor: '#ffffff', cursor: 'pointer' };
								return (
									<div
										{...getSuggestionItemProps(suggestion, {
											className,
											style,
										})}
										key={key}
									>
										<span>{suggestion.description}</span>
									</div>
								);
							})}
						</div>
					</div>
				);
			}}
		</PlacesAutocomplete>
	);

	// <TextInput label={attribute.label} source={attribute.attribute} options={attribute.fieldProps} />
};

const GeocodingField = ({
	method,
	attribute,
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <GeocodingFieldEdit attribute={attribute} method={method} />;
		case 'view':
			return <GeocodingFieldView attribute={attribute} method={method} />;
	}
};

export default GeocodingField;
