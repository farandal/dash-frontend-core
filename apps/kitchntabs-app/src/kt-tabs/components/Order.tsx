import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { ITab } from "./interfaces/ITab";

import ViewOrder from "./Tab/ViewOrder";
import EditOrder, { CreateOrder } from "./Tab/EditOrder";


const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const tab = useRecordContext<ITab>();
    return <>{tab.id}</>
};


const Order = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <EditOrder attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "create":
            return <CreateOrder attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <ViewOrder attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />
        default:
            return <>-</>
    }
};

export default Order;
