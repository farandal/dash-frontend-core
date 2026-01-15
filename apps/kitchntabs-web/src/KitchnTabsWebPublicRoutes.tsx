import { Route } from 'react-router-dom';
import KitchnTabsSharedRoutes from './KitchnTabsSharedRoutes';
import Home from './components/pages/Home';
import Privacy from './components/pages/Privacy';



export const dashPrivateRoutes = () => [
    ...KitchnTabsSharedRoutes(),
]

export const dashPublicRoutes = () => [
     ...KitchnTabsSharedRoutes(),
     // This route loads at / when not authenticated
     <Route
        key="landing"
        //data-layout="no-layout"
        path='/'
        element={<Home/>}
    />,
    <Route
        key="privacy"
        path='/privacy'
        element={<Privacy/>}
    />,
];

