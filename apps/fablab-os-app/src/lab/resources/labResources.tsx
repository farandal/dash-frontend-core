import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { AgenticWindow } from '../components/AgenticWindow';
import LabProjectResource from './labProjectResource';
import AgentConfigResource from './agentConfigResource';
import McpServerResource from './mcpServerResource';

/**
 * Wrap LabProjectResource with a custom showComponent that renders
 * the AgenticWindow (3-panel layout: documents | chat | MCP tools).
 */
const LabProjectResourceWithWindow: IDashAutoAdminResourceConfig = {
    ...LabProjectResource,
    showComponent: (resourceConfig) => {
        // The record id is resolved from the URL by React Admin.
        // We use a wrapper that reads the id from the URL.
        const LabProjectShow = () => {
            const id = window.location.pathname.split('/').filter(Boolean).pop() ?? '';
            return (
                <AgenticWindow
                    projectId={id}
                    projectName="Lab Project"
                />
            );
        };
        return <LabProjectShow />;
    },
    // Enable full-page show (no drawer)
    view: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: false, // show opens as a full page, not a drawer
    },
};

/**
 * All Lab resources exported as an array for easy registration.
 */
const LabResources: IDashAutoAdminResourceConfig[] = [
    LabProjectResourceWithWindow,
    AgentConfigResource,
    McpServerResource,
];

export default LabResources;
