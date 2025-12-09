import React, { FC, useImperativeHandle } from 'react'

import { Row, Col, Steps } from "antd";
const Step = Steps.Step;

import { useController } from 'react-hook-form';
import { IProductTemplate } from '../../interfaces/Product';
import { Chip, Paper, Stack, Switch } from '@mui/material';
import { useDialog } from "../../components/Dialog/DialogService";
import MUISimpleJsonTable from '../MuiSimpleJsonTable';


export type TProductImportationFormHandlers = {
  getOutput: () => any
};

export interface IProductImportationFormProps {
  selectedTemplate: IProductTemplate
  response?: any
  children?: React.ReactNode
  [x: string]: any
}

export interface IImportPReviewOutput {
  totalProducts: number
  validProducts: number
  invalidProducts: number
  errorsCount: number
  errors : string[]
}

const ProductImportationForm = React.forwardRef<
  TProductImportationFormHandlers,
  IProductImportationFormProps
>(({ selectedTemplate,preview,response , ...props }, ref) => {

  const createPreviewField = useController({ name: 'preview_mode' });
  const dialog = useDialog();

  useImperativeHandle(ref, () => {
    return {
      getOutput: getOutput
    };
  });

  const getOutput = (): any => {
    return {};
  };

  const ErrorComponent:FC<{output:IImportPReviewOutput}> = ({output,...props}) => {
      return (
        <> 

        <MUISimpleJsonTable tableData={output} include={["totalProducts", "validProducts", "invalidProducts", "errorsCount"]} vertical={true} />

        <Paper elevation={3} >
          <Stack spacing={2}>
            {output.errors.map((error:string) => <Chip label={error} color="primary" />  )}
          </Stack>
        </Paper>
        </>
      );
  }

  return (
    <>

      <Row gutter={16}>
        <Col span={8} style={{ display: "flex", justifyContent: "space-between" }} >
        
          <section>
            <label>Modo Preview</label>
            <Switch defaultChecked {...createPreviewField.field} />
          </section>

          <section>
                {response && response.hasOwnProperty("errors") ? <ErrorComponent output={response} /> : <>{JSON.stringify(response)}</>}
          </section>
          
  
        </Col>
      </Row>
    </>
  );
});


export default ProductImportationForm;