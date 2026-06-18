import { Route } from 'react-router-dom';
import KitchnTabsSharedRoutes from './KitchnTabsSharedRoutes';
import DASHLightWeightLogin from './components/pages/DASHLightWeightLogin';

export const dashPrivateRoutes = () => [
    ...KitchnTabsSharedRoutes(),
]

export const dashPublicRoutes = () => [
     ...KitchnTabsSharedRoutes(),
     <Route
        key="landing"
        path='/'
        element={<DASHLightWeightLogin/>}
    />
   
];