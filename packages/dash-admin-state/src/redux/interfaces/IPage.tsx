import { ReactNode } from 'react';

/**
 * Represents a single breadcrumb item in the navigation trail
 */
export interface IBreadcrumbItem {
	/** Display label for the breadcrumb */
	label: string;
	/** Navigation path (URL) for the breadcrumb. If undefined, item is not clickable */
	path?: string;
	/** Optional icon to display before the label */
	icon?: ReactNode;
	/** Whether this is the current/active breadcrumb */
	isActive?: boolean;
	/** Optional custom data for the breadcrumb */
	data?: Record<string, any>;
}

export interface IPageState {
	title?: string;
	icon?: React.ReactNode;
	subTitle?: string;
	/** Breadcrumb navigation trail */
	breadcrumbs?: IBreadcrumbItem[];
}

export default IPageState;
