import React, { FC, useEffect } from "react";
import * as ReactDOM from 'react-dom';
import { useGetList } from "react-admin";
import { Loading } from "react-admin";
import moment from "moment";
import { useDialog } from "dash-dialog";

import MarketplaceTags from "../../Misc/MarketplaceTags";
import { CampaignStatus } from "../Utils";
import { LinearProgress, Popover, Tooltip } from "@mui/material";
import MUISimpleJsonTable from "dash-admin/src/components/misc/MuiSimpleJsonTable";

import esLocale from '@fullcalendar/core/locales/es';
import { Calendar } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { ICampaign } from "../../../interfaces";
//import '@fullcalendar/react/dist/vdom';
/*
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';



import { useNavigate } from 'react-router-dom';
import { useDialog } from "../../components/Dialog/DialogService";
import { Button, Progress } from "antd";
import ICampaign, { CampaignStatuses } from "../../interfaces/campaign/ICampaign";
import { CampaignStatus } from "../../components/Campaign/Utils";
import MarketplaceTags from "../../components/Misc/MarketplaceTags";
import MUISimpleJsonTable from "../../components/MuiSimpleJsonTable";
*/

moment.locale("es-es");

let tooltipInstance = null;

export interface ICampaignCalendarComponent {
    data: any
}

export const CampaignCalendarComponent: FC<ICampaignCalendarComponent> = ({ data, ...props }) => {

    const dialog = useDialog();

    /*const handleTooltipOpen = (info: any) => {

        dialog({
            variant: "info",
            title: "Test",
            content: "Test",
            onSubmit: () => {
            },
            onClose: () => { }
        });

    };*/


    const eventRender = (info) => {
        const campaign: ICampaign = info.event.extendedProps.data;
        const totalDays = moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').diff(moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss'), 'days');
        const daysRemaining = moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').diff(moment(), 'days');
        const porcentaje = totalDays && daysRemaining ? Math.abs((totalDays - daysRemaining) / totalDays) * 100 : 0;

        const tableData = {
            Productos: campaign.products_count,
            Ventas: campaign.total_sales,
            Publicaciones: campaign.total_published,
            Errores: campaign.total_errored,
            Pausados: campaign.total_paused,
            Finalizados: campaign.total_finished,
        }

        const popover = (
            <Popover style={{ zIndex: 9999 }} className="popover-calendar" id="popover-basic" open={false}>
                <div style={{ zIndex: 9999 }} className="calendar-tooltip">
                    <div style={{ zIndex: 99999 }} className="calendar-tooltip-info">
                        <span>{campaign.campaign_marketplaces.map((item) => <>{item?.marketplace?.name}<br /></>)}</span>
                        {CampaignStatus(campaign.status)}
                        <MarketplaceTags marketplaces={(campaign?.campaign_marketplaces || []).map(cmp => cmp.marketplace)} />
                        {daysRemaining ? <span style={{ fontSize: '12px' }}>{daysRemaining} días para finalizar</span> : <></>}
                    </div>
                    {campaign?.scheduled ? <div className="calendar-tooltip-circle">
                        <LinearProgress variant="determinate" value={porcentaje} />
                    </div> : <></>}
                </div>
                <div className="calendar-tooltip-footer">
                    <MUISimpleJsonTable tableData={tableData} vertical={true} />
                    {/* <div>
                        <Button type="danger" size="small">Ver Campaña</Button>
                    </div>*/}
                </div>
            </Popover>
        );

        let evtId = "event-" + info.event.id;

        /*<OverlayTrigger placement="bottom" overlay={popover}>
               <div className="fc-content" id={evtId}>
                   <span className="fc-title">{moment(info.event.start, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss')} {info.event.title}</span>
               </div>
           </OverlayTrigger>*/

        const content = (

            <Tooltip
                title={popover}
                placement="bottom"
                PopperProps={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 8],
                            },
                        },
                    ],
                }}
            >
                <div className="fc-content" id={evtId}>
                    <span className="fc-title">{moment(info.event.start, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss')} {info.event.title}</span>
                </div>
            </Tooltip>
        );

        return content;
    }

    /* https://fullcalendar.io/ */

    return <FullCalendar
        locale={esLocale}
        firstDay={1}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        eventContent={eventRender}
        events={data}
    />
}

const CampaignCalendar: FC<any> = ({ children, ...props }) => {


    const { data, total, isLoading, error } = useGetList(
        'ecommerce/campaign_calendar',
        {
            // pagination: { page: 1, perPage: 10 },
            // sort: { field: 'published_at', order: 'DESC' }
        },
        { refetchOnWindowFocus: false }
    );
    if (isLoading) { return <Loading />; }
    if (error) { return <p>Ha ocurrido un error al obtener el calendario</p>; }

    const events = data.map((campaign) => {

        return campaign.scheduled ? {
            title: campaign.name,
            data: campaign,
            start: moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss'),
            end: moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss'),
            url: '/#/ecommerce/campaign/' + campaign.id + '/show'
        } : {
            groupId: 'Campañas permanentes',
            data: campaign,
            title: campaign.name,
            start: moment().format('YYYY-MM-DDTHH:mm:ss'),
            url: '/#/ecommerce/campaign/' + campaign.id + '/show',
            startTime: '00:00:00',
            endTime: '23:59:59'
        }

    });

    return <CampaignCalendarComponent data={events} />

}


export default CampaignCalendar;
