import { ITenantSettings } from "../interfaces/user/ITenantSettings"

const getTenantSettings = ():ITenantSettings => {
  const auth = JSON.parse(localStorage.getItem('tenantSettings')) as ITenantSettings;
  return auth;
}

export default getTenantSettings;