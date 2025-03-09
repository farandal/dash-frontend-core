import { JSX } from "react";

interface IMenuItem {
	group: string;
	model: string;
	label: string;
	txtLabel: string;
	key: React.Key;
	to?: string;
	icon?: JSX.Element;
	children?: IMenuItem[];
	type?: 'group';
	selected?: boolean;
}

export default IMenuItem