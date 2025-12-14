import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { TabManagerProvider, ITab } from "kt-tabs";
import { MallClientTabsProvider } from "./MallClientTabsContext";
import { MallOrderCreateProvider } from "../contexts/MallOrderCreateContext";

/**
 * MallTabsContextV2 - Context wrapper for V2 kiosk-style mall ordering
 * 
 * Key differences from MallTabsContext:
 * - For 'create' mode, wraps with MallOrderCreateProvider for product selection and cart
 * - MallOrderToolbarMediator and MallOrderProductsFieldV2 use MallOrderCreateProvider
 * - For 'edit'/'show' modes, still uses TabManagerProvider for existing functionality
 */
export const MallTabsContextV2: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
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

    // For create mode, wrap with MallOrderCreateProvider for product/cart management
    // MallOrderToolbarMediator and MallOrderProductsFieldV2 both use this context
    if (mode === "create") {
        return (
            <MallClientTabsProvider mode={mode} resourceConfig={resourceConfig}>
                <MallOrderCreateProvider>
                    {children}
                </MallOrderCreateProvider>
            </MallClientTabsProvider>
        );
    }

    // For edit/show modes, wrap with TabManagerProvider and MallClientTabsProvider
    // This preserves existing functionality for editing orders
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

export default MallTabsContextV2;
