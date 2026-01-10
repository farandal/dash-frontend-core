
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import tenantSuperAdminSchema from "../schemas/tenant_superadmin";
import tenantTenantSchema from "../schemas/tenant_tenant";
import Person from "@mui/icons-material/Person";
import SystemRequestsCache from 'dash-admin/src/contexts/SystemRequestsCache';
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Person as unknown as React.FC;

const ecommerceTenantResource: IDashAutoAdminResourceConfig = 
{
    roles: [DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    model: "tenant/tenant",
    
    group: "resource.groups.configuration",
    label: "resource.ecommerce.tenant_data.label",

    schema: tenantTenantSchema,
    drawer: true,
    drawerOptions: {
        edit: false
    },
    delete: false,
    listDeleteButton: { enabled: false },
    icon: <Icon />,
   
    menu: [
        {
            title: "resource.ecommerce.tenant_data.menu_list",
            redirect: "tenant/tenant",
        }
    ],
    syncTabsWithLocation: false,

      contextComponent: ({ resourceConfig, mode, children }) => {
            console.log("TenantSettingsFormatsProvider", resourceConfig, mode);

            return mode === "list" ? children : <SystemRequestsCache
                cacheKey="tenant_settings_formats_cache"
                apiUrl="tenant/tenant/settings/formats"
                cacheSeconds={300}
            >{children}</SystemRequestsCache>
        },
   
   
    postFormatter: (params) => {

  
        if(Array.isArray(params.settings)) {
            params.settings = Object.fromEntries(Object.entries(params.settings).map(([key, value]) => [key.replace(/^\d+$/, ''), value]));
           
        }
        if (params.systemMarketplaces)
            params.system_marketplace_ids = params.systemMarketplaces.map(
                (item) => item.id
            );
        if (params.systemPointOfSales)
            params.system_point_of_sale_ids = params.systemPointOfSales.map(
                (item) => item.id
            );

            
        return params;
    },
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    processErrors: false,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
    redirectAfterUpdate: false,
}


export default ecommerceTenantResource;