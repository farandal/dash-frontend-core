export default interface IUser {
	id: number;
	name: string;
	email: string;
	avatar_path?: string;
	created_at: string;
	updated_at: string;
	deleted_at: string;
	email_verified_at: string;
	roles: any[];
	tenant_id: number;
}
export interface IRole {
	id: number
	name: string
	guard_name: string
	level: number
	created_at: string
	updated_at: string
}
export interface IGetAuthUer {
	tenant_id?: number;
	id: number
	name: string
	lastname: string
	full_name: string
	email: string
	email_verified_at: string
	public_id: string
	phone: string
	avatar: string
	image_url: string
	active: boolean
	account_type_id: any
	account_number: any
	detail: any
	address: any
	address_geocoded: any
	roles: IRole[]
	role_id: number
	commune_id: any
	client_id: any
	bank_id: any
	sms_notification: boolean
	postulant: any
	driver_type_id: any
	vehicle_type_id: any
	auto_disable: any
	webhook_token: any
	print_label_pagination_limit: number
	role_ids: number[]
	created_at: string
	updated_at: string
	deleted_at: any
	client: any
	notificationConfigurations: any[]
}