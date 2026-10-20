/** Shapes served by core app/PosPaymentCore (`/api/pos-payments/*`). */

export interface ParamFormat {
    id: string;
    label?: string;
    type?: string;
    rules?: string;
    secret?: boolean;
    description?: string;
    default_value?: unknown;
    choices?: { id: string; name?: string }[];
}

export interface ConnectorCapabilities {
    requires_device: boolean;
    device_kind: string | null;
    transport: string;
    supported_currencies: string[];
    region?: string;
    supports_refund?: boolean;
}

export interface Connector {
    key: string;
    label: string;
    capabilities: ConnectorCapabilities;
    form: ParamFormat[];
}

export type RefundMode = 'connector' | 'manual';

export interface PaymentConfig {
    point_of_sale_id: number | string;
    name: string;
    connector: string | null;
    connector_label: string | null;
    capabilities: ConnectorCapabilities | null;
    form: ParamFormat[];
    values: Record<string, unknown>;
    secrets_set: Record<string, boolean>;
    device_id: string | null;
    settings: { refund_mode: RefundMode };
    verified?: boolean | null;
}

export interface Terminal {
    id: string;
    operating_mode?: string;
    pos_id?: number | string;
    store_id?: number | string;
    [key: string]: unknown;
}

export type TransactionStatus = 'pending' | 'approved' | 'declined' | 'timeout' | 'cancelled' | 'error';

export interface PosTransaction {
    id: string;
    point_of_sale_id: number | string;
    reference: string;
    reference_type: string | null;
    amount: string;
    currency: string;
    status: TransactionStatus;
    final: boolean;
    approved: boolean;
    provider: string;
    provider_status: string | null;
    needs_attention: boolean;
    auth_code: string | null;
    card_brand: string | null;
    masked_pan: string | null;
    acquirer_transaction_id: string | null;
    error: string | null;
    expires_at: string | null;
    settled_at: string | null;
    created_at: string | null;
    // Payments list fields.
    point_of_sale_name?: string | null;
    manual_confirmation?: boolean;
    note?: string | null;
    refunded_amount?: string;
    refundable_amount?: string;
    refunds?: { amount: string; refund_id?: string; status?: string; refunded_at?: string }[];
    late_results_count?: number;
    /** Whether this user may refund it from the list, or why not (already translated). */
    refund?: { allowed: boolean; hint: string | null };
}

/** A point of sale the user sees, for the payments list filter. */
export interface PosPointOfSaleOption {
    id: number | string;
    name: string;
    tenant_id: string | null;
    connector: string | null;
    active: boolean;
}

export interface PosTransactionFilters {
    point_of_sale_id?: number | string;
    status?: string;
    provider?: string;
    reference_type?: string;
    reference?: string;
    from?: string;
    to?: string;
    attention?: boolean;
    late?: boolean;
    page?: number;
    per_page?: number;
}

export interface PosTransactionPage {
    data: PosTransaction[];
    total: number;
    page: number;
    per_page: number;
}

/**
 * Any axios-shaped client: `{data}` on success; on failure an error with `response.{status,data}`
 * (no `response` = the network failed). DashAdmin's axios fits; so does a small fetch wrapper.
 */
export interface PosHttp {
    get(url: string, config?: { params?: object }): Promise<{ data: any }>;
    post(url: string, body?: object): Promise<{ data: any }>;
    put(url: string, body?: object): Promise<{ data: any }>;
}
