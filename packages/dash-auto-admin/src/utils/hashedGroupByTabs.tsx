import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';

const hasehdGroupByTabs = (
	schema: IDashAutoAdminAttribute[],
): Array<{ [key: string]: IDashAutoAdminAttribute[] }> => {
	const tabs: Array<{ [key: string]: IDashAutoAdminAttribute[] }> = [];
	const availabletabs = [...new Set(schema.map((item) => item.tab))];

	availabletabs.forEach((tab) => {
		tabs[tab] = schema.filter((item) => item.tab === tab);
	});

	return tabs;
};

export default hasehdGroupByTabs;
