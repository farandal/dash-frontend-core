import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import { FC, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';

import { useRefresh } from 'react-admin';
import { useCapacitorAppStateRefresh, useDeviceStorageSync } from 'dash-utils';
import DASHHeaderActions from '../components/DashHeaderActions';

const PublicSessionAppHookComponent = () => {
    const dispatch = useDispatch();
    const refresh = useRefresh();

    const HeaderToolBar: FC = useSelector(
        (state: IDASHAppState<any, any, any>) => state.common.headerToolBar,
    );

    useEffect(() => {
        if (HeaderToolBar !== DASHHeaderActions) {
            dispatch(
                DASH_REDUX_ACTIONS.setHeaderComponent(DASHHeaderActions),
            );
        }
    }, []);

    // Use hooks from dash-utils
    useCapacitorAppStateRefresh(refresh);
    useDeviceStorageSync();

    // Listen for notifications and process them
  
    return <></>;
};

export default PublicSessionAppHookComponent;