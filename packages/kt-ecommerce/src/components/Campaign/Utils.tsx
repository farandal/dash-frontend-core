import { Chip, Tooltip } from "@mui/material";

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ReactNode } from "react";
//import { CampaignStatuses } from "../interfaces/campaign/ICampaign";
//import { ProductStatuses } from "../interfaces/campaign/ICampaignProduct";
import React from "react";
import { CampaignStatuses, ProductStatuses } from "../../interfaces";
/*
   PENDING = 'PENDING',
    PUBLISHING = 'PUBLISHING',
    //PUBLISHED = 'PUBLISHED',
    PAUSING = 'PAUSING',
    //PAUSED = 'PAUSED',
    FINISHING = 'FINISHING',
    //FINISHED = 'FINISHED'
*/
export const CampaignStatus = (status) => {
    
    let color = '#FF9800';
    let text = 'En espera';

    if (status === CampaignStatuses.PUBLISHED) {
        color = '#4CFF4C';
        text = 'Publicado';
    }

    if (status === CampaignStatuses.PUBLISHING) {
        color = '#4CFF4C';
        text = 'Publicando ...';
    }

    else if (status === CampaignStatuses.PAUSED) {
        color = '#4C4C4C';
        text = 'Pausado';
    }
    
    else if (status === CampaignStatuses.PAUSING) {
        color = '#4C4C4C';
        text = 'Pausando ...';
    }

    else if (status === CampaignStatuses.FINISHED) {
        color = '#E43961';
        text = 'Finalizado';
    }

    else if (status === CampaignStatuses.FINISHING) {
        color = '#E43961';
        text = 'Finalizando ...';
    }

    return <Chip color={"primary"} label={text} style={{ backgroundColor: color }} size={"small"} />

};
/*
PENDING   = 'PENDING',
PUBLISHED = 'PUBLISHED',
PAUSED    = 'PAUSED',
FINISHED  = 'FINISHED',
ERRORED   = 'ERRORED',
WARNING   = 'WARNING',
*/
export const ProductStatus = (status) => {
    let color = '#FF9800';
    let text:ReactNode = <>En espera</>;
    let helper:string = "";
    if (status === ProductStatuses.PENDING) {
        color = '#FF9800';
        text = 'En espera';
    }

    if (status === ProductStatuses.PUBLISHED) {
        color = '#4CFF4C';
        text = 'Publicado';
    }
    else if (status === ProductStatuses.PAUSED) {
        color = '#4C4C4C';
        text = 'Pausado';
    }
    else if (status === ProductStatuses.FINISHED) {
        color = '#E43961';
        text = 'Finalizado';
    }
    else if (status === ProductStatuses.ERRORED) {
        color = '#FF0000';
        text = 'Con Errores';
    }
    else if (status === ProductStatuses.WARNING) {
        color = '#FF5500';
        text = <WarningAmberIcon/>
        helper = "Requiere Actualización Manual, haga click en Acción -> Publicar"
    }
    return <Tooltip title={helper}>
                <Chip color={"primary"} label={text} style={{ backgroundColor: color }} size={"small"} />
            </Tooltip>

};