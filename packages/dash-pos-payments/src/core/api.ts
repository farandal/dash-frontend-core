import type { Connector, PaymentConfig, PosHttp, PosTransaction, Terminal } from './types';

const unwrap = <T,>(body: any): T => (body && typeof body === 'object' && 'data' in body ? body.data : body);

/** The calls of core app/PosPaymentCore. Starting a charge is the domain's own endpoint, not here. */
export function createPosPaymentsApi(http: () => PosHttp) {
    const get = async <T,>(url: string) => unwrap<T>((await http().get(url)).data);
    const post = async <T,>(url: string, body?: object) => unwrap<T>((await http().post(url, body ?? {})).data);
    const put = async <T,>(url: string, body: object) => unwrap<T>((await http().put(url, body)).data);

    return {
        connectors: () => get<Connector[]>('pos-payments/connectors'),
        payment: (pointOfSaleId: number | string) => get<PaymentConfig>(`pos-payments/point-of-sales/${pointOfSaleId}/payment`),
        configure: (pointOfSaleId: number | string, body: { connector: string | null; params?: Record<string, unknown>; settings?: object; device_id?: string | null; verify?: boolean }) =>
            put<PaymentConfig>(`pos-payments/point-of-sales/${pointOfSaleId}/payment`, body),
        terminals: (pointOfSaleId: number | string) => get<Terminal[]>(`pos-payments/point-of-sales/${pointOfSaleId}/terminals`),
        transaction: (id: string) => get<PosTransaction>(`pos-payments/transactions/${id}`),
        refresh: (id: string) => post<PosTransaction>(`pos-payments/transactions/${id}/refresh`),
        cancel: (id: string) => post<PosTransaction>(`pos-payments/transactions/${id}/cancel`),
        confirm: (id: string, note?: string) => post<PosTransaction>(`pos-payments/transactions/${id}/confirm`, note ? { note } : {}),
    };
}

export type PosPaymentsApi = ReturnType<typeof createPosPaymentsApi>;

/** A readable message from an API error (validation first, then the message). */
export function posErrorMessage(error: any, fallback = 'Error'): string {
    const body = error?.response?.data;
    const first = body?.errors && Object.values(body.errors).flat()[0];

    return (typeof first === 'string' && first) || body?.message || error?.message || fallback;
}
