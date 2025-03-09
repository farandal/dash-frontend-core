import IMenuItem from "./IMenuItem";

interface ICollapsableSidebarMenu {
	item: IMenuItem;
	showIcon?: boolean;
	className?: string;
	navExpanded: boolean;
	navSize: "small" | "large";
	level: number;
}

export default ICollapsableSidebarMenu;