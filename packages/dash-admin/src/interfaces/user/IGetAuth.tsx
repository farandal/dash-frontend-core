import { IGetAuthUer } from './IUser';

export interface IGetAuth {
	accountTypes: AccountTypes
	banks: Banks
	communes: Communes
	user: IGetAuthUer
	driverPackageStatuses: DriverPackageStatuse[]
	noReceptionReasons: NoReceptionReason[]
	noReturnReasons: NoReturnReason[]
	notificationConfiguration: NotificationConfiguration
}

export interface AccountTypes {
	[x:string]: string
}

export interface Banks {
	[x:string]: string
}

export interface Communes {
	[x:string]: string
}

export interface User {
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
	can_enter_xl: boolean
	roles: Role[]
	role_id: number
	commune_id: any
	client_id: any
	bank_id: any
	sms_notification: boolean
	postulant: any
	driver_type_id: any
	vehicle_type_id: any
	isRutero: any
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

export interface Role {
	id: number
	name: string
	guard_name: string
	level: number
	created_at: string
	updated_at: string
}

export interface DriverPackageStatuse {
	id: number
	name: string
}

export interface NoReceptionReason {
	id: number
	name: string
}

export interface NoReturnReason {
	id: number
	name: string
}

export interface NotificationConfiguration {
	[x:string]: string
}
