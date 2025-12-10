// in posts.js
import { FC, useEffect, useState } from "react";
import IAppResourceConfig from 'dash-admin/src/interfaces/IAppResourceConfig';
import { getCookie } from 'dash-admin/src/utils/cookies';
import { useGetOne } from 'react-admin';
import { SelectInput } from 'react-admin';
import { FormControl } from '@mui/material';
import {Tenant} from 'dash-admin/src/interfaces/Tenant';
import { Loading } from "react-admin";
import { dashStorage } from "dash-utils";

interface ICreateTenantMarketplace {
    resourceConfig: IAppResourceConfig;
}

const CreateTenantMarketplaceForm: FC<ICreateTenantMarketplace> = ({ resourceConfig,...props }) => {

    const resource = resourceConfig.model;
    const tenantResource = "tenant";
    const tenant_id = dashStorage.getItem('tenant_id');
    const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne(tenantResource, { id: tenant_id}, { refetchOnWindowFocus: false});
    const tenant_system_marketplace_id = "system_marketplace_id";
    //const system_marketplace = useController({ name: system_marketplace_field });
    //const handleChange = (value) => {}
    
    const [showForm,setShowForm] = useState<boolean>(false);
    
    useEffect(() => {

        if(tenant && !tenantLoading) {
            setShowForm(true);
        }

    },[tenant,tenantLoading])

    return showForm ? ( 
        // This must be wrapped within <Create> or <Edit> from ReactAdmin
            <>
            <FormControl fullWidth>
                <SelectInput source={tenant_system_marketplace_id} choices={(tenant as Tenant)?.systemMarketplaces} translateChoice={false}/>
            </FormControl>
            </>
        
    ) : <Loading />;
};

export default CreateTenantMarketplaceForm;