import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { TabManagerProvider, ITab } from "kt-tabs";
import { MallClientTabsProvider } from "./MallClientTabsContext";

export const MallTabsContext: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
   const { children, mode, resourceConfig } = props;
   const tab: ITab = useRecordContext();

    // For list mode, wrap with MallClientTabsProvider for notifications/tenant status tracking
    if (mode === "list") {
       
        return (
            <MallClientTabsProvider mode={mode} resourceConfig={resourceConfig}>
                {children}
            </MallClientTabsProvider>
        );
    }

    // For create/edit/show modes, wrap with TabManagerProvider and MallClientTabsProvider
    return (
        <MallClientTabsProvider mode={mode} resourceConfig={resourceConfig}>
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
        </MallClientTabsProvider>
    );
};

export default MallTabsContext;
