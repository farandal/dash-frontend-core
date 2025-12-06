import { DashAutoReferenceTab, DashAutoTabs } from '.';
import AutoTitle from './common/DashAutoTitle';
import IAutoShow from './interfaces/IDashAutoShow';
import AutoLayout from './DashAutoLayout';
import AutoGroup from './DashAutoGroup';

import { TopToolbar, Show } from 'react-admin';
//import { ShowBase } from 'react-admin';
import {
	ToolbarCreateButton,
	ToolbarDeleteButton,
	ToolbarEditButton,
	ToolbarExportButton,
	ToolbarListButton,
} from './toolbar/buttons/ToolbarButtons';
import { ReactNode } from 'react';
import React from 'react';

const DashAutoShow: React.FC<IAutoShow> = ({
	resourceConfig,
	id,
	isDrawer = false,
	...props
}) => {

	const topToolbarActions = () => {
		
		const componentsList = (): any[] => {
			const result: ReactNode[] = [];
			if (!isDrawer) {
				result.push(<ToolbarListButton resourceConfig={resourceConfig} />);
				result.push(<ToolbarEditButton resourceConfig={resourceConfig} />);
				result.push(<ToolbarCreateButton resourceConfig={resourceConfig} />);
				result.push(<ToolbarDeleteButton resourceConfig={resourceConfig} />);
				result.push(<ToolbarExportButton resourceConfig={resourceConfig} />);
			}
			return result;
		};

		const components = componentsList();

		return components;
	};

	const topToolbarActionsArray = topToolbarActions();

	if (
		resourceConfig.showComponent &&
		typeof resourceConfig.showComponent === 'function'
	) {
		return (
			<Show
				{...(id && { id })}
				title={<AutoTitle resourceConfig={resourceConfig} />}
				{...props}
				{...topToolbarActionsArray.length && {
					actions: (
						<TopToolbar sx={{ mb: 2 }}>
							{topToolbarActionsArray.map((component, idx) => {
								return React.cloneElement(component, { key: idx });
							},
							)}
						</TopToolbar>
					),
				}}
			>
				{resourceConfig.showComponent(resourceConfig)}
				{resourceConfig.references &&
					resourceConfig.references.map((reference) =>
						DashAutoReferenceTab(reference),
					)}
			</Show>
		);
	}

	if (resourceConfig.formGroupMode === 'tabs') {
		return (
			<Show
				{...(id && { id })}
				title={<AutoTitle resourceConfig={resourceConfig} />}
				{...props}
				{...topToolbarActionsArray.length && {
					actions: (
						<TopToolbar sx={{ mb: 2 }}>
							{topToolbarActionsArray.map((component, idx) => {
								return React.cloneElement(component, { key: idx });
							},
							)}
						</TopToolbar>
					),
				}}
			>
				{DashAutoTabs(resourceConfig)}
				{resourceConfig.references &&
					resourceConfig.references.map((reference) =>
						DashAutoReferenceTab(reference),
					)}
			</Show>
		);
	}

	if (resourceConfig.formGroupMode === 'groups') {
		return (
			<Show
				{...(id && { id })}
				title={<AutoTitle resourceConfig={resourceConfig} />}
				{...props}
				{...topToolbarActionsArray.length && {
					actions: (
						<TopToolbar sx={{ mb: 2 }}>
							{topToolbarActionsArray.map((component, idx) => {
								return React.cloneElement(component, { key: idx });
							},
							)}
						</TopToolbar>
					),
				}}
			>
				{AutoGroup(resourceConfig)}
				{resourceConfig.references &&
					resourceConfig.references.map((reference) =>
						DashAutoReferenceTab(reference),
					)}
			</Show>
		);
	}

	if (resourceConfig.formGroupMode === 'layout') {
		return (
			<Show
				{...(id && { id })}
				title={<AutoTitle resourceConfig={resourceConfig} />}
				{...props}
				{...topToolbarActionsArray.length && {
					actions: (
						<TopToolbar sx={{ mb: 2 }}>
							{topToolbarActionsArray.map((component, idx) => {
								return React.cloneElement(component, { key: idx });
							},
							)}
						</TopToolbar>
					),
				}}
			>
				{AutoLayout(resourceConfig)}
				{resourceConfig.references &&
					resourceConfig.references.map((reference) =>
						DashAutoReferenceTab(reference),
					)}
			</Show>
		);
	}

	return (
		<Show
			{...(id && { id })}
			title={<AutoTitle resourceConfig={resourceConfig} />}
			{...props}
			{...topToolbarActionsArray.length && {
				actions: (
					<TopToolbar sx={{ mb: 2 }}>
						{topToolbarActionsArray.map((component, idx) => {
							return React.cloneElement(component, { key: idx });
						},
						)}
					</TopToolbar>
				),
			}}
		>
			{DashAutoTabs(resourceConfig)}
			{resourceConfig.references &&
				resourceConfig.references.map((reference) =>
					DashAutoReferenceTab(reference),
				)}
		</Show>
	);
};

export default DashAutoShow;
