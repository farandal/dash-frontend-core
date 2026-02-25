import { IDashAutoAdminAttribute } from "dash-auto-admin";
import PlanLimitsSettings from "../components/subscription/PlanLimitsSettings";
import PlanAddonsSettings from "../components/subscription/PlanAddonsSettings";
import PlanPricesSettings from "../components/subscription/PlanPricesSettings";
import PlanFeaturesSettings from "../components/subscription/PlanFeaturesSettings";
import PlanMetadataSettings from "../components/subscription/PlanMetadataSettings";
import { AuditLog } from "dash-components";
import { SelectInput } from "react-admin";

/**
 * Subscription Plan Schema for System Admin
 * 
 * Defines the form fields and display configuration for subscription plan management.
 * The schema includes:
 * - Basic plan information (name, slug, description)
 * - Pricing configuration (price, billing cycle, trial days)
 * - Dynamic limits settings (via PlanLimitsSettings component)
 * - Status and metadata
 */

const subscriptionPlanSchema: IDashAutoAdminAttribute[] = [
    // ============ Basic Info Tab ============
    {
        tab: 'Basic Info',
        attribute: 'name',
        label: 'Plan Name',
        type: String,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        validate: (value) => !value ? 'Required' : undefined,
        fieldProps: {
            helperText: 'Display name for the plan (e.g., "Professional", "Enterprise")',
            fullWidth: true,
        },
    },
    {
        tab: 'Basic Info',
        attribute: 'slug',
        label: 'Slug',
        type: String,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        validate: (value) => !value ? 'Required' : undefined,
        fieldProps: {
            helperText: 'URL-friendly identifier (e.g., "professional", "enterprise")',
            fullWidth: true,
        },
    },
    {
        tab: 'Basic Info',
        attribute: 'flow_plan_id',
        label: 'Flow Plan ID',
        type: String,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        fieldProps: {
            helperText: 'External Plan ID in Flow.cl (if different from slug)',
            fullWidth: true,
        },
    },
    {
        tab: 'Basic Info',
        attribute: 'rebill_plan_id',
        label: 'Rebill Plan ID',
        type: String,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        fieldProps: {
            helperText: 'External Plan ID in Rebill (if different from slug)',
            fullWidth: true,
        },
    },
      {
        tab: 'Basic Info',
        attribute: 'allow_downgrade',
        label: 'Downgradable',
        type: Boolean,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        validate: (value) => !value ? 'Required' : undefined,
    },
    {
        tab: 'Basic Info',
        attribute: 'description',
        label: 'Description',
        type: String,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        custom: true,
        component: 'TextInput',
        componentProps: {
            multiline: true,
            rows: 3,
            fullWidth: true,
            helperText: 'Brief description of the plan features',
        },
    },
    {
        tab: 'Basic Info',
        attribute: 'is_active',
        label: 'Active',
        type: Boolean,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        fieldProps: {
            helperText: 'Whether this plan is available for new subscriptions',
        },
        fieldOptions: {
            defaultValue: true,
        },
    },
       {
        tab: 'Basic Info',
        attribute: 'is_default',
        label: 'Default Plan',
        type: Boolean,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        fieldProps: {
            helperText: 'Default plan for new tenancy account registrations. Only one plan can be default.',
        },
        fieldOptions: {
            defaultValue: false,
        },
    },
    {
        tab: 'Basic Info',
        attribute: 'tier',
        label: 'Tier',
        type: Number,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        fieldProps: {
            helperText: 'Plan tier level: 1=Free, 2=Basic, 3=Pro, 4=Enterprise. Higher = better/more expensive.',
            fullWidth: true,
        },
        fieldOptions: {
            defaultValue: 1,
        },
    },

        // Billing cycle display for list/show views (text field)
    {
        tab: 'Basic Info',
        attribute: 'subscription_plan_type',
        label: 'Plan Type',
        type: String,
        inList: true,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: 'Basic Info',
        attribute: 'subscription_plan_type',
        label: 'Plan Type',
        type: String,
        inList: false,
        inShow: false,
        inEdit: true,
        inCreate: true,
        custom: true,
        component: SelectInput,
        componentProps: {
            source: 'subscription_plan_type',
            choices: [
                { id: 'public', name: 'Public (visible to customers)' },
                { id: 'internal', name: 'Internal (system use only)' },
            ],
            defaultValue: 'public',
            fullWidth: true,
            helperText: 'Public plans are visible to customers, internal plans are for system use only',
        },
    },

    // ============ Pricing Tab ============

    // Billing cycle display for list/show views (text field)
    {
        tab: 'Pricing',
        attribute: 'billing_cycle',
        label: 'Billing Cycle',
        type: String,
        inList: true,
        inEdit: false,
        inShow: true,
        inCreate: false,
    },
    // Billing cycle input for edit/create views (SelectInput)
    {
        tab: 'Pricing',
        attribute: 'billing_cycle',
        label: 'Billing Cycle',
        type: String,
        inList: false,
        inEdit: true,
        inShow: false,
        inCreate: true,
        validate: (value) => !value ? 'Required' : undefined,
        custom: true,
        component: SelectInput,
        componentProps: {
            source: 'billing_cycle',
            choices: [
                { id: 'daily', name: 'Daily' },
                { id: 'weekly', name: 'Weekly' },
                { id: 'monthly', name: 'Monthly' },
                { id: 'yearly', name: 'Yearly' },
            ],
            fullWidth: true,
            defaultValue: 'monthly',
            helperText: 'Plans are gateway-agnostic. Validation happens when users subscribe.'
        },
    },
    {
        tab: 'Pricing',
        attribute: 'trial_days',
        label: 'Trial Days',
        type: Number,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        fieldProps: {
            helperText: 'Number of free trial days (0 = no trial)',
            fullWidth: true,
        },
        fieldOptions: {
            defaultValue: 0,
        },
    },
    {
        tab: 'Pricing',
        attribute: 'has_trial',
        label: 'Has Trial',
        type: Boolean,
        inList: true,
        inEdit: false,
        inShow: true,
        inCreate: false,
        readOnly: true,
    },


    {
        tab: 'Pricing',
        attribute: 'prices',
        label: 'Prices by Currency',
        type: Object,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate: true,
        custom: true,
        component: PlanPricesSettings,
        fieldProps: {
            helperText: 'Set prices for each available currency (in cents)',
            fullWidth: true,
        },
    },
    {
        tab: 'Pricing',
        attribute: 'price',
        label: 'Default Price (in cents)',
        type: Number,
        inList: false,
        inEdit: false,
        inShow: true,
        inCreate: false,
        readOnly: true,
        fieldProps: {
            helperText: 'Legacy single price field (use Prices by Currency instead)',
            fullWidth: true,
        },
    },
    {
        tab: 'Pricing',
        attribute: 'formatted_price',
        label: 'Formatted Price',
        type: String,
        inList: false,
        inEdit: false,
        inShow: true,
        inCreate: false,
        readOnly: true,
    },


   

    // ============ Limits Tab ============
    {
        tab: 'Limits',
        attribute: 'limits',
        label: 'Plan Limits',
        type: Object,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        custom: true,
        component: PlanLimitsSettings,
    },

    // ============ Add-ons Tab ============
    {
        tab: 'Add-ons',
        attribute: 'addons',
        label: 'Plan Add-ons',
        type: Object,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        custom: true,
        component: PlanAddonsSettings,
        fieldProps: {
            helperText: 'Enable/disable marketplace and POS integrations for this plan',
        },
    },

    // ============ Features Tab ============
    {
        tab: 'Features',
        attribute: 'features',
        label: 'Features',
        type: Array,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        custom: true,
        component: PlanFeaturesSettings,
    },

    // ============ Metadata Tab ============
    {
        tab: 'Metadata',
        attribute: 'metadata',
        label: 'Metadata',
        type: Object,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: true,
        custom: true,
        component: PlanMetadataSettings,
    },

    // ============ Stats Tab (View Only) ============
    {
        tab: 'Stats',
        attribute: 'active_subscriptions_count',
        label: 'Active Subscriptions',
        type: Number,
        inList: true,
        inEdit: false,
        inShow: true,
        inCreate: false,
        readOnly: true,
    },
    {
        tab: 'Stats',
        attribute: 'created_at',
        label: 'Created At',
        type: Date,
        inList: false,
        inEdit: false,
        inShow: true,
        inCreate: false,
        readOnly: true,
    },
    {
        tab: 'Stats',
        attribute: 'updated_at',
        label: 'Updated At',
        type: Date,
        inList: false,
        inEdit: false,
        inShow: true,
        inCreate: false,
        readOnly: true,
    },

    // ============ Audit Tab ============
    {
        tab: 'Audit',
        attribute: 'audit_logs',
        label: 'Audit Logs',
        type: Array,
        inList: false,
        inEdit: true,
        inShow: true,
        inCreate: false,
        readOnly: true,
        custom: true,
        component: AuditLog,
        fieldProps: {
            helperText: 'View all changes made to this subscription plan',
        },
    },
];

export default subscriptionPlanSchema;
