import moment from "moment";
import { useState } from "react";
import { useParams } from "react-router";

import {
    Dialog,
    Chip,
} from "@mui/material";

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import DeleteIcon from "@mui/icons-material/Delete";

import {
    useUpdate,
    useNotify,
    useRefresh,
    useDelete,
} from "react-admin";

import {
    GridRenderCellParams} from "@mui/x-data-grid";

import CellSettings from "./CellSettings";
import CampaignProductDeleteByMarketplace from "./CampaignProductDeleteByMarketplace";
import React from "react";

moment.locale("es-es");

const DeleteRenderCell = (props: GridRenderCellParams) => {
    const { id } = useParams();
    const [deleteOne] = useDelete();
    const [update] = useUpdate();
    const refresh = useRefresh();
    const notify = useNotify();
    const [open, setOpen] = useState(false);


    const removeProduct = async (idProd) => {
        try {

            await deleteOne(
                `/ecommerce/campaign/${id}/products`,
                { id: idProd },
                {
                    onSuccess: () => { notify('Producto removido correctamente.') },
                    onError: (error:any) => { console.log(error); notify(`Error al remover el producto, ${error?.body?.message || ''}`) },
                }
            );
        } catch (error) {

            console.log(error);
        } finally {
            setOpen(false);
            refresh();
        }
    };

    return <>
        <div className="table-cell-container">
            <div className="table-cell-content">
                {/* <Button color={'error'} onClick={() => setOpen(true)} style={{ marginRight: 8 }}>
                        Quitar */}
                        <div className="table-chips">
                            <a onClick={() => setOpen(true)}>
                                <Chip color={"primary"} label={<DeleteIcon sx={{ fontSize: 12 }}/>} className={'chip-red'} size={"small"} />
                            </a>
                        </div>
                {/* </Button> */}
            </div>
            <CellSettings
                row={props.row}
            >
               <CampaignProductDeleteByMarketplace data={props.row} />
            </CellSettings>
        </div>

    </>
}


export default DeleteRenderCell;