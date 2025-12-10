import React, { useEffect, useState } from 'react'
import { useGetOne, useInput, useRecordContext } from 'react-admin';

import { FormControl } from '@mui/material';
import { SelectInput } from 'react-admin';

import { Loading } from 'react-admin';
import { useController, useForm } from 'react-hook-form';

import { getCookie } from 'dash-admin/src/utils/cookies';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

import { dashStorage } from 'dash-utils';
import { Tenant } from '../../interfaces';


const SystemPointOfSaleSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const tenantResource = "tenant/tenant";
    const tenant_id = dashStorage.getItem('tenant_id');
    const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne(tenantResource, { id: tenant_id }, { refetchOnWindowFocus: false});
    const tenant_system_point_of_sale_id = "tenant_system_point_of_sale_id";

    const [showForm, setShowForm] = useState<boolean>(false);

    useEffect(() => {
        console.log('[SystemPointOfSaleSelector] tenant_id from storage:', tenant_id);
        console.log('[SystemPointOfSaleSelector] tenant data:', tenant);
        console.log('[SystemPointOfSaleSelector] tenant.systemPointOfSales:', (tenant as Tenant)?.systemPointOfSales);
        console.log('[SystemPointOfSaleSelector] tenantLoading:', tenantLoading);
        console.log('[SystemPointOfSaleSelector] tenantError:', tenantError);

        if (tenant && !tenantLoading) {
        
            setShowForm(true);
        }

    }, [tenant, tenantLoading])

    if (tenantLoading) return <Loading />;
    if (tenantError) return <div>Error loading tenant data</div>;
    if (!tenant) return <Loading />;
  
    const choices = (tenant as Tenant)?.systemPointOfSales || [];
    console.log('[SystemPointOfSaleSelector] Rendering SelectInput with choices:', choices);

    return (
        <FormControl fullWidth>
            <SelectInput 
                source={tenant_system_point_of_sale_id} 
                choices={choices} 
                optionValue="tenant_system_point_of_sale_id"
                optionText="name"
                translateChoice={false} 
                emptyText="Seleccione un punto de venta"
                label="Sistema de Punto de Venta"
            />
        </FormControl>
    );
       

}

const SystemPointOfSaleSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    const record = useRecordContext();
    const { id, field, fieldState } = useInput({ source: attribute.attribute });

    return <input id={id} type={"hidden"} value={record[attribute.attribute]} {...field} />
   

    
}

const SystemPointOfSaleSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    return <></>
}

const SystemPointOfSaleSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <SystemPointOfSaleSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <SystemPointOfSaleSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "create":
            return <SystemPointOfSaleSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
    }
}

export default SystemPointOfSaleSelector
