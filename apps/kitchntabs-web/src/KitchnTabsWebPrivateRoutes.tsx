import { Route } from 'react-router-dom';
import DASHLightWeightLogin from 'kt-pages/src/dash-pages/DASHLightWeightLogin';
import KitchnTabsSharedRoutes from './KitchnTabsSharedRoutes';

export const dashPrivateRoutes = () => [
    ...KitchnTabsSharedRoutes(),
]

export const dashPublicRoutes = () => [
    ...KitchnTabsSharedRoutes(),
    <Route
        path="/"
        element={
            <DASHLightWeightLogin
            />
        }
    />,
];

