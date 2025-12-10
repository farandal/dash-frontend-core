import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useState } from 'react'
import { useGetOne } from 'react-admin';

import { FormControl } from '@mui/material';
import { SelectInput } from 'react-admin';

import { Loading } from 'react-admin';
import { useGetList } from 'react-admin';
import { dashStorage } from 'dash-utils/src/utils/dashDtorage';

const PointOfSaleSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const tenantResource = "tenant";
  const tenant_id = dashStorage.getItem('tenant_id');
  const { data: pointOfSales, isLoading: pointOfSalesLoading, error: pointOfSalesError } = useGetList(
    "ecommerce/point_of_sale",
    /* @ts-ignore */
    { id: tenant_id },
    { refetchOnWindowFocus: false }
  );
  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne(tenantResource, { id: tenant_id }, { refetchOnWindowFocus: false });
  const source = "point_of_sale_id";

  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {

    if ((tenant && !tenantLoading) && (pointOfSales && !pointOfSalesLoading)) {

      setShowForm(true);
    }

  }, [tenant, tenantLoading, pointOfSales, pointOfSalesLoading])
  // TODO optionValue must be updated
  return showForm ? (
    // This must be wrapped within <Create> or <Edit> from ReactAdmin
    <>
      <FormControl fullWidth>
        <SelectInput source={source} choices={pointOfSales} translateChoice={false} />
      </FormControl>
    </>

  ) : <Loading />;

}

const PointOfSaleSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return <></>
}

const PointOfSaleSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  return <></>
}

const PointOfSaleSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <PointOfSaleSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <PointOfSaleSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "create":
      return <PointOfSaleSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}       

export default PointOfSaleSelector
