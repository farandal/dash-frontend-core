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
        // Translate the tab label. The EDIT form tab renderers (DashAutoFormTabs)
        // and react-admin's <FormTab> translate the raw tab value/key directly, but
        // this SHOW renderer historically only looked up the legacy
        // `dash-auto-admin-tabs.<label>` namespace — so a schema tab set to a real
        // translation key (e.g. "resource.x.tabs.y") rendered translated in edit but
        // raw in show. Try the raw key first (consistent with edit + react-admin),
        // then fall back to the legacy prefixed namespace, then the raw label text.
        const directLabel = translate(label, { _: '' });
        const translatedLabel = directLabel || translate(`dash-auto-admin-tabs.${label}`, { _: label });
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
