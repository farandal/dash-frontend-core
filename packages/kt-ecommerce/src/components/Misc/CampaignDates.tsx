
import moment from "moment";
import React from "react";

import { Chip } from "@mui/material";

import * as Icon from 'react-feather';
import { ICampaign } from "../../interfaces";

moment.locale("es-es");


export interface ICampaignDates {
    campaign: ICampaign
}

const CampaignDates: React.FC<ICampaignDates> = ({ campaign, ...props }) => {

    return <>{campaign.scheduled ? <><div className="dash-campaign-tag">
        <Icon.ArrowRight
          
            size={"30px"}
            className="dash-campaign-icon"
            color="#388E3C" />
        <span>{moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('DD')} de {moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('MMMM')} a las {moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')}</span>
    </div><div className="dash-campaign-tag">
            <Icon.ArrowLeft
               
                size={"30px"}
                className="dash-campaign-icon"
                color="#F44336" />
            <span>{moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('DD')} de {moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('MMMM')} a las  a las {moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')}</span>
        </div></> : <Chip label={"Campaña Permanente"} />}
    </>
}

export default CampaignDates;