import React, { useEffect } from 'react';
import { useGetList } from 'react-admin';
import { DateTimeInput } from 'react-admin';
import { useGetIdentity } from 'react-admin';
import { CheckboxGroupInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { TextField as RATextField } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

const CampaignDateTimeView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  // return <>{record.geocoded_address}</>
  return <RATextField label={attribute.label} source={attribute.attribute} options={attribute.fieldOptions} />;
}

const CampaignDateTimeEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  return (
    <DateTimeInput source={attribute.attribute} label={attribute.label} />
  )
}


const CampaignDateTime = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <CampaignDateTimeEdit attribute={attribute} method={method} />
    case "view":
      return <CampaignDateTimeView attribute={attribute} method={method} />
  }
}

export default CampaignDateTime;
