export interface ILog {
	date: string;
	filepath: string;
	id: number;
	json: any;
	name: string;
	tenant_id: number;
	type: string;
}
export interface ILogTxtFileComponent {
	log: ILog;
}

export interface IProductImportLogComponent {
	logs: ILog[];
}
