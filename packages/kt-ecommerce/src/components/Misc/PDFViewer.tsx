import { Badge, Button, Chip, FormLabel, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import React, { FC, Fragment, ReactNode, useEffect, useState } from 'react'
import { useGetList } from 'react-admin';
import { NumberInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useController, useFieldArray, useForm } from 'react-hook-form';

import EditableCellOnFocus, { ColumnTypes, EditableRow } from '../DataTable/EditableCellOnFocus';
import * as Icons from '@mui/icons-material';
import { useGetOne } from 'react-admin';
import { Loading } from 'react-admin';
import { LinearProgress } from 'react-admin';

import { saveAs } from 'file-saver';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useAxios } from 'dash-axios-hook';


const PDFViewerView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const record = useRecordContext();

  const axios = useAxios();

  const [PDFFile, setPDFFile] = useState<string>(
    null
  );

  const filePath = record && record[attribute.attribute] ? record[attribute.attribute] : null;
  const fileName = "nota-venta-" + record.id + ".pdf";

  useEffect(() => {
    record && record[attribute.attribute] && displayDocument();
  }, [record])

  const displayDocument = async () => {

    const { data } = await axios.get(
      filePath,
      {
        responseType: 'blob',
      }
    );

    const file = new Blob([data], {
      type: 'application/pdf',
    });

    const fileURL = URL.createObjectURL(file);

    setPDFFile(fileURL);

  };

  const downloadDocument = async () => {

    const { data } = await axios.get(
      filePath,
      {
        responseType: 'blob',
      }
    );

    const file = new Blob([data], {
      type: '',
    });

    saveAs(file, fileName);

  };

  return <>

    {PDFFile ? <div><object
      className='embed-pdf'
      data={PDFFile}
      type='application/pdf'
      style={{ minHeight: 800, minWidth: 600 }}
    >
      <embed
        src={PDFFile}
        type='application/pdf'
      />
    </object>
      <hr />
      <Button onClick={downloadDocument} >Descargar</Button>
    </div>



      : <Loading />}

  </>

}

const PDFViewer = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <>edit</>
    case "view":
      return <PDFViewerView attribute={attribute} method={method} />
  }
}

export default PDFViewer;
