import CampaignCalendarComponent from "../components/Campaign/Calendar/CampaignCalendarComponent";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import campaignSchema from "../schemas/campaign";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

const Icon = CalendarMonth as unknown as React.FC;

const campaignCalendarResource: IDashAutoAdminResourceConfig = 
{
    roles: ["*"],
    component: ResourceTemplate,
    postFormatter: (data) => {
        data.input_category_mappings = data.input_category_mappings.map(
            (ele) => ele.text
        );
        return data;
    },
    listComponent: (resourceConfig) => <CampaignCalendarComponent />,
    editComponent: (resourceConfig) => <CampaignCalendarComponent />,
    create: false,
    edit: false,
    model: "ecommerce/campaign_calendar",
    group: "Campañas",
    label: "Calendario",
    schema: campaignSchema,
    icon: <Icon />,
    menu: [
        {
            title: "Calendario Campañas",
            redirect: "/campaign_calendar",
        },
    ],
    mainAction: null,
    //search: true
    saveButtonAlwaysEnabled: true,
    processErrors: false,
}

export default campaignCalendarResource;