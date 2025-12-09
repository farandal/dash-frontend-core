import React from "react";
import { DataProvider, Button as RAButton } from "react-admin";
import { Button, Paper, Stack, Tooltip } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useRefresh, useNotify, useDataProvider, useResourceContext } from "react-admin";


export type PrecommitCallback = (action: "upload", values: any) => Promise<any>;
export type ErrorCallback = (error: any) => void;


import { styled } from '@mui/material/styles';
import { useDialog } from "dash-dialog";
import {DASHAppConstants} from "dash-constants";
import { DASHAdminSystemConstants } from "dash-constants";

const Item = styled(Paper)(({ theme }) => ({
  //backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


//let logger = new SimpleLogger("uploader", false);

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
    //logger.setEnabled(logging);
    //logger.log("createInDataProvider", { dataProvider, dataProviderFunction, resource, values });
    let _response: Response = { success: false, response: null, value: values }
    /*if (disableCreateMany) {
      const items = await createInDataProviderFallback(dataProvider, resource, values);
      Responses.push(...items);
      return items;
    }*/
    let fn = "createMany";
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

interface IImportButtonProps {
    variant: "text" | "outlined" | "contained";
    label: string;
    clickImportButton: () => any;
    onFileAdded: (e: React.ChangeEvent<HTMLInputElement>) => any;
    onRef: (el: HTMLInputElement) => any;
}

const ImportButton: React.FC<IImportButtonProps> = ({ ...props }) => {

    const { variant, label, clickImportButton, onFileAdded, onRef } = props;

    return (

        <div>
            <Button
                color="primary"
                //component="span"
                //variant={variant}
                //label={label}
                onClick={clickImportButton}
            >
                <GetAppIcon style={{ transform: "rotate(180deg)", fontSize: "20" }} /> {label}
            </Button>
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
                <GetAppIcon style={{ transform: "rotate(180deg)", fontSize: "20" }} />
            </RAButton>

        </div>

    );
}

interface IImportMetadataButton {
    variant?: "text" | "outlined" | "contained"
    label?: string
    resourceName?: string
    logging?: boolean,
    resourceAttribute: string
}

const ImportMetadataButton: React.FC<IImportMetadataButton> = ({ ...props }) => {

    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const resource = useResourceContext();
    const logging = !!props.logging;
    //const stackableDialogs = useStackableDialog();

    let { variant, label, resourceName, resourceAttribute } = props;

    const dialog = useDialog();

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

    //const [open, setOpen] = React.useState(false);

    const notify = useNotify();

    const handleClose = () => {
        console.log("handleClose", { file });
        resetVars();
        //notify(translate("csv.dialogImport.alertClose", { fname: fileName }), { type: 'info'});
        refresh();
    };

    /*const handleSkip = () => {
        handleClose();
    };*/
    // Import file options

    const [file, setFile] = React.useState<File | null>();
    const fileName = (file && file.name) + "";

    React.useEffect(() => {
        let mounted = true;
        if (!file) {
            //setOpen(false);
            return;
        }
        //setOpen(true);

        upload(
            logging,
            false,
            dataProvider,
            resourceName,
            { [resourceAttribute]: file },
            null,
            (response: Response) => {

                if (response.err) {
                    //notify(JSON.stringify(response.err));

                    dialog({
                        variant: "danger",
                        title: "Ha ocurrido un error",
                        content: JSON.stringify(response.err),
                        /*onClose: () => {
                            stackableDialogs.close("ImportMetadataDialogError");
                        },*/
                        //onClose: () => { }
                        onSubmit: null
                    });


                } else {
                    //notify(response.response.data.message);

                    dialog({
                        variant: "info",
                        title: "La metadata se ha importado correctamente",
                        content: JSON.stringify(response.err),
                        /*onClose: () => {
                            stackableDialogs.close("ImportMetadataDialogSuccess");
                        },*/
                        //onClose: () => { }
                        onSubmit: null
                    });

                    //stackableDialogs.close("ImportMetadataDialog");

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
        //setOpen(false);
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

    const ExportOptions = () => {
        return <Stack spacing={2}>
                <Item><Button target="_blank" href={`${DASHAdminSystemConstants.system.API_URL}/metadatos.xlsx`} type='button'>Descargar Excel Ejemplo</Button></Item>
                <Item><ImportButton
            variant={variant}
            label={"Seleccionar Archivo"}
            clickImportButton={clickImportButton}
            onFileAdded={onFileAdded}
            onRef={(ref) => (refInput = ref)}
        /></Item>


                </Stack>




    }

    const openDialog = () => {
        dialog({
            variant: "info",
            title: "Importar metadata",
            content: <ExportOptions />,
            /*onClose: () => {
                stackableDialogs.close("ImportMetadataDialog");
            },*/
            //onClose: () => { }
            onSubmit: null
        });
    }

    return (
        <>
            {/* IMPORT BUTTON */}
            <ExportButton
                variant={variant}
                label={label}
                clickExportButton={openDialog}
            />
        </>
    );
};


export default ImportMetadataButton;


