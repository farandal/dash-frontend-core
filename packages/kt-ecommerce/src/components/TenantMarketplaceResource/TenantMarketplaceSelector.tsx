import React, { useEffect, useState } from 'react'
import { useGetOne, useInput, useRecordContext } from 'react-admin';

import { CircularProgress, FormControl } from '@mui/material';
import { SelectInput } from 'react-admin';

import { Loading } from 'react-admin';
import { useController, useForm } from 'react-hook-form';

import { getCookie } from 'dash-admin/src/utils/cookies';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { Tenant } from 'dash-admin/src/interfaces/Tenant';
import { dashStorage } from 'dash-utils';


const TenantMarketplaceSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const tenantResource = "tenant/tenant";
    const tenant_id = dashStorage.getItem('tenant_id');
    const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne(tenantResource, { id: tenant_id }, { refetchOnWindowFocus: false});
    const tenant_system_marketplace_id = "tenant_system_marketplace_id";

    const [showForm, setShowForm] = useState<boolean>(false);

    useEffect(() => {

        if (tenant && !tenantLoading) {
        
            setShowForm(true);
        }

       

    }, [tenant, tenantLoading])
  
    if(!showForm) return <CircularProgress/>
    return <>

    <FormControl fullWidth>
        <SelectInput source={tenant_system_marketplace_id} choices={(tenant as Tenant)?.systemMarketplaces} optionValue={tenant_system_marketplace_id}  translateChoice={false} />
    </FormControl></>
       

}

const TenantMarketplaceSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const record = useRecordContext();
    const { id, field, fieldState } = useInput({ source: attribute.attribute });

    return <input id={id} type={"hidden"} value={record[attribute.attribute]} {...field} />
   

    
}

const TenantMarketplaceSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    return <></>
}

const TenantMarketplaceSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <TenantMarketplaceSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <TenantMarketplaceSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "create":
            return <TenantMarketplaceSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
    }
}

export default TenantMarketplaceSelector
