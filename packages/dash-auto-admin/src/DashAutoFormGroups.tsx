import { AutoAdminSettings } from '.';
import IDashAutoAdminAttribute from './interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import groupByTabs from './utils/groupByTabs';
import { default as AttributeToInput } from './mui/AttributeToInput';
import React from 'react';
import { TranslatedLabel } from './common/components/TranslatedLabel';

// TODO: DEFAULT_TAB_LABEL should be get from a React Auto Admin config class.

interface IAutoForm {
	schema: IDashAutoAdminAttribute[],
	resourceConfig: IDashAutoAdminResourceConfig,
	options?: IDashAutoAdminFormOptions,
}

const DashAutoFormGroups = ({
    schema,
    resourceConfig,
    options
}: IAutoForm) => {
	const DEFAULT_TAB_LABEL = AutoAdminSettings?.defaultTabName || resourceConfig.label;
	
	// Helper to render translated legend
	const renderLegend = (label: string | undefined) => (
		<legend>
			<TranslatedLabel label={label} fallback={DEFAULT_TAB_LABEL} />
		</legend>
	);
  
	const isDrawer = options?.isDrawer === true ? true : false;

	/**
	 * AttributeToInput legitimately returns null/undefined for a field it
	 * has decided not to render — e.g. a 'select' with no `options` array logs
	 * "Skipping render" and returns null on purpose, rather than throwing, so a
	 * misconfigured field degrades instead of taking the API down with a bogus
	 * request. React.cloneElement has no such tolerance: it throws immediately
	 * on anything that is not a real element, which turned that intentional
	 * per-field skip into a crash of the ENTIRE surrounding form. This renders
	 * a field only when AttributeToInput actually returned one.
	 */
	const renderAttribute = (
		mode: string,
		resourceConfig: IDashAutoAdminResourceConfig,
		attribute: IDashAutoAdminAttribute,
		i: number,
		options: IDashAutoAdminFormOptions,
		key: string,
	) => {
		const rendered = AttributeToInput(mode as any, resourceConfig, attribute, i, options);
		return React.isValidElement(rendered) ? React.cloneElement(rendered, { key }) : null;
	};

	switch (options?.mode) {
		case 'create':
			return groupByTabs(schema).map((groupOfAttributes, idx) => {
				let attributes = groupOfAttributes;
				if (isDrawer)
					attributes = attributes.filter(
						(attribute) => attribute?.inDrawer !== false,
					);
				const filteredAttributes = attributes.filter((attribute) => attribute?.inCreate !== false);
				return filteredAttributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						{filteredAttributes.length > 0 && renderLegend(attributes[0].tab || options?.label)}
						{filteredAttributes.map((attribute, i) =>
							renderAttribute(options.mode, resourceConfig, attribute, i, options, `create-${idx}-${i}`),
						)}
					</fieldset>
				) : null;
			});

		case 'edit':
			return groupByTabs(schema).map((groupOfAttributes, idx) => {
				let attributes = groupOfAttributes;
				if (isDrawer)
					attributes = attributes.filter(
						(attribute) => attribute?.inDrawer !== false,
					);
				const filteredAttributes = attributes.filter((attribute) => attribute?.inEdit !== false);
				return filteredAttributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						{filteredAttributes.length > 0 && renderLegend(attributes[0].tab || options?.label)}
						{filteredAttributes.map((attribute, i) =>
							renderAttribute(options.mode, resourceConfig, attribute, i, options, `edit-${idx}-${i}`),
						)}
					</fieldset>
				) : null;
			});

		case 'view':
			return groupByTabs(schema).map((groupOfAttributes, idx) => {
				let attributes = groupOfAttributes;
				if (isDrawer)
					attributes = attributes.filter(
						(attribute) => attribute?.inDrawer !== false,
					);
				const filteredAttributes = attributes.filter((attribute) => attribute?.inShow !== false);
				return filteredAttributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						{filteredAttributes.length > 0 && renderLegend(attributes[0].tab || options?.label)}
						{filteredAttributes.map((attribute, i) =>
							renderAttribute(options.mode, resourceConfig, attribute, i, options, `view-${idx}-${i}`),
						)}
					</fieldset>
				) : null;
			});

		case 'list':
			return groupByTabs(schema).map((groupOfAttributes, idx) => {
				let attributes = groupOfAttributes;
				if (isDrawer)
					attributes = attributes.filter(
						(attribute) => attribute?.inDrawer !== false,
					);
				const filteredAttributes = attributes.filter((attribute) => attribute?.inShow !== false);
				return filteredAttributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						{filteredAttributes.length > 0 && renderLegend(attributes[0].tab || options?.label)}
						{filteredAttributes.map((attribute, i) =>
							renderAttribute(options.mode, resourceConfig, attribute, i, options, `list-${idx}-${i}`),
						)}
					</fieldset>
				) : null;
			});
	}
};

export default DashAutoFormGroups;