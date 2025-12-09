import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CurrentPeriodSales from 'kt-cashcount/src/components/CurrentPeriodSales';
import { useNavigate } from 'react-router';

import {DASHAppConstants} from 'dash-constants';

const dashboardResources: IDashAutoAdminResourceConfig[] = [{
  roles: [DASHAppConstants.system.TENANT_ROLE],
  component: ResourceTemplate,
  listComponent: (resourceConfig) => {
    return <CurrentPeriodSales />
  },
  model: 'dash',
  label: 'Dash',
  schema: [],
  icon: <LeaderboardIcon />,
  group: 'Panel',
  menu: [],
  resourceMenuDisabled: true,

},
{
 roles: ["Mall"],
  component: ResourceTemplate,
  listComponent: (resourceConfig) => {
    return <>Mall panel</>
  },
  model: 'mall/dash',
  label: 'Dash',
  schema: [],
  icon: <LeaderboardIcon />,
  group: 'Panel',
  menu: [],
  resourceMenuDisabled: true,

}
];

export default dashboardResources;
