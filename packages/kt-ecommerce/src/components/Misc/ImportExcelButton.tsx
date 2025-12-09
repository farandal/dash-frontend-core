import React from "react";
import { Button as RAButton } from "react-admin";
import { Tooltip } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import {useRefresh, useNotify, useDataProvider, useResourceContext} from "react-admin";

import {SimpleLogger} from "dash-auto-admin/src/utils/SimpleLogger";
import { DataProvider } from "ra-core";

export type PrecommitCallback = (action: "upload", values: any) => Promise<any>;
export type ErrorCallback = (error: any) => void;

let logger = new SimpleLogger("uploader", false);

export async function upload(
  logging: boolean,
  disableCreateMany: boolean | undefined,
  dataProvider: DataProvider,
  resource: string,
  values: any,
  preCommitCallback?: PrecommitCallback,
  postCommitCallback?: ErrorCallback
) {


  const parsedValues = preCommitCallback
    ? await preCommitCallback("upload", values)
    : values;
  
    const response = await createInDataProvider(
    logging,
    !!disableCreateMany,
    dataProvider,
    resource,
    parsedValues,
    "import"
  );

  if (postCommitCallback) {
    postCommitCallback(response);
  }


/*
  const shouldReject =
    !postCommitCallback && response.some((r) => !r.success);

  if (shouldReject) {
    return Promise.reject(Responses.map((r) => r.response));
  }
*/

}

interface Response {
  value: any;
  success: boolean;
  err?: any;
  response?: any;
}

export async function createInDataProvider(
  logging: boolean,
  disableCreateMany: boolean,
  dataProvider: DataProvider,
  resource: string,
  values: any[],
  dataProviderFunction?: string,
): Promise<Response> {
  logger.setEnabled(logging);
  logger.log("createInDataProvider", { dataProvider, dataProviderFunction, resource, values });
  let _response:Response = { success: false, response: null, value: values}
  /*if (disableCreateMany) {
    const items = await createInDataProviderFallback(dataProvider, resource, values);
    Responses.push(...items);
    return items;
  }*/
  let fn = "createMany";
  if(dataProviderFunction) fn = dataProviderFunction;
  

  try {
    const response = await dataProvider[fn](resource, { data: values });
    _response = {
      success: true, response: response, value: values
    }
  } catch (error) {
    
    const providerMethodNotFoundErrors = [
      "Unknown dataProvider",
      fn,
    ];

    console.error(providerMethodNotFoundErrors);

    _response = {
        success: false, response: null, err: error, value: values
    }
  
  }
  return _response;
}



interface IImportButtonProps {
  variant: "text" | "outlined" | "contained";
  label: string;
  clickImportButton: () => any;
  onFileAdded: (e: React.ChangeEvent<HTMLInputElement>) => any;
  onRef: (el: HTMLInputElement) => any;
}

const ImportButton:React.FC<IImportButtonProps> = ({...props}) => {

  const { variant, label, clickImportButton, onFileAdded, onRef } = props;

  return (
    
      <div>
        <RAButton
          color="primary"
          component="span"
          variant={variant}
          label={label}
          onClick={clickImportButton}
        >
          <GetAppIcon style={{ transform: "rotate(180deg)", fontSize: "20" }} />
        </RAButton>
        <input
          ref={onRef}
          type="file"
          style={{ display: "none" }}
          onChange={onFileAdded}
          accept=".xls,.xlsx"
        />
      </div>

  );
}

interface IImportExcelButton {
    variant?: "text" | "outlined" | "contained"
    label?: string
    resourceAttribute: string
    resourceName?: string 
    logging?: boolean
}

const ImportExcelButton:React.FC<IImportExcelButton> = ({...props}) => {

  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const resource = useResourceContext();
  const logging = !!props.logging;
  let { variant, label, resourceName,resourceAttribute } = props;

  if (!resource) {
    throw new Error("No se ha específicado un recurso");
  }

  if (!label) {
    label = "Importar"
  }

  if (!variant) {
    variant = "text";
  }

  if (!resourceName) {
    resourceName = resource;
  }

  const [open, setOpen] = React.useState(false); // PAaa abrir un dialogo
  /*const [isLoading, setIsLoading] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(null as any);*/
  const [file, setFile] = React.useState<File | null>();
  const fileName = (file && file.name) + "";

  React.useEffect(() => {
    let mounted = true;
    if (!file) {
      setOpen(false);
      return;
    }
    setOpen(true);
    
    

    upload(
        logging,
        false,
        dataProvider,
        resourceName,
        {[resourceAttribute]:file},
        null,
        (response:Response) => { 

            if(response.err) {
                notify(JSON.stringify(response.err));
            } else { 
                notify(response.response.data.message);
                refresh();
            }
        
        }
    );

    


    return () => {
      mounted = false;
    };
  }, [file]);

  let refInput: HTMLInputElement;

  function resetVars() {
    setOpen(false);
    //setIsLoading(false);
    setFile(null);
  }

  function clickImportButton() {
    resetVars();
    refInput.value = "";
    refInput.click();
  }

  const onFileAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    setFile(file);

  };

  const notify = useNotify();
  const handleClose = () => {
    console.log("handleClose", { file });
    resetVars();
    //notify(translate("csv.dialogImport.alertClose", { fname: fileName }), { type: 'info'});
    refresh();
  };


  const handleSkip = () => {
    handleClose();
  };

  return (
    <>
      {/* IMPORT BUTTON */}
      <ImportButton
        variant={variant}
        label={label}
        clickImportButton={clickImportButton}
        onFileAdded={onFileAdded}
        onRef={(ref) => (refInput = ref)}
      />
    </>
  );
};


export default ImportExcelButton;


