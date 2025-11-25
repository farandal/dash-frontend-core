export interface Tenant {
	id: number;
	name: string;
	public_id: string;
	settings: any;
	attributes: any;
	banner_url: string;
	horizontal_logo_url: string;
	squared_logo_url: string | null;
	images: {
		banner: {
			original: string;
		};
		horizontal_logo: {
			original: string;
		};
		squared_logo: any[];
	};
	currencies: any[];
	currency_primary_id: number | null;
	currency_ids: number[];
	systemMarketplaces: any[];
	systemPointOfSales: any[];
}
