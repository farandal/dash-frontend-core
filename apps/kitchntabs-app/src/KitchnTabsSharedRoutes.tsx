// Shared routes factory function


import React from 'react';
import { Route } from 'react-router-dom';
import NotFound from './components/theme/components/others/NotFound';
import DASHLightWeightLogin from './components/pages/DASHLightWeightLogin';

const KitchnTabsSharedRoutes = () => [
    <Route
        path="/login"
        element={
            <DASHLightWeightLogin/>
        }
    />,
    <Route
        path="*"
        //element={<NotFound disableCountdown={true} time={5} redirect="/login" />}
        element={<NotFound />}
    />

]

export default KitchnTabsSharedRoutes;