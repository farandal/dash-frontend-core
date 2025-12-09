import { QrCode } from '@mui/icons-material';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import MallQRGenerator from './components/MallQRGenerator';

const MallAppResources: IDashAutoAdminResourceConfig[] = [
    {
        group: "Mall",
        roles: ["*"],
        component: ResourceTemplate,
        model: "qr",
        redirect: "/qr",
        label: "Ordena Aquí!",
        schema: [],
        icon: <QrCode />,
        listComponent: () => <MallQRGenerator />,
        toolbarCreateButton: { enabled: false },
        view: false,
        create: false,
        edit: false,
    },
];

export default MallAppResources;
