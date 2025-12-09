import React, { useEffect } from 'react';
import { useGetList } from 'react-admin';
import { CheckboxGroupInput } from 'react-admin';
import { Loading } from 'react-admin';
import { useGetIdentity } from 'react-admin';
import { useRecordContext } from "react-admin";
import { TextField as RATextField } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import MarketplaceTag from '../Misc/MarketplaceTag';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';

const CampaignMarketplacesSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  return <>{record[attribute.attribute].map((campaign, idx) => {

    return <MarketplaceTag key={idx} marketplace={campaign.marketplace?.tenantSystemMarketplace?.systemMarketplace} noTitle={true} />
  })}</>

}

const CampaignMarketplacesSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, record }) => {
  //const record = useRecordContext();
  //const { identity, isLoading: identityLoading } = useGetIdentity();
  const { user } = useAuthContext();
  const { setValue } = useFormContext();

  useEffect(() => {
    if (user) {
    
      setValue('tenant_id', user.tenant_id);
    }
  }, [user]);

  const { data: marketplace, total, isLoading, error } = useGetList(
    'ecommerce/marketplace',
    {
      //pagination: false
    },
    { refetchOnWindowFocus: false }
  );

  return (
    (!user) ? <Loading /> :
      <CheckboxGroupInput source='marketplace_ids' choices={marketplace} />

  )
}


const CampaignMarketplacesSelector = ({ method, attribute, resourceConfig}: IDashAutoAdminCustomFieldComponent) => {

  switch (method) {
    case "edit":
    case "create":
      return <CampaignMarketplacesSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
    case "list":
      return <CampaignMarketplacesSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />

  }
}


export default CampaignMarketplacesSelector;
