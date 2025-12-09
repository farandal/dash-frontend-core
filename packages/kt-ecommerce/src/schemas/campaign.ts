import CampaignDateTime from "../components/Campaign/DateTime";
import CampaignMarketplacesSelector from "../components/Campaign/MarketplacesSelector";
import CampaignSettings from "../components/Campaign/Settings";
import { IDashAutoAdminAttribute } from "dash-auto-admin";


const campaignSchema:IDashAutoAdminAttribute[] = [
    {
        label: 'Nombre',
        attribute: 'name',
        inEdit: true,
        type: String
        
    },
    {
        label:"Descripción",
        attribute: 'description',
        inEdit: true,
        type: String
    },

    {
        label:"productos",
        attribute: 'products_count',
        inCreate: false,
        inEdit: false,
        type: Number
    },
    {
        label:"Errores",
        attribute: 'total_errored',
        inEdit: false,
        inCreate: false,
        type: Number
    },
    {
        label:"Finalizados",
        attribute: 'total_finished',
        inList: false,
        inEdit: false,
        inCreate: false,
        type: Number
    },
    {
        label:"Pausados",
        attribute: 'total_paused',
        inCreate: false,
        inEdit: false,
        type: Number
    },
    {
        label:"Pendientes",
        attribute: 'total_pending',
        inEdit: false,
        inList: false,
        inCreate: false,
        type: Number
    },
    {
        label:"Publicados",
        attribute: 'total_published',
        inEdit: false,
        inCreate: false,
        type: Number
    },
    {
        label:"Ventas",
        attribute: 'total_sales',
        inEdit: false,
        inCreate: false,
        type: Number
    },
    {
        label:"Advertencias",
        attribute: 'total_warning',
        inEdit: false,
        inCreate: false,
        inList: false,
        type: Number
    },
    {
        label:"Configuración campaña",
        attribute: '',
        custom: true,
        inList: false,
        inEdit: true,
        type: String,
        component: CampaignSettings
    },
    {
        label: "Marketplaces",
        attribute: 'campaign_marketplaces',
        type: String,
        custom: true,
        inList: true,
        inEdit: false,
        component: CampaignMarketplacesSelector,
    },
    /*{
        label:"Comienzo campaña",
        attribute: 'start_date',
        inCreate: false,
        inEdit: false,
        custom: true,
        type: Date,
        component: CampaignDateTime
    },
    {
        label:"Fin campaña",
        attribute: 'end_date',
        inEdit: false,
        inCreate: false,
        custom: true,
        type: Date,
        component: CampaignDateTime
    },*/
];

export default campaignSchema;
