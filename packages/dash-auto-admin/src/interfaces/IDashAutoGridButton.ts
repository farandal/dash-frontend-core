export default interface IAutoGridButton {
	/** */
	enabled?: boolean;
	/** */
	props?: any;
	/** */
	component?: any;
	/** */
	modes?: {
		/** */
		list?: boolean;
		/** */
		view?: boolean;
		/** */
		edit?: boolean;
		/** */
		show?: boolean;
	};
    size?: 'small' | 'medium' | 'large';

}


export interface IViewAutoGridButton extends IAutoGridButton {
	/** */
	confirm?: boolean
}
export interface IEditAutoGridButton extends IAutoGridButton {
	/** */
	confirm?: boolean
}
export interface IDeleteAutoGridButton extends IAutoGridButton {
	/** */
	confirm?: boolean
}
