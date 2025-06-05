import {
  Button,
  DialogActions,
  DialogContent,
  TextareaAutosize,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import useAxios from '../../hooks/axios';
import { saveAs } from 'file-saver';

interface LogFileByIdProps {
  id: string | number;
}

export const LogFileById: React.FC<LogFileByIdProps> = ({ id }) => {
  const { axios } = useAxios();
 
  const [logFile, setLogFile] = useState<Blob>(null);
  const [logContent, setLogContent] = useState<string>(null);
  const [filepath, setFilepath] = useState<string>(null);

  const downloadLog = async () => {
    if (filepath) {
      let fileName = filepath.split('/')[filepath.split('/').length - 1];
      saveAs(logFile, fileName);
    }
  };

  const preLoadLog = async () => {
    try {
      const { data: file } = await axios.get(`/system/log/${id}/download`, {
        responseType: 'blob',
      });

      const { data: logData } = await axios.get(`/system/log/${id}`);
      setFilepath(logData.filepath);

      let fileContent = await file.text();

      setLogFile(file);
      setLogContent(fileContent);
    } catch (error) {
      setLogContent('Error al cargar el archivo');
    }
  };

  useEffect(() => {
    preLoadLog();
  }, [id]);

  return (
    <DialogContent>
      <TextareaAutosize
        style={{ width: '100%' }}
        maxRows={50}
        defaultValue={logContent !== '' ? logContent : ' Cargando... '}
      />
      {filepath && (
        <DialogActions>
          <Button onClick={downloadLog}>Descargar</Button>
        </DialogActions>
      )}
    </DialogContent>
  );
};

export default LogFileById;