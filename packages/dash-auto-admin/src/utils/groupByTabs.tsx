import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';

const groupByTabs = (
	schema: IDashAutoAdminAttribute[],
): IDashAutoAdminAttribute[][] => {
	const tabs: IDashAutoAdminAttribute[][] = [];
	schema.forEach((attribute) => {
		let added = false;
		tabs.forEach((tab) => {
			const name = tab[0].tab;
			if (name === attribute.tab) {
				tab.push(attribute);
				added = true;
			}
		});
		if (!added) {
			tabs.push([attribute]);
		}
	});
	return tabs;
};

export default groupByTabs;
