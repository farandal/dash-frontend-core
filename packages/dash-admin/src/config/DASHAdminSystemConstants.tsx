/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * @author Francisco Aranda - @farandal - http://www.linkedin.com/in/farandal
 * Francisco.aranda@dash.cl.
 * created Date 2022-07-14 15:00:00.
 */

const getEnvironmentVariable = (environmentVariable: string): string => {
  /* @ts-ignore Expected access to process */
  const unvalidatedEnvironmentVariable = process.env[environmentVariable];
  /*if (!unvalidatedEnvironmentVariable) {
    throw new Error(
      `Couldn't find environment variable: ${environmentVariable}`,
    );
  } else {
    return unvalidatedEnvironmentVariable;
  }*/
  return unvalidatedEnvironmentVariable || null;
};


export const getEnv = (key: string) => {
  /* @ts-ignore Expected access to process */
  const PREFIX = process.env.ENV_PREFIX || process.env.NEXT_PUBLIC_ENV_PREFIX || process.env.VITE_ENV_PREFIX || process.env.REACT_ENV_PREFIX || '';
  //console.log('GET ENV', PREFIX, key);

  if (PREFIX === 'NEXT_PUBLIC_') {
    return getEnvironmentVariable(PREFIX + key);
  }
  /* @ts-ignore Expected access to process */
  return process.env[PREFIX + key] || null;
};

const system = {
  API_URL: getEnv('APP_BACKEND_URL') || 'http://localhost:8000',
  SOCKET_URL: (getEnv('APP_SOCKETS_HOST') || (typeof window !== 'undefined' ? window.location.hostname : 'localhost')) + (getEnv('APP_SOCKETS_PORT') ? ':' + getEnv('APP_SOCKETS_PORT') : ''), 
  SOCKETS_ENABLED: JSON.parse(getEnv('APP_SOCKETS_ENABLED')) || false,
  SOCKETS_BROADCASTER: getEnv('APP_SOCKETS_BROADCASTER') || 'pusher',
  SOCKETS_KEY: getEnv('APP_SOCKETS_KEY') || 'dash',
  ADMIN_API_URL: getEnv('APP_ADMIN_API_URL'),
  DEBUG: true, // String(getEnv("APP_DEBUG")) === 'true' ? true : false,
  SHOW_GLOBAL_TOAST_ERROR: false,
  SHOW_GLOBAL_DIALOG_ERROR: true,
  DASH_SYSTEM_ROLE: getEnv('DASH_SYSTEM_ROLE') || 'System',
  DASH_ADMIN_ROLE: getEnv('DASH_ADMIN_ROLE') || 'Administrator',
  HAS_ADMINISTRATOR_ID_ROLE: 'HasAdministratorId',
  ENABLE_TENANT_LOGIC: getEnv('ENABLE_TENANT_LOGIC') || true,
  ENABLE_TENANT_IMPERSONATION: getEnv('ENABLE_TENANT_LOGIC') || true,
  ENABLE_LOGS_AND_NOTIFICATIONS: getEnv('ENABLE_LOGS_AND_NOTIFICATIONS') || false,
  DEFAULT_PER_PAGE: Number(getEnv('DEFAULT_PER_PAGE')) || null,
  URL_PREFIX: getEnv('DASH_ADMIN_URL_PREFIX') || '#/',
  //PAGE_TRANSITIONS: JSON.parse(getEnv('PAGE_TRANSITIONS')) || false,
  PAGE_TRANSITIONS: false,

  APP_VERSION: getEnv('APP_VERSION') || '1.0.0',
  BUILD_TIME: getEnv('BUILD_TIME') || new Date().toISOString(),
  IS_ELECTRON: JSON.parse(getEnv('IS_ELECTRON')) || false,
  PLATFORM: getEnv('PLATFORM') || "unknown",
  IS_WINDOWS: JSON.parse(getEnv('IS_WINDOWS')) || false,
  IS_MAC: JSON.parse(getEnv('IS_MAC')) || false,
  IS_LINUX: JSON.parse(getEnv('IS_LINUX')) || false,
  PLATFORM_TYPE: getEnv('PLATFORM_TYPE') || "browser",
};

const panel = {
  SIDEBAR_WIDTH: getEnv('SIDEBAR_WIDH') || 256,
  SIDEBAR_COLLAPSED_WIDTH: getEnv('SIDEBAR_COLLAPSED_WIDH') || 63,
  TAB_SIZE: 992,
  MOBILE_SIZE: 575,
  THEME_TYPE: 'THEME_TYPE',
  THEME_TYPE_LIGHT: 'light',
  THEME_TYPE_DARK: 'dark',
  THEME_TYPE_DASH_DEFAULT: 'light',
  THEME_TYPE_SEMI_DARK: 'THEME_TYPE_SEMI_DARK',
  THEME_COLOR: 'THEME_COLOR',
  UPDATE_RTL_STATUS: 'UPDATE_RTL_STATUS',
  LAYOUT_TYPE: 'LAYOUT_TYPE',
  LAYOUT_TYPE_FRAMED: 'framed-layout',
  LAYOUT_TYPE_BOXED: 'boxed-layout',
  LAYOUT_TYPE_FULL: 'full-layout',
  NAV_STYLE: 'NAV_STYLE',
  NAV_STYLE_FIXED: 'NAV_STYLE_FIXED',
  NAV_STYLE_MINI_SIDEBAR: 'NAV_STYLE_MINI_SIDEBAR',
  NAV_STYLE_DRAWER: 'NAV_STYLE_DRAWER',
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR: 'NAV_STYLE_NO_HEADER_MINI_SIDEBAR',
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR: 'NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR',
  NAV_STYLE_DEFAULT_HORIZONTAL: 'NAV_STYLE_DEFAULT_HORIZONTAL',
  NAV_STYLE_DARK_HORIZONTAL: 'NAV_STYLE_DARK_HORIZONTAL',
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL: 'NAV_STYLE_INSIDE_HEADER_HORIZONTAL',
  NAV_STYLE_BELOW_HEADER: 'NAV_STYLE_BELOW_HEADER',
  NAV_STYLE_ABOVE_HEADER: 'NAV_STYLE_ABOVE_HEADER',
  NAV_STYLE_COLLAPSABLE: 'NAV_STYLE_COLLAPSABLE',
  LIGHT_PURPLE: 'light_purple',
  LIGHT_PURPLE_SEC: '#00B378',
  LIGHT_PURPLE_DARK_TEXT_COLOR: '#9799AC',
  RED: 'red',
  RED_SEC: '#00D9C9',
  RED_DARK_TEXT_COLOR: '#878BAB',
  BLUE: 'blue',
  BLUE_SEC: '#FCB53B',
  BLUE_DARK_TEXT_COLOR: '#AAA59A',
  DARK_BLUE: 'dark_blue',
  DARK_BLUE_SEC: '#17BDE5',
  DARK_BLUE_DARK_TEXT_COLOR: '#9DDAE9',
  ORANGE: 'orange',
  ORANGE_SEC: '#F1D065',
  ORANGE_DARK_TEXT_COLOR: '#ABA895',
  LIGHT_BLUE: 'light_blue',
  LIGHT_BLUE_SEC: '#59DCFF',
  LIGHT_BLUE_DARK_TEXT_COLOR: '#92A2C8',
  DEEP_ORANGE: 'deep_orange',
  DEEP_ORANGE_SEC: '#70A288',
  DEEP_ORANGE_DARK_TEXT_COLOR: '#97B8C7',
  LIGHT_PURPLE_1: 'light_purple_1',
  LIGHT_PURPLE_1_SEC: '#E14594',
  LIGHT_PURPLE_1_DARK_TEXT_COLOR: '#8288B4',
  LIGHT_PURPLE_2: 'light_purple_2',
  LIGHT_PURPLE_2_SEC: '#64D7D6',
  LIGHT_PURPLE_2_DARK_TEXT_COLOR: '#5782BB',
  ACTIVE_COLOR_OPTION: '#ffffff'
};

const dict = {
  SYSTEM_FORM_DEFAULT_SELECT_OPTION: 'Seleccione una opción',
  NO_AVAILABLE_NOTIFICATIONS: 'No hay notificaciones nuevas',
  ALL_NOTIFICATIONS: 'Todas las notificaciones',
  NOTIFICATIONS_WIDGET_TITLE: 'Notificaciones',
  type: 'Tipo',
  date: 'Fecha',
  name: 'Nombre',
  filepath: 'Archivo',
  json: 'Data',
  clientName: 'Cliente',
  withdrawsToday: 'Retiros Hoy',
  withdrawsYesterday: 'Retiros Ayer',
  withdrawsLastWeek: 'Retiros Última Semana',
  volumeCp: 'Volúmen',
  'validation.recaptcha': 'Recaptcha inválido',
};

const replacements = {
  profile: 'perfil',
};

const helpers = {
};

/*class constants {
  static system = system;
  static panel = panel;
  static dict = dict;
  static helpers = helpers;
  //static pushSystem(resources) { DASHStorageClass.resources = resources } 
}*/

const DASHAdminSystemConstants: IDASHAdminSystemConstants = {
  system: system,
  panel: panel,
  dict: dict,
  helpers: helpers,
  replacements: replacements,
  //static pushSystem(resources) { DASHStorageClass.resources = resources }
};

//import APP_SETTINGS from "@app/dash-settings";
export interface IDASHAdminSystemConstants {
  system: typeof system;
  panel: typeof panel;
  dict: typeof dict;
  helpers: typeof helpers;
  replacements: typeof replacements;
}

export default DASHAdminSystemConstants;
