import { SimpleShowLayout } from 'react-admin';
import AutoTabs from './DashAutoTabs';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { AttributeToField } from './mui/AttributeToField';
import hashedGroupByTabs from './utils/hashedGroupByTabs';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import { JSX } from 'react';

export interface IDashAutoLayoutRenderFunction {
	(
		tab: string,
		options?: IDashAutoAdminFormOptions,
		forceAttributeToFieldMethod?: 'view' | 'list' | 'create' | 'edit',
	): JSX.Element[];
}

const DashAutoLayout = (resourceConfig: IDashAutoAdminResourceConfig) => {
	const renderShow: IDashAutoLayoutRenderFunction = (
		tab,
		options,
		forceAttributeToFieldMethod,
	): JSX.Element[] => {
		const groupedTabs = hashedGroupByTabs(resourceConfig.schema);

		const groupedAttributesByTab = groupedTabs[tab] ? groupedTabs[tab] : [];
		return groupedAttributesByTab
			.filter((attribute) => attribute?.inShow !== false)
			.map((attribute, idx) =>
				AttributeToField(
					forceAttributeToFieldMethod || 'view',
					resourceConfig,
					attribute,
					idx,
					options,
				),
			);
	};

	if (
		!resourceConfig.showLayout ||
		typeof resourceConfig.showLayout !== 'function'
	) {
		console.error(
			'showLayout must be present and be a function in the resource definition when using formGroupMode layout, fallback to tabs',
		);
		return AutoTabs(resourceConfig);
	}

	return (
		<SimpleShowLayout>{resourceConfig.showLayout(renderShow)}</SimpleShowLayout>
	);
};

export default DashAutoLayout;
