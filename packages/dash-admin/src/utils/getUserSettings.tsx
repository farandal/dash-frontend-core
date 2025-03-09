import { IUserSettings } from "dash-admin/src/interfaces/user/IUserSettings"

const getUserSettings = ():IUserSettings => {
  const auth = JSON.parse(localStorage.getItem('userSettings')) as IUserSettings;
  return auth;
}

export default getUserSettings;