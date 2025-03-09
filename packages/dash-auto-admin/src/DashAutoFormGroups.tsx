import { AutoAdminSettings } from '.';
import IDashAutoAdminAttribute from './interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import groupByTabs from './utils/groupByTabs';
import { default as AttributeToInput } from './mui/AttributeToInput';
import React from 'react';

// TODO: DEFAULT_TAB_LABEL should be get from a React Auto Admin config class.

const DashAutoFormGroups = (
	schema: IDashAutoAdminAttribute[],
	resourceConfig: IDashAutoAdminResourceConfig,
	options?: IDashAutoAdminFormOptions,
) => {
	const DEFAULT_TAB_LABEL = AutoAdminSettings?.defaultTabName || resourceConfig.label;
  
	const isDrawer = options.isDrawer === true ? true : false;

	switch (options.mode) {
		case 'create':
			return groupByTabs(schema).map((groupOfAttributes, idx) => {
				let attributes = groupOfAttributes;
				if (isDrawer)
					attributes = attributes.filter(
						(attribute) => attribute?.inDrawer !== false,
					);
				return attributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						<legend>
							{attributes[0].tab || options?.label || DEFAULT_TAB_LABEL}
						</legend>
						{attributes
							.filter((attribute) => attribute?.inCreate !== false)
							.map(
								(attribute, i) =>
									React.cloneElement(
										AttributeToInput(
											options.mode,
											resourceConfig,
											attribute,
											i,
											options,
										),
										{ key: `create-${idx}-${i}` },
									),
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

				return attributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						<legend>
							{attributes[0].tab || options?.label || DEFAULT_TAB_LABEL}
						</legend>
						{attributes
							.filter((attribute) => attribute?.inEdit !== false)
							.map((attribute, i) =>
								React.cloneElement(
									AttributeToInput(
										options.mode,
										resourceConfig,
										attribute,
										i,
										options,
									),
									{ key: `edit-${idx}-${i}` },
								),
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
				return attributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						<legend>
							{attributes[0].tab || options?.label || DEFAULT_TAB_LABEL}
						</legend>

						{attributes
							.filter((attribute) => attribute?.inShow !== false)
							.map((attribute, i) =>
								React.cloneElement(
									AttributeToInput(
										options.mode,
										resourceConfig,
										attribute,
										i,
										options,
									),
									{ key: `view-${idx}-${i}` },
								),
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
				return attributes.length ? (
					<fieldset key={`auto-admin-fieldset-${idx}`}>
						<legend>
							{attributes[0].tab || options?.label || DEFAULT_TAB_LABEL}
						</legend>

						{attributes
							.filter((attribute) => attribute?.inShow !== false)
							.map((attribute, i) =>
								React.cloneElement(
									AttributeToInput(
										options.mode,
										resourceConfig,
										attribute,
										i,
										options,
									),
									{ key: `list-${idx}-${i}` },
								),
							)}
					</fieldset>
				) : null;
			});
	}
};

export default DashAutoFormGroups;