
import { useState } from "react";
import { useRecordContext, useGetList, Loading } from "react-admin";
import {
    DataGrid as MUIGrid,
    GridColDef,
    esES,
    GridRowParams} from "@mui/x-data-grid";
import { Box, Button, Dialog } from "@mui/material";
import React from "react";
import { ILog } from "../interfaces/Log";
import { ICampaign } from "../interfaces/campaign/ICampaign";
import { LogTxtFileComponent } from "../../LogFile";

const Logs = () => {

    const [page, setPage] = useState(1);
    const contextCampaign: ICampaign = useRecordContext();
    const [dialogState, setDialogState] = useState<{open:boolean,log:ILog|null}>({open:false,log:null});
    const { data, isLoading, error } = useGetList(
        'system/log',
        {
            pagination:false,
            filter: {
                loggeable_type: "App\\Models\\Campaign",
                loggeable_id: contextCampaign.id
            },
        },
        { refetchOnWindowFocus: false}
    );
    if (isLoading) { return <Loading />; }
    if (error) { return <p>ERROR</p>; }

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Nonbre',
            type: 'string',
            width: 300
        },
        {
            field: 'type',
            headerName: 'Tipo',
            type: 'string',
            width: 200
        },
        {
            field: 'date',
            headerName: 'Fecha',
            type: 'string',
            width: 200
        },
        {
            field: 'action',
            headerName: 'Acciones',
            type: 'actions',
            editable: false,
            getActions: (params: GridRowParams) => {
                const log:ILog = params.row;
                return [<Button key="ver-log" color="warning" onClick={() => { console.log("ver log",params); setDialogState({open:true,log:log}) }} >Ver Log</Button>]
            },
            width: 120
        }
    ];

    return (
        <>
            <Box
                sx={{
                    height: 400,
                    width: '100%',
                }}
            >
            <MUIGrid
                    columns={columns}
                    rows={data || []}
                />
            </Box>

            <Dialog
                open={dialogState.open}
                onClose={() => { setDialogState({open:false,log:null}) }}
            >  <div style={{width:'100%',height:'100%'}}>
                {(dialogState.open && dialogState.log) && <LogTxtFileComponent log={dialogState.log} />}
                </div>
            </Dialog>
        </>
    );

}

export default Logs;
