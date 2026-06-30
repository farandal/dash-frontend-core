import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import { FC, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/contexts/com/LaravelEchoContext';

import { useRefresh } from 'react-admin';
import { useCapacitorAppStateRefresh, useDeviceStorageSync } from 'dash-utils';
import DASHHeaderActions from '../components/DashHeaderActions';
import { processCustomNotification } from '../components/Notifications/CustomNotificationsProcessing';

const MainAppHookComponent = () => {
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
    const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const lastNotificationRef = useRef<any>(null);

    useEffect(() => {
        const lastNotification = laravelEchoContext?.lastEvent;
        // Prevent processing the same notification multiple times
        if (lastNotification && lastNotification !== lastNotificationRef.current) {
            lastNotificationRef.current = lastNotification;
            processCustomNotification(lastNotification);
        }
    }, [laravelEchoContext?.lastEvent]);

    return <></>;
};

export default MainAppHookComponent;