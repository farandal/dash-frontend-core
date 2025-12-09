import React from "react";
import { DataProvider, Button as RAButton } from "react-admin";
import { Tooltip } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import {useRefresh, useNotify, useDataProvider, useResourceContext} from "react-admin";
import { useDialog } from "dash-dialog";
import ProductExport from "../Product/ProductExport";


export type PrecommitCallback = (action: "upload", values: any) => Promise<any>;
export type ErrorCallback = (error: any) => void;


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
  let _response:Response = { success: false, response: null, value: values}
  /*if (disableCreateMany) {
    const items = await createInDataProviderFallback(dataProvider, resource, values);
    Responses.push(...items);
    return items;
  }*/
  let fn = "create";
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

interface IExportButtonProps {
  variant: "text" | "outlined" | "contained";
  label: string;
  clickExportButton: () => any;
}

const ExportButton:React.FC<IExportButtonProps> = ({...props}) => {

  const { variant, label, clickExportButton } = props;

  return (

      <div>
        <RAButton
          color="primary"
          component="span"
          variant={variant}
          label={label}
          onClick={clickExportButton}
        >
          <GetAppIcon style={{ fontSize: "20" }} />
        </RAButton>

      </div>

  );
}

interface IExportProductsButton {
    variant?: "text" | "outlined" | "contained"
    label?: string
    resourceName?: string
    logging?: boolean
}

const ExportProductsButton:React.FC<IExportProductsButton> = ({...props}) => {

  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const resource = useResourceContext();
  const logging = !!props.logging;
  let { variant, label, resourceName } = props;

  const dialog = useDialog();

  if (!resource) {
    throw new Error("No se ha específicado un recurso");
  }

  if (!label) {
    label = "Exportar"
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

  /*
  React.useEffect(() => {
    let mounted = true;
    if (!file) {
      setOpen(false);
      return;
    }
    setOpen(true);



    //upload(
    //    logging,
    //    false,
    //    dataProvider,
    //    resourceName,
    //    {[resourceAttribute]:file},
    //    null,
    //    (response:Response) => {
//
    //        if(response.err) {
    //            notify(JSON.stringify(response.err));
    //        } else {
    //            notify(response.response.data.message);
    //            refresh();
    //        }
    //
    //    }
    //);
    console.log("export");
    

    return () => {
      mounted = false;
    };
  }, [file]);
*/
  function resetVars() {
    setOpen(false);
  }

  function clickExportButton() {
    resetVars();
  }

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

  const openDialog = () => {
    dialog({
        variant: "info",
        title: "Seleccionar plantilla de exportación",
        content: <>Componente de exportación</>,
        onSubmit: () => {
        },
        onClose: () => { }
      });
  }

  return (
    <>
      {/* IMPORT BUTTON */}
      <ProductExport />
    </>
  );
};


export default ExportProductsButton;


