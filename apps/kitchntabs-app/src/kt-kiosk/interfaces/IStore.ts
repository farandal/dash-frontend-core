export interface IStore {
    id: number;
    name: string;
    public_id: string;
    public_name?: string;
    address?: string;
    phone?: string;
    mobile?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    settings: {
        colors?: Record<string, string>;
        [key: string]: any;
    };
    banner_url?: string;
    horizontal_logo_url?: string;
    squared_logo_url?: string;
    currencies: Array<{
        id: number;
        code: string;
        symbol: string;
        format: string;
    }>;
    systemMarketplaces: Array<{
        id: number;
        name: string;
        icon_url?: string;
        [key: string]: any;
    }>;
    systemPointOfSales: Array<{
        id: number;
        name: string;
        icon_url?: string;
        [key: string]: any;
    }>;
}
