import IAuthState from './IAuthState';
import ICommonState from './ICommonState';
import IPageState from './IPage';
import ISettingsState from './ISettings';
import IFormDataState from './IFormDataState';
import { IMenuState } from '../reducers/Menu';
import IComponentDataState from './IComponentData';
/**
 * Represents the overall state of the DASH application.
 *
 * @template U - The type of the user object.
 * @template A - The type of the authentication object.
 * @template R - The type of the resource items.
 */
export interface IDASHAppState<U, A, R> {
  /**
  * The state of the current page in the DASH application.
  */
  page: IPageState;
  /**
  * The state of the application settings for the DASH application.
  */
  settings: ISettingsState;
  /**
  * The state of the authentication for the DASH application.
  */
  auth: IAuthState<U, A>;
  /**
  * The common state of the DASH application.
  */
  common: ICommonState;
  /**
  * IDashAutoResourceConfig or IDashAutoResourceConfig extended class, The resources property of the IDASHAppState interface, which contains an array of resource items of type R.
  */
  resources: { items: R[] };
  /**
   * The state of the current dirty form in the DASH application.
   */
  formData: IFormDataState;

  /**
   * The menu state of the DASH application.
  */
  menu?: IMenuState;

  /**
   * Generic store for DASH component.
  */
  componentData: IComponentDataState;

}

export default IDASHAppState;
