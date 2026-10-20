import type { Connector, PaymentConfig, PosHttp, PosPointOfSaleOption, PosTransaction, PosTransactionFilters, PosTransactionPage, Terminal } from './types';

const unwrap = <T,>(body: any): T => (body && typeof body === 'object' && 'data' in body ? body.data : body);

/**
 * The calls of core app/PosPaymentCore. Starting a charge is the domain's own endpoint, not here.
 * `transactionsPath`: where a charge is followed — the staff API by default; a public screen (e.g.
 * a self-service session) passes its own, scoped route with the same show/refresh/cancel shape.
 */
export function createPosPaymentsApi(http: () => PosHttp, options: { transactionsPath?: string } = {}) {
    const tx = (options.transactionsPath ?? 'pos-payments/transactions').replace(/\/$/, '');
    const get = async <T,>(url: string) => unwrap<T>((await http().get(url)).data);
    const post = async <T,>(url: string, body?: object) => unwrap<T>((await http().post(url, body ?? {})).data);
    const put = async <T,>(url: string, body: object) => unwrap<T>((await http().put(url, body)).data);

    return {
        connectors: () => get<Connector[]>('pos-payments/connectors'),
        payment: (pointOfSaleId: number | string) => get<PaymentConfig>(`pos-payments/point-of-sales/${pointOfSaleId}/payment`),
        configure: (pointOfSaleId: number | string, body: { connector: string | null; params?: Record<string, unknown>; settings?: object; device_id?: string | null; verify?: boolean }) =>
            put<PaymentConfig>(`pos-payments/point-of-sales/${pointOfSaleId}/payment`, body),
        terminals: (pointOfSaleId: number | string) => get<Terminal[]>(`pos-payments/point-of-sales/${pointOfSaleId}/terminals`),
        transaction: (id: string) => get<PosTransaction>(`${tx}/${id}`),
        refresh: (id: string) => post<PosTransaction>(`${tx}/${id}/refresh`),
        cancel: (id: string) => post<PosTransaction>(`${tx}/${id}/cancel`),
        confirm: (id: string, note?: string) => post<PosTransaction>(`${tx}/${id}/confirm`, note ? { note } : {}),

        // The payments list (administrators).
        pointOfSales: () => get<PosPointOfSaleOption[]>('pos-payments/point-of-sales'),
        transactions: async (filters: PosTransactionFilters = {}): Promise<PosTransactionPage> => {
            const query = Object.entries(filters)
                .filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== false)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value === true ? '1' : String(value))}`)
                .join('&');
            // Not unwrapped: the page carries total/page next to data.
            return (await http().get(`pos-payments/transactions${query ? `?${query}` : ''}`)).data as PosTransactionPage;
        },
        refund: (id: string, amount?: string | number) => post<PosTransaction>(`pos-payments/transactions/${id}/refund`, amount !== undefined && amount !== '' ? { amount } : {}),
    };
}

export type PosPaymentsApi = ReturnType<typeof createPosPaymentsApi>;

/** A readable message from an API error (validation first, then the message). */
export function posErrorMessage(error: any, fallback = 'Error'): string {
    const body = error?.response?.data;
    const first = body?.errors && Object.values(body.errors).flat()[0];

    return (typeof first === 'string' && first) || body?.message || error?.message || fallback;
}
