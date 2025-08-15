import { ITenantSettings } from "../interfaces/user/ITenantSettings"
import { dashStorage } from 'dash-utils';

const getTenantSettings = ():ITenantSettings => {
  const auth = JSON.parse(dashStorage.getItem('tenantSettings')) as ITenantSettings;
  return auth;
}

export default getTenantSettings;