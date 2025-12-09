import { IDashAutoAdminAttribute } from "dash-auto-admin";
import CashCountStatus from "../components/CashCountStatus";
import CashCountTotals from "../components/CashCountTotals";
import CashCountPeriodInfo from "../components/CashCountPeriodInfo";
import CashCountCloseButton from "../components/CashCountCloseButton";

const cashCountSchema: IDashAutoAdminAttribute[] = [
    {
        tab: "Totals",
        attribute: 'id',
        label: 'ID',
        type: Number,
        sortable: true,
        inList: true,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: "Totals",
        attribute: 'status',
        label: 'Status',
        type: String,
        custom: true,
        component: CashCountStatus,
        sortable: true,
        inList: true,
        inShow: true,
        inEdit: true,
        inCreate: false, // Status is automatically set to 'preview' after creation
    },
    {
        tab: "Totals",
        attribute: 'period_info',
        label: 'Period Information',
        type: String,
        custom: true,
        component: CashCountPeriodInfo,
        inList: true,
        inShow: true,
        inEdit: true,
        inCreate: true,
    },
    {
        tab: "Totals",
        attribute: 'totals',
        label: 'Cash Count Totals',
        type: String,
        custom: true,
        component: CashCountTotals,
        inList: false,
        inShow: true,
        inEdit: true,
        inCreate: false, // Totals are calculated after creation
    },
    {
        tab: "Details",
        attribute: 'created_at',
        label: 'Created At',
        type: Date,
        fieldProps: { showTime: true },
        sortable: true,
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: "Details",
        attribute: 'updated_at',
        label: 'Updated At',
        type: Date,
        fieldProps: { showTime: true },
        sortable: true,
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: "Details",
        attribute: 'closed_at',
        label: 'Closed At',
        type: Date,
        fieldProps: { showTime: true },
        sortable: true,
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    // Notes moved to the bottom
    {
        tab: "Details",
        attribute: 'notes',
        label: 'Notes',
        type: String,
        fieldProps: {
            multiline: true,
            rows: 4,
            placeholder: 'Add any notes or comments about this cash count period...'
        },
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false, // Removed from creation
    },
    // Hidden fields for filtering and sorting
    {
        attribute: 'period_start',
        label: 'Period Start',
        type: Date,
        inList: false,
        inShow: false,
        inEdit: false,
        inCreate: false,
    },
    {
        attribute: 'period_end',
        label: 'Period End',
        type: Date,
        inList: false,
        inShow: false,
        inEdit: false,
        inCreate: false,
    },
    {
        attribute: 'system_total_amount',
        label: 'System Total',
        type: Number,
        inList: false,
        inShow: false,
        inEdit: false,
        inCreate: false,
    },
    {
        attribute: 'final_total_amount',
        label: 'Final Total',
        type: Number,
        inList: false,
        inShow: false,
        inEdit: false,
        inCreate: false,
    },
];

export default cashCountSchema;
