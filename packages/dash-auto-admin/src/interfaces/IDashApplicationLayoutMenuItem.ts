/**
 * Interface representing a menu item in the application layout
 */
export default interface IApplicationLayoutMenuItem {
	/**
	 * The display text of the menu item
	 */
	title: string;

	/**
	 * Optional click handler function for the menu item
	 */
	onClick?: Function;

	/**
	 * Optional URL or path to redirect to when menu item is clicked
	 */
	redirect?: string;

	/**
	 * Optional icon identifier for the menu item
	 */
	icon?: string;
}