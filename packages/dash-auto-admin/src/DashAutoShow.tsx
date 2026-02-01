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
import { ReactNode, useMemo } from 'react';
import React from 'react';

const DashAutoShow: React.FC<IAutoShow> = ({
	resourceConfig,
	id,
	isDrawer = false,
	locale,
	...props
}) => {

	// 🔧 Add contextComponent support for view/show mode (matching DashAutoTabbedForm pattern)
	const ContextComponent = useMemo(() => {
		return resourceConfig.contextComponent || (({children}: {children: ReactNode}) => <>{children}</>);
	}, [resourceConfig.contextComponent]);

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
             component="div"
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
				<ContextComponent mode="view" resourceConfig={resourceConfig}>
					{resourceConfig.showComponent(resourceConfig)}
					{resourceConfig.references &&
						resourceConfig.references.map((reference) =>
							DashAutoReferenceTab(reference),
						)}
				</ContextComponent>
			</Show>
		);
	}

	if (resourceConfig.formGroupMode === 'tabs') {
		return (
			<Show
            component="div"
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
				<ContextComponent mode="view" resourceConfig={resourceConfig}>
					{DashAutoTabs(resourceConfig, { mode: 'view', locale })}
					{resourceConfig.references &&
						resourceConfig.references.map((reference) =>
							DashAutoReferenceTab(reference),
						)}
				</ContextComponent>
			</Show>
		);
	}

	if (resourceConfig.formGroupMode === 'groups') {
		return (
			<Show
             component="div"
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
				<ContextComponent mode="view" resourceConfig={resourceConfig}>
					{AutoGroup(resourceConfig, { mode: 'view', locale })}
					{resourceConfig.references &&
						resourceConfig.references.map((reference) =>
							DashAutoReferenceTab(reference),
						)}
				</ContextComponent>
			</Show>
		);
	}

	if (resourceConfig.formGroupMode === 'layout') {
		return (
			<Show
             component="div"
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
				<ContextComponent mode="view" resourceConfig={resourceConfig}>
					{AutoLayout(resourceConfig, { mode: 'view', locale })}
					{resourceConfig.references &&
						resourceConfig.references.map((reference) =>
							DashAutoReferenceTab(reference),
						)}
				</ContextComponent>
			</Show>
		);
	}

	return (
		<Show
         component="div"
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
			<ContextComponent mode="view" resourceConfig={resourceConfig}>
				{DashAutoTabs(resourceConfig, { mode: 'view', locale })}
				{resourceConfig.references &&
					resourceConfig.references.map((reference) =>
						DashAutoReferenceTab(reference),
					)}
			</ContextComponent>
		</Show>
	);
};

export default DashAutoShow;
