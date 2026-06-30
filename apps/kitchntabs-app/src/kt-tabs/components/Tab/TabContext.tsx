import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { useNotify, useRecordContext, useRefresh } from "react-admin";
import { useContext, useEffect } from "react";
import LaravelEchoContext from 'dash-admin/contexts/com/LaravelEchoContext';
import type { ILaravelEchoContext } from 'dash-admin/contexts/com/LaravelEchoContext';
import { App as CapacitorApp } from '@capacitor/app';


import { TabManagerProvider } from "../contexts/TabManagerContext";
import { ITab } from "../interfaces/ITab";
import { processCustomNotification } from '../../../components/Notifications/CustomNotificationsProcessing';



// Provider for list mode: listens to LaravelEchoContext messages and performs an action
const TabsListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const refresh = useRefresh();
     const notify = useNotify();
    useEffect(() => {
        if (!lastEvent) return;
       
        // Handle MallSessionTabCreationNotification for Tab model
       if (
            lastEvent.model === "Domain\\App\\Models\\Tab\\Tab" &&
            (lastEvent.notificationPayload?.class === "MallSessionTabCreationNotification" ||
            lastEvent.notificationPayload?.class === "TenantChannelMessageNotification" || 
            lastEvent.notificationPayload?.class === "TabCreatedNotification")
        ) {
            // Play notification sound before refresh
            processCustomNotification(lastEvent);
            
            notify(lastEvent.notificationPayload?.notificationPayload?.message || lastEvent.notificationPayload?.message || "Actualización", { type: 'info' });
            refresh();
            /*if (window.Notification && Notification.permission === "granted") {
                new Notification(
                    lastEvent.notificationPayload.title || "Nueva orden",
                    {
                        body: lastEvent.notificationPayload.message,
                    }
                );
            }*/
        }
    }, [lastEvent]);

    // Render children (previously was returning empty fragment which was a bug)
    return <>{children}</>;
};


const TabsEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const refresh = useRefresh();
    const notify = useNotify();
    useEffect(() => {
        if (!lastEvent) return;
       
        // Handle MallSessionTabCreationNotification for Tab model
        if (
            lastEvent.model === "Domain\\App\\Models\\Tab\\Tab" &&
            (lastEvent.notificationPayload?.class === "MallSessionTabCreationNotification" ||
            lastEvent.notificationPayload?.class === "TenantChannelMessageNotification" || // @deprecated
            lastEvent.notificationPayload?.class === "TabChannelNotification" ||
            lastEvent.notificationPayload?.class === "TabCreatedNotification")
        ) {
            // Play notification sound before refresh
            processCustomNotification(lastEvent);
           
            notify(lastEvent.notificationPayload?.notificationPayload?.message || lastEvent.notificationPayload?.message || "Actualización", { type: 'info' });
            refresh();
            /*if (window.Notification && Notification.permission === "granted") {
                new Notification(
                    lastEvent.notificationPayload.title || "Nueva orden",
                    {
                        body: lastEvent.notificationPayload.message,
                    }
                );
            }*/
        }
    }, [lastEvent]);

    // Only logic, no UI
    return <>{children}</>;
};

export const TabsContext: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
    const { children, mode } = props;
    const tab: ITab = useRecordContext();
    
    // 🐛 DEBUG: Track context rendering
    console.log(`🟣 [ISSUE01] [TabsContext] Rendering`, {
        mode,
        tabId: tab?.id,
        hasTab: !!tab,
        hasOrder: !!tab?.order
    });

    // Only wrap in TabManagerProvider for create/edit, not for list
    if (mode === "list" || mode === "view") {
        // Wrap children in TabsListProvider for message listening logic
        return <TabsListProvider>{children}</TabsListProvider>;
    }

    const content = (
        <TabManagerProvider
            tab={tab}
            productsResource="ecommerce/product"
            enableInfiniteScroll={false}
            showPrice={true}
            productsField="products"
            method={mode}
        >
            {children}
        </TabManagerProvider>
    );

    if (mode === "edit") {
        return <TabsEditProvider>{content}</TabsEditProvider>;
    }

    return content;
};

export const MallTabsContext: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
   const { children, mode } = props;
   const tab: ITab = useRecordContext();

    // Only wrap in TabManagerProvider for create/edit, not for list
    if (mode === "list") {
        // Wrap children in TabsListProvider for message listening logic
        return  <>{children}</>
    }

    return (
        <TabManagerProvider
            tab={tab}
            productsResource="public/mall/products"
            enableInfiniteScroll={true}
            showPrice={true}
            productsField="products"
            method={mode}
        >
           {children}
        </TabManagerProvider>
    );
};
