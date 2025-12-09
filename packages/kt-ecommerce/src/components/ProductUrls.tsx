
import { PriceList } from '../interfaces/PriceList';
import { Product, ProductURL } from '../interfaces/Product';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { } from 'react'
import { useGetList } from 'react-admin';
import { useRecordContext } from "react-admin";
import { Loading } from 'react-admin';
import { TextInput } from 'react-admin';
import { LinearProgress } from 'react-admin';

interface IProductURLs extends IDashAutoAdminCustomFieldComponent {
  data: PriceList[]
}

const ProductURLsView: React.FC<IProductURLs> = ({ method, attribute, data }) => {

  const product = useRecordContext();

  return <>No implementado</>
}

const CustomURLField = ({ name, label, defaultValue, idx }) => {

  return <TextInput
    key={idx}
    source={name}
    fullWidth
    label={label}
    defaultValue={defaultValue || ""}
  />

};

const ProductURLsEdit: React.FC<IProductURLs> = ({ method, attribute, data }) => {

  const product: Product = useRecordContext();

  /*
  const tenantResource = "tenant";
  const tenant_id = getCookie("tenant_id");
  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne(tenantResource, { id: tenant_id});
  */

  const { data: marketplaces, total, isLoading, error } = useGetList(
    'ecommerce/marketplace',
    {
      pagination: { page: 1, perPage: 1000 }
    },
    { refetchOnWindowFocus: false }
  );

  return (marketplaces && !isLoading) ? (marketplaces.map((marketplaceInstance, idx) => {
    let url = product?.urls?.find((url: ProductURL) => url.marketplace_id === marketplaceInstance.id);
    //console.log("ACTUAL PRODUCT URL", url, "For marketplace", marketplaceInstance.name);
    return <CustomURLField key={idx} idx={idx} name={"updatedUrls._" + marketplaceInstance.id} label={"código o url para " + marketplaceInstance.name} defaultValue={url?.url} />
  })) : <LinearProgress />

}
const ProductURLs = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {

  const { data: availablePriceLists, isLoading: availablePriceListsLoading } = useGetList(
    'ecommerce/pricelist',
    { pagination: { page: 1, perPage: 1000 } },
    { refetchOnWindowFocus: false }
  );

  switch (method) {
    case "edit":
    case "create":
      return availablePriceLists && !availablePriceListsLoading ? <ProductURLsEdit data={availablePriceLists} attribute={attribute} method={method} resourceConfig={resourceConfig} /> : <LinearProgress />
    case "view":
      return availablePriceLists && !availablePriceListsLoading ? <ProductURLsView data={availablePriceLists} attribute={attribute} method={method} resourceConfig={resourceConfig} /> : <LinearProgress />
  }
}
export default ProductURLs;
