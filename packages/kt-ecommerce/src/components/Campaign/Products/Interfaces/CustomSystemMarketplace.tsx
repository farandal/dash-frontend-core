import { SystemMarketplace } from "@kt-ecommerce/interfaces";

export interface CustomSystemMarketplace extends SystemMarketplace {
    campaign_marketplace_id?: number,
    tenant_system_marketplace_id?: number
}

export default CustomSystemMarketplace; 