import Dashboard from '@mui/icons-material/Dashboard';
import Notifications from '@mui/icons-material/Notifications';
import LocationCity from '@mui/icons-material/LocationCity';
import Person from '@mui/icons-material/Person';
import MenuOpenOutlined from '@mui/icons-material/MenuOpenOutlined';
import { IAppResourceGroupsIcon } from 'dash-admin/src/DASHAdmin';

const dashDefaultResourceIcons: IAppResourceGroupsIcon = {
    'Administration': <Dashboard />,
    'Administración': <Dashboard />,
    'Logs and Notifications': <Notifications />,
    'Logs y Notificaciones': <Notifications />,
    'System Resources': <LocationCity />,
    'Recursos de sistema': <LocationCity />,
    'Users': <Person />,
    'Usuarios': <Person />,
    'Client': <Person />,
    'Cliente': <Person />,
    'Actions': <MenuOpenOutlined />,
    'Acciones': <MenuOpenOutlined />,
};

export default dashDefaultResourceIcons;
