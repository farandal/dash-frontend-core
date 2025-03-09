import {
	Button,
	DialogActions,
	DialogContent,
	TextareaAutosize,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import { useRecordContext } from 'react-admin';
import useAxios from '../../hooks/axios';
import { saveAs } from 'file-saver';
import { ILog, ILogTxtFileComponent } from '../../interfaces/Log';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

export const LogTxtFileComponent: React.FC<ILogTxtFileComponent> = ({
	log,
}) => {
	const { axios } = useAxios();

	const [logFile, setlogFile] = useState<Blob>(null);
	const [logContent, setlogContent] = useState<string>(null);

	const downloadLog = async () => {
		let fileName = log.filepath.split('/')[log.filepath.split('/').length - 1];
		saveAs(logFile, fileName);
	};
	const preLoadLog = async (logID) => {
		if (log?.filepath) {
			const { data: file } = await axios.get(`/log/${log.id}/download`, {
				responseType: 'blob',
			});

			let fileContent = await file.text();

			setlogFile(file);
			setlogContent(fileContent);
		} else {
			setlogContent('Proceso completado correctamente');
		}
	};

	useEffect(() => {
		preLoadLog(log);
	}, []);

	return (
		<DialogContent>
			<TextareaAutosize
				style={{ width: '100%' }}
				maxRows={50}
				defaultValue={logContent !== '' ? logContent : ' Cargando... '}
			/>
			{log?.filepath && (
				<DialogActions>
					<Button onClick={() => downloadLog()}>Descargar</Button>{' '}
				</DialogActions>
			)}
		</DialogContent>
	);
};

const LogTxtFileEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const log: ILog = useRecordContext();
	return <LogTxtFileComponent log={log} />;
};

const LogTxtFileView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	const log: ILog = useRecordContext();
	return <LogTxtFileComponent log={log} />;
};

const LogTxtFile = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <LogTxtFileEdit attribute={attribute} method={method} />;
		case 'view':
			return <LogTxtFileView attribute={attribute} method={method} />;
	}
};

export default LogTxtFile;
