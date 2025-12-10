import { Button, DialogActions, DialogContent, FormControlLabel, Switch, TextareaAutosize } from '@mui/material';


import React, { Fragment, useEffect, useState } from 'react'
import { TextInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useGetList } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { saveAs } from 'file-saver';


import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { ILog, ILogTxtFileComponent } from 'dash-admin/src/interfaces/Log';

export const LogTxtFileComponent: React.FC<ILogTxtFileComponent> = ({ log }) => {

  const axios = useAxios();

  const [logFile, setlogFile] = useState<Blob>(null);
  const [logContent, setlogContent] = useState<string>(null);

  const downloadLog = async () => {

    let fileName = log.filepath.split("/")[log.filepath.split("/").length - 1]
    saveAs(logFile, fileName);

  }
  const preLoadLog = async (logID) => {

    if (log?.filepath) {
      const { data: file } = await axios.get(
        `/log/${log.id}/download`
        ,
        {
          responseType: 'blob',
        }
      );

      let fileContent = await file.text();

      setlogFile(file);
      setlogContent(fileContent);
    } else {
      setlogContent("Proceso completado correctamente");
    }

  };

  /*useEffect(() => {
    preLoadLog(log);
  }, [])*/

  return (

    <DialogContent>
      <TextareaAutosize
        style={{ width: "100%" }}

        maxRows={50}
        defaultValue={logContent !== "" ? logContent : " Cargando... "}
      />
      {log?.filepath && <DialogActions><Button onClick={() => downloadLog()}>Descargar</Button> </DialogActions>}
    </DialogContent>
  )

}

const LogTxtFileEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const log: ILog = useRecordContext();
  return (
    <LogTxtFileComponent log={log} />
  )

}

const LogTxtFileView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const log: ILog = useRecordContext();
  return (
    <LogTxtFileComponent log={log} />
  )
}


const LogTxtFile = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <LogTxtFileEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <LogTxtFileView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}


export default LogTxtFile;
