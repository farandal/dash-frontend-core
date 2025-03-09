# DASH ADMIN STATE

DashAdminState is a redux helper for essential data that requires to be shared across the Dash Admin application.

The redux store is structured as follows, many of this stores are internally used by DashAdmin, while others such as common state could be interfaced and configured at a domain application level.

 * IDashAdminState Key State Interfaces:
 * - IAuthState: Manages authentication state with user and auth data
 * - ICommonState: Handles common app state like loading, errors, navigation
 * - IPageState: Controls page-level state like title and icons
 * - ISettingsState: Manages app settings like theme, layout, locale
 * - IDASHAppState: Root state interface combining all state slices
 * - IFormDataState: Tracks form modification state

# IMPLEMENTATION EXAMPLE

## The library imported at the DashApp entrypoint; your Domain/App.tsx

```
import { IDASHAppState } from 'dash-admin-state';
```

## General
The key implementation points:

### Initial state must be defined in the App Entrypoint (App.tsx)
```
const INITIAL_APP_STATE: IDASHAppState<IDomainUser, IDomainAuth, IAppResourceConfig>
```

### The initial state are passed to the DashAdmin component

```
<DASHAdmin<U, A, R, C>
	...
	initialAppState={INITIAL_APP_STATE}
	...
```

## Specific considerations

### Define the interfaces that will store your user data

While technically the User and Auth could be similar, User interface commonly will include only basic user data such as user id and name returned by the user login and user endpoint, while the Auth interface relies in the response of the getAuth api endpoint which  architecturally returns additional or extra user data.

```
export interface IDomainUser {...}
export interface IDomainAuth {...}

const INITIAL_APP_STATE: IDASHAppState<
	IDomainUser,
	IDomainAuth,
	IAppResourceConfig
> = {
	page: defaultPageSettings,
	settings: defaultSettings,
	auth: defaultAuth,
	common: defaultCommon,
	resources: defaultResources,
  formData: defaultFormState
};

<DASHAdmin<IDomainUser, IDomainAuth, IDashAutoAdminResourceConfig, IDASHAppConstants>
	...
	initialAppState={INITIAL_APP_STATE}
	...
```

## Notes
- Note that they can also be technically defined as 'any'
- User and Auth state are considered to be deprecated int he future from DashAdminState in favor of AutoAdmin AuthContext.


# USAGE EXAMPLE - ACCESSING STATE

In your components

## Import settings
```
  import { IDASHAppState } from 'dash-admin-state';

	const settings: ISettingsState = useSelector(
		(state: IDASHAppState) => state.settings,
	);
```

## Get DashAdmin Resources

```

import { IDASHAppState } from 'dash-admin-state';

const resources = useSelector(
		(
			state: IDASHAppState<IDomainUser, IDomainAuth, IAppResourceConfig>,
		) => {
			if (debug || menu) {
				return menu;
			}
			return state.resources.items;
		},
	);
```

```
 const formData = useSelector(
		(
			state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>,
		) => {

			return state.formData;
		},
	);
```

# UPDATING VALUES

```
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';

  ...
	const dispatch = useDispatch();
  dispatch(DASH_REDUX_ACTIONS.toggleExpandedSideNav(true));
  ...

```

# DASH_REDUX_ACTIONS

TODO:
- Some methods are implemented in the DASH_REDUX_ACTIONS
- Implement generic methods to update each store
