import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useRecordContext } from 'react-admin';
import { Loading } from 'react-admin';
import { initAxios } from '../../hooks/axios';
import { saveAs } from 'file-saver';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

const PDFViewerView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const record = useRecordContext();

	const axios = initAxios();

	const [PDFFile, setPDFFile] = useState<string>(null);

	const filePath =
		record && record[attribute.attribute] ? record[attribute.attribute] : null;
	const fileName = 'nota-venta-' + record.id + '.pdf';

	useEffect(() => {
		record && record[attribute.attribute] && displayDocument();
	}, [record]);

	const displayDocument = async () => {
		const { data } = await axios.get(filePath, {
			responseType: 'blob',
		});

		const file = new Blob([data], {
			type: 'application/pdf',
		});

		const fileURL = URL.createObjectURL(file);

		setPDFFile(fileURL);
	};

	const downloadDocument = async () => {
		const { data } = await axios.get(filePath, {
			responseType: 'blob',
		});

		const file = new Blob([data], {
			type: '',
		});

		saveAs(file, fileName);
	};

	return (
		<>
			{PDFFile ? (
				<div>
					<object
						className='embed-pdf'
						data={PDFFile}
						type='application/pdf'
						style={{ minHeight: 800, minWidth: 600 }}
					>
						<embed src={PDFFile} type='application/pdf' />
					</object>
					<hr />
					<Button onClick={downloadDocument}>Descargar</Button>
				</div>
			) : (
				<Loading />
			)}
		</>
	);
};

const PDFViewer = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <>edit</>;
		case 'view':
			return <PDFViewerView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
	}
};

export default PDFViewer;
