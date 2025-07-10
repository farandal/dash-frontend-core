import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import { SelectInput } from 'react-admin';
import SubscriptionPlanFeatures from './components/SubscriptionPlanFeatures';
import SubscriptionPlanPreview from './components/SubscriptionPlanPreview';
import SubscriptionPlanStats from './components/SubscriptionPlanStats';

const subscriptionPlanSchema: IDashAutoAdminAttribute[] = [
    {
        label: 'ID',
        attribute: 'id',
        type: Number,
        inList: true,
    },
    {
        label: 'Nombre',
        attribute: 'name',
        type: String,
        inList: true,
        validate: (value: string) => {
            if (!value || value.trim().length === 0) {
                throw new Error('El nombre es requerido');
            }
            if (value.length > 255) {
                throw new Error('El nombre no puede exceder 255 caracteres');
            }
        }
    },
    {
        label: 'Slug',
        attribute: 'slug',
        type: String,
        inList: true,
        validate: (value: string) => {
            if (!value || value.trim().length === 0) {
                throw new Error('El slug es requerido');
            }
            if (!/^[a-z0-9-_]+$/.test(value)) {
                throw new Error('El slug solo puede contener letras minúsculas, números, guiones y guiones bajos');
            }
        }
    },
    {
        label: 'Descripción',
        attribute: 'description',
        type: String,
        inList: false,
        componentProps: {
            multiline: true,
            rows: 3
        }
    },
    {
        label: 'Precio (en centavos)',
        attribute: 'price',
        type: Number,
        inList: true,
        validate: (value: number) => {
            if (value === null || value === undefined) {
                throw new Error('El precio es requerido');
            }
            if (value < 0) {
                throw new Error('El precio no puede ser negativo');
            }
        }
    },
    {
        label: 'Precio Formateado',
        attribute: 'formatted_price',
        type: String,
        inList: true,
        custom: true,
    },
    {
        label: 'Ciclo de Facturación',
        attribute: 'billing_cycle',
        type: String,
        component: SelectInput,
        componentProps: {
            choices: [
                { id: 'monthly', name: 'Mensual' },
                { id: 'yearly', name: 'Anual' },
            ]
        },
        inList: true,
        validate: (value: string) => {
            if (!value) {
                throw new Error('El ciclo de facturación es requerido');
            }
            if (!['monthly', 'yearly'].includes(value)) {
                throw new Error('Ciclo de facturación inválido');
            }
        }
    },
    {
        label: 'Días de Prueba',
        attribute: 'trial_days',
        type: Number,
        inList: true,
        componentProps: {
            min: 0,
            max: 365
        },
        validate: (value: number) => {
            if (value < 0) {
                throw new Error('Los días de prueba no pueden ser negativos');
            }
            if (value > 365) {
                throw new Error('Los días de prueba no pueden exceder 365 días');
            }
        }
    },
    {
        label: 'Activo',
        attribute: 'is_active',
        type: Boolean,
        inList: true,
    },
    {
        tab: "Características",
        label: 'Gestión de Características',
        attribute: 'features_management',
        type: String,
        custom: true,
        inList: false,
        component: SubscriptionPlanFeatures,
    },
    {
        tab: "Vista Previa",
        label: 'Vista Previa del Plan',
        attribute: 'plan_preview',
        type: String,
        custom: true,
        inList: false,
        component: SubscriptionPlanPreview,
    },
    /*{
        tab: "Estadísticas",
        label: 'Estadísticas del Plan',
        attribute: 'plan_stats',
        type: String,
        custom: true,
        inList: false,
        component: SubscriptionPlanStats,
    },*/
    {
        tab: "Información Calculada",
        label: 'Precio por Mes',
        attribute: 'price_per_month',
        type: Number,
        inList: false,
        custom: true,
    },
    {
        tab: "Información Calculada",
        label: 'Tiene Prueba',
        attribute: 'has_trial',
        type: Boolean,
        inList: true,
        custom: true,
    },
    {
        tab: "Información Calculada",
        label: 'Etiqueta del Ciclo',
        attribute: 'billing_cycle_label',
        type: String,
        inList: false,
        custom: true,
    },
    {
        label: 'Fecha de Creación',
        attribute: 'created_at',
        type: String,
        inList: true,
        custom: true,
    },
    {
        label: 'Fecha de Actualización',
        attribute: 'updated_at',
        type: String,
        inList: false,
        custom: true,
    },
];

export default subscriptionPlanSchema;
