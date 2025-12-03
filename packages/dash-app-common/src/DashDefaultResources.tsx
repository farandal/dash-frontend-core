import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import todoResource from './resources/demo/todoResource';
import systemResources from 'dash-admin/src/systemResources';

const DASHDefaultResources: IDashAutoAdminResourceConfig[] = [
            ...systemResources,
            todoResource,
        ];

export default DASHDefaultResources;
