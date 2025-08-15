import { IUserSettings } from "../interfaces/user/IUserSettings"
import { dashStorage } from 'dash-utils';
const getUserSettings = ():IUserSettings => {
  const auth = JSON.parse(dashStorage.getItem('userSettings')) as IUserSettings;
  return auth;
}

export default getUserSettings;