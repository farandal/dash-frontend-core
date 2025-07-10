import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import { SelectInput, DateTimeInput } from 'react-admin';
import SubscriptionStatusIndicator from './components/SubscriptionStatusIndicator';
import SubscriptionPaymentHistory from './components/SubscriptionPaymentHistory';
import SubscriptionActions from './components/SubscriptionActions';


const subscriptionSchema: IDashAutoAdminAttribute[] = [
    {
        label: 'ID',
        attribute: 'id',
        type: Number,
        inList: true,
    },
    {
        label: 'Usuario',
        attribute: 'user_id',
        type: 'system/user.name',
        pagination: false,
        multiple: false,
        component: SelectInput,
        inList: true,
    },
    {
        label: 'Plan de Suscripción',
        attribute: 'subscription_plan_id',
        type: 'system/subscription-plan.name',
        pagination: false,
        multiple: false,
        component: SelectInput,
        inList: true,
        validate: (value: any) => {
            if (!value) {
                throw new Error('El plan de suscripción es requerido');
            }
        }
    },
    {
        label: 'Estado',
        attribute: 'status',
        type: String,
        component: SelectInput,
        componentProps: {
            choices: [
                { id: 'active', name: 'Activa' },
                { id: 'trial', name: 'Período de Prueba' },
                { id: 'cancelled', name: 'Cancelada' },
                { id: 'expired', name: 'Expirada' },
            ]
        },
        inList: true,
    },
    {
        tab: "Estado y Fechas",
        label: "Indicador de Estado",
        attribute: 'status_indicator',
        type: String,
        custom: true,
        inList: false,
        component: SubscriptionStatusIndicator,
    },
    {
        tab: "Estado y Fechas",
        label: 'Fin del Período de Prueba',
        attribute: 'trial_ends_at',
        type: Date,
      
        inList: false,
    },
    {
        tab: "Estado y Fechas",
        label: 'Inicio del Período Actual',
        attribute: 'current_period_start',
        type: Date,

        inList: false,
    },
    {
        tab: "Estado y Fechas",
        label: 'Fin del Período Actual',
        attribute: 'current_period_end',
        type: Date,
        
        inList: true,
    },
    {
        tab: "Estado y Fechas",
        label: 'Fecha de Cancelación',
        attribute: 'cancelled_at',
        type: Date,

        inList: false,
    },
    {
        tab: "Información de Pago",
        label: 'ID de Suscripción Google',
        attribute: 'google_subscription_id',
        type: String,
        inList: false,
    },
    {
        tab: "Información de Pago",
        label: "Historial de Pagos",
        attribute: 'payment_history',
        type: String,
        custom: true,
        inList: false,
        component: SubscriptionPaymentHistory,
    },
    {
        tab: "Acciones",
        label: "Acciones de Suscripción",
        attribute: 'subscription_actions',
        type: String,
        custom: true,
        inList: false,
        component: SubscriptionActions,
    },
    {
        tab: "Información Calculada",
        label: 'Activa',
        attribute: 'is_active',
        type: Boolean,
        inList: true,
        custom: true,
    },
    {
        tab: "Información Calculada",
        label: 'En Período de Prueba',
        attribute: 'is_on_trial',
        type: Boolean,
        inList: true,
        custom: true,
    },
    {
        tab: "Información Calculada",
        label: 'Días hasta Expiración',
        attribute: 'days_until_expiry',
        type: Number,
        inList: true,
        custom: true,
    },
    {
        label: 'Fecha de Creación',
        attribute: 'created_at',
        type: String,
        inList: true,
        custom: true,
    },
];

export default subscriptionSchema;
