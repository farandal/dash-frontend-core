import { Route } from 'react-router-dom';
import KitchnTabsSharedRoutes from './KitchnTabsSharedRoutes';
import Home from './components/pages/Home';
import Privacy from './components/pages/Privacy';
import { GlobalSmallLoader } from './dash-extensions/components';
import { Suspense } from 'react';
import SignUp from './components/pages/SignUp';
import TrialVerify from './components/pages/TrialVerify';
import SignUpSuccess from './components/pages/SignUpSuccess';
import Terms from './components/pages/Terms';
import Plans from './components/pages/Plans';
import Security from './components/pages/Security';
import RecoverPassword from './components/pages/RecoverPassword';
import ChangePassword from './components/pages/ChangePassword';





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
     <Route
        key="terms"
        path='/terms'
        element={<Terms/>}
    />,
     <Route
        key="security"
        path='/security'
        element={<Security/>}
    />,
     <Route
        key="plans"
        path='/plans'
        element={<Plans/>}
    />,
    <Route
        key="signup"
        path='/signup'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <SignUp />
            </Suspense>
        }
    />,
    <Route
        key={'verify'}
        path='trial/verify'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<TrialVerify />}
            </Suspense>
        }
    />,
      <Route
            key="signup-success"
            path='/signup-success'
            element={
                <Suspense fallback={<GlobalSmallLoader />}>
                    <SignUpSuccess />
                </Suspense>
            }
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

