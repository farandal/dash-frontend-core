import { systemResources } from 'dash-admin';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import todoResource from '../resources/demo/todoResource';

const DefaultPrivateResources: IDashAutoAdminResourceConfig[] = [
            ...systemResources,
            todoResource,
        ];

export default DefaultPrivateResources;
