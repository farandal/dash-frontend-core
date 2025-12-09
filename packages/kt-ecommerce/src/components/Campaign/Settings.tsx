import { Chip, FormControlLabel, Stack, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGetList } from 'react-admin';
import { DateTimeInput } from 'react-admin';
import { useGetIdentity } from 'react-admin';
import { CheckboxGroupInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { TextField as RATextField } from 'react-admin';
import { useController, useFormContext } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import PriceStock from './Create/PriceStock';



const CampaignSettingsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  // return <RATextField label={attribute.label} source={attribute.attribute} options={attribute.fieldOptions} />;
  return record.scheduled ? <Stack direction="row" spacing={1}>
    <Chip label={<RATextField label={'Fecha inicio'} source={'start_date'} />} />
    <Chip label={<RATextField label={'Fecha término'} source={'end_date'} />} />
  </Stack> : <></>



}
const CampaignSettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  const { register } = useFormContext();
  const scheduledField = useController({ 
    name: 'scheduled', 
    defaultValue: method === "create" ? false : record.scheduled,
    rules: {
      shouldUnregister: true
    }
  });

  useEffect(() => {
    register('scheduled');
  }, [register]);

  return (
    <>
      <FormControlLabel
        value={scheduledField.field.value}
        control={
          <Switch checked={scheduledField.field.value}
            slotProps={{ input: { 'aria-label': 'controlled' } }}
            {...scheduledField.field}
          />
        }
        label="Campaña Permanente / Agendada"
      />
      {scheduledField.field.value ?
        <>
          <br />
          <DateTimeInput label={'Fecha inicio'} source={'start_date'} />
          <br />
          <DateTimeInput label={'Fecha término'} source={'end_date'} />
        </> : <></>}
      {method === "create" ? <PriceStock hide_overwrite_prices={true} /> : <></>}
    </>
  )
}
const CampaignSettings = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <CampaignSettingsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <CampaignSettingsView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default CampaignSettings;
