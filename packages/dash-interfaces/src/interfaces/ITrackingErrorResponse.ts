import { IPackage } from "./IPackage";

export interface ITrackingErrorResponse {
	/** */
	message: string;
	/** */
	copy_method: number;
	/** */
	modal: boolean;
	/** */
	package?: IPackage;
	/** */
	packages?: IPackage[];
}

export default ITrackingErrorResponse;
