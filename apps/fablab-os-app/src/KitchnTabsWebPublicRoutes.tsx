import { Route } from 'react-router-dom';
import KitchnTabsSharedRoutes from './KitchnTabsSharedRoutes';

import { GlobalSmallLoader } from './dash-extensions/components';
import { Suspense } from 'react';

import RecoverPassword from './components/pages/RecoverPassword';
import ChangePassword from './components/pages/ChangePassword';
import HomeLogingWrapper from './components/pages/HomeLoginWrapper';

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
        element={<HomeLogingWrapper/>}
    />,
    <Route
        key={'reset-password'}
        path='reset-password'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<RecoverPassword />}
            </Suspense>
        }
    />,
    <Route
        key={'change-password'}
        path='change-password'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<ChangePassword />}
            </Suspense>
        }
    />,
];

