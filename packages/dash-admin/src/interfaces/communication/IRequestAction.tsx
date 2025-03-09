export interface IRequestAction {
	ACTION: string;
	SUCCESS: string;
	FAILURE: string;
	PATH?: string;
	METHOD?: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'UPDATE' | 'DELETE';
	AUTH?: boolean;
	PARSER?: (json: Object) => Object;
	ERROR_PARSER?: (json: Object) => Object;
}
