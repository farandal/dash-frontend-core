import { Currency } from "./ECommerce/Currency"

export interface ISystemMarketplace {
    class: string
    icon_path: string
    icon_url: string
    id: number
    name: string
}

export interface ISystemPointOfSale {
    class: string
    icon_path: string
    icon_url: string
    id: number
    name: string
}
/*
export interface ITenantSeetting {
    [x:string]:any
}
*/

export interface Tenant {
    id: number,        
    name: string,
    public_id: string,
    currencies?: Currency[],
    currency_primary_id?: number
    currency_ids?: number[],
    systemMarketplaces: ISystemMarketplace[]
    systemPointOfSales: ISystemPointOfSale[]
    settings: any[]
}  