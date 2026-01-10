import { Tab, useTranslate } from 'react-admin';
import { AttributeToField } from './AttributeToField';
import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from '../interfaces/IDashAutoAdminFormOptions';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import groupByTabs from '../utils/groupByTabs';
//import { TabbedShowLayout } from 'react-admin';

export const AutoTabs = (
	resourceConfig: IDashAutoAdminResourceConfig,
	schema: IDashAutoAdminAttribute[],
	options?: IDashAutoAdminFormOptions,
) => {
    const translate = useTranslate();
	return groupByTabs(schema).map((groupOfAttributes) => {
		const label = groupOfAttributes[0].tab || options?.label || '';
        const translatedLabel = translate(`dash-auto-admin-tabs.${label}`, { _: label });
		//   console.log("TAB", label);
		return (
			<Tab  key={'tab_' + label} label={translatedLabel}>
              
				{groupOfAttributes
					.filter((attribute) => attribute?.inShow !== false)
					.map((attribute, idx) =>
						AttributeToField('view', resourceConfig, attribute, idx, options),
					)}
			</Tab>
		);
	});
};

export default AutoTabs;
