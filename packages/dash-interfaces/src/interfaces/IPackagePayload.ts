export interface IPackagePayload {
	/** */
	driver_delivery_id: number | string;
	/** */
	rutero_withdrawal_id: number | string;
	/** */
	driver_withdrawal_id: number | string;
	/** */
	code: number | string;
	/** */
	copy_method: number;
}

export default IPackagePayload;
