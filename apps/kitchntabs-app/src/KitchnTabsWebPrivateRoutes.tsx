import KitchnTabsSharedRoutes from './KitchnTabsSharedRoutes';
import KitchnTabsPrivateRoutes from './KitchnTabsPrivateRoutes';

export const dashPrivateRoutes = () => [
    ...KitchnTabsPrivateRoutes(),
    ...KitchnTabsSharedRoutes(),
]

// NOTE: The "/" route was removed because there's now a dashboard resource at "/".
// Login is accessible at "/login" from shared routes.
export const dashPublicRoutes = () => [
    ...KitchnTabsSharedRoutes(),
];
