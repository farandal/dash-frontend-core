/**
 * Interface for defining the main action in a Dash application layout.
 */
export default interface IDashApplicationLayoutMainAction {
	/**
	 * The title of the main action.
	 */
	title: string;

	/**
     * @deprecated
	 * The type of the main action, which can be one of the following:
	 * 'link', 'text', 'ghost', 'default', 'primary', 'dashed'.
	 */
	type?: 'link' | 'text' | 'ghost' | 'default' | 'primary' | 'dashed';

	/**
	 * The icon associated with the main action.
	 */
	icon?: string;

	/**
     * @deprecated
	 * The function to be called when the main action is clicked.
	 */
	onClick?: Function;

	/**
	 * The URL to redirect to when the main action is triggered.
	 */
	redirect?: string;
    mode?: "create" | "show" | "edit"
	/**
	 * The function type, which can be either 'redirect' or 'virtualhash'.
	 */
	fn?: 'redirect' | 'virtualhash';
}
