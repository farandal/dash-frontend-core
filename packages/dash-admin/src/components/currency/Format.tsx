import React, { useEffect, useState } from 'react';
import { useRecordContext } from 'react-admin';
import { TextField } from '@mui/material';
import { useWatch } from 'react-hook-form';
import numeral from 'numeral';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

interface IData {
	[key: string]: any;
}

const ComponentView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const data: IData = useRecordContext();

	return <></>;
};

const ComponentEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const [rawText, setRawText] = useState('');
	const [formattedNumber, setFormattedNumber] = useState('0');
	const data: IData = useRecordContext();

	const format = useWatch({ name: 'format' });
	const symbol = useWatch({ name: 'symbol' });

	const formatNumber = (value) => {
		try {
			setRawText(value);
			const vall = !format ? value : numeral(value).format(format);
			setFormattedNumber(symbol ? symbol + vall : vall);
		} catch (error) {
			console.log(error);
			return 0;
		}
	};

	useEffect(() => {
		formatNumber(rawText);
	}, [format, symbol]);

	return (
		<>
			<TextField
				label='Probar formateo'
				value={rawText}
				onChange={({ target: { value } }) => formatNumber(value)}
			/>
			<TextField
				label='Valor formateado'
				value={formattedNumber}
				inputProps={{ readOnly: true }}
			/>
		</>
	);
};

const FormatCurrency = ({
	method,
	attribute,
	resourceConfig,
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <ComponentEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <ComponentView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
	}
};

export default FormatCurrency;
