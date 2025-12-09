import React from "react";
import { DataProvider, Button as RAButton } from "react-admin";
import { Tooltip } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import {useRefresh, useNotify, useDataProvider, useResourceContext} from "react-admin";
import { useDialog } from "dash-dialog";
import CashCountExport from "./CashCountExport";

export type PrecommitCallback = (action: "export", values: any) => Promise<any>;
export type ErrorCallback = (error: any) => void;

export async function exportData(
  logging: boolean,
  dataProvider: DataProvider,
  resource: string,
  values: any,
  preCommitCallback?: PrecommitCallback,
  postCommitCallback?: ErrorCallback
) {
  const parsedValues = preCommitCallback
    ? await preCommitCallback("export", values)
    : values;

  const response = await exportInDataProvider(
    logging,
    dataProvider,
    resource,
    parsedValues,
    "export"
  );

  if (postCommitCallback) {
    postCommitCallback(response);
  }
}

interface Response {
  value: any;
  success: boolean;
  err?: any;
  response?: any;
}

export async function exportInDataProvider(
  logging: boolean,
  dataProvider: DataProvider,
  resource: string,
  values: any,
  dataProviderFunction?: string,
): Promise<Response> {
  let _response: Response = { success: false, response: null, value: values }
  let fn = "create";
  if (dataProviderFunction) fn = dataProviderFunction;

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

const ExportButton: React.FC<IExportButtonProps> = ({ ...props }) => {
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

interface IExportCashCountsButton {
  variant?: "text" | "outlined" | "contained"
  label?: string
  resourceName?: string
  logging?: boolean
}

const ExportCashCountsButton: React.FC<IExportCashCountsButton> = ({ ...props }) => {
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const resource = useResourceContext();
  const logging = !!props.logging;
  let { variant, label, resourceName } = props;

  const dialog = useDialog();

  if (!resource) {
    throw new Error("No resource has been specified");
  }

  if (!label) {
    label = "Export"
  }

  if (!variant) {
    variant = "text";
  }

  if (!resourceName) {
    resourceName = resource;
  }

  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();
  const fileName = (file && file.name) + "";

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
    refresh();
  };

  const handleSkip = () => {
    handleClose();
  };

  const openDialog = () => {
    dialog({
      variant: "info",
      title: "Select export template",
      content: <>Export component</>,
      onSubmit: () => {
      },
      onClose: () => { }
    });
  }

  return (
    <>
      {/* EXPORT BUTTON */}
      <CashCountExport />
    </>
  );
};

export default ExportCashCountsButton;
