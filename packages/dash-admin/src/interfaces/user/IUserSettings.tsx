import { IGetAuthUser } from './IUser';

export interface IUserSettings {
	accountTypes: AccountTypes
	banks: Banks
	communes: Communes
	user: IGetAuthUser
	driverPackageStatuses: DriverPackageStatuse[]
	noReceptionReasons: NoReceptionReason[]
	noReturnReasons: NoReturnReason[]
	notificationConfiguration: NotificationConfiguration
}

interface AccountTypes {
	[x:string]: string
}

interface Banks {
	[x:string]: string
}

interface Communes {
	[x:string]: string
}

interface DriverPackageStatuse {
	id: number
	name: string
}

interface NoReceptionReason {
	id: number
	name: string
}

interface NoReturnReason {
	id: number
	name: string
}

interface NotificationConfiguration {
	[x:string]: string
}
