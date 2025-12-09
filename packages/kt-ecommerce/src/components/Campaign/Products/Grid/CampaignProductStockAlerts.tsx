import { Button, Icon, Stack, TextField } from '@mui/material';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { memo, useEffect, useMemo, useState } from 'react'
import { useGetList } from 'react-admin';
import { NumberInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import NumberFormat from 'react-number-format';
import numeral from 'numeral';
import { Loading, useUpdate, useNotify, useRefresh } from 'react-admin';

import { useParams } from 'react-router';

import MarketplaceTag from '../../../Misc/MarketplaceTag';
import { ICampaign, ICampaignProduct } from '../../../../interfaces';

interface ICampaignProductStockAlerts {
  data: ICampaignProduct
  field: string
}

const CampaignProductStockAlertsEdit: React.FC<ICampaignProductStockAlerts> = ({ data, field }) => {

  const contextCampaign: ICampaign = useRecordContext();

  const [update] = useUpdate();
  const refresh = useRefresh();
  const notify = useNotify();

  const saveProductEdit = async (campaignMarketplaceId, d) => {

    try {

      const campaignMarketplaceData = data.campaign_marketplaces.find(ele => ele.id === Number(campaignMarketplaceId))
      const payload = {
        ...campaignMarketplaceData.pivot,
        id: campaignMarketplaceData.pivot.product_id,
        stock_alert_threshold: d.stock_alert_threshold
      }

      payload.hasOwnProperty('status_history') && delete payload.status_history;

      await update(
        `campaign_marketplace/${campaignMarketplaceId}/products`,
        { id: campaignMarketplaceData.pivot.product_id, data: payload },
        {
          onSuccess: () => {
            notify('Producto actualizado.')
            refresh();

          },
          onError: (error: any) => {
            notify(`Error al guardar los datos del producto, ${error?.body?.message || ''}`)

          },

        }
      );
    } catch (error) {
      //console.log(error)
      notify(JSON.stringify(error))
    }
  }

  const onSubmit = (d: any) => {
    // for each campaign_id set of fields in form context, send a data update.
    Object.keys(d).forEach((campaignMarketplaceId) => {
      saveProductEdit(campaignMarketplaceId, d[campaignMarketplaceId])
    });
  };

  const systemMarketplaces = contextCampaign.campaign_marketplaces.map((marketplace) => {
    return marketplace.marketplace.tenantSystemMarketplace.systemMarketplace
  });


  const form = useForm({ shouldUseNativeValidation: true });
  const { register, handleSubmit, control, setValue, reset } = form;

  // Set the default value for the form inputs
  useEffect(() => {
    let defaultValues = {};
    data && data.campaign_marketplaces.length && data.campaign_marketplaces.forEach((campaignMarketplaceProductData: any) => {
      defaultValues[campaignMarketplaceProductData.id + ".stock_alert_threshold"] = campaignMarketplaceProductData.pivot?.stock_alert_threshold ?? null
    }
    );
    reset(formValues => ({
      ...defaultValues,
    }))
  }, [])


  return <FormProvider {...form}>

    <form onSubmit={handleSubmit(onSubmit)}>
      {data && data.campaign_marketplaces.map((campaignMarketplaceProductData: any, key) => {
        const marketplace = systemMarketplaces.find(ele => ele.id == campaignMarketplaceProductData.marketplace.tenant_system_marketplace_id)

        const campaignMarketplaceId = campaignMarketplaceProductData.id;
        const fieldName: string = `${campaignMarketplaceId}.${field}`;
        
        return <div key={key}>
          <MarketplaceTag marketplace={marketplace} />

          <TextField
            // Register the form input by name, it will get the default value from the useEffect before.
            {...register(fieldName)}
            label={field}
            fullWidth
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />

        </div>
      })}
      <>
        <Button type={"submit"} variant="contained" >Guardar</Button>
      </>
    </form>
  </FormProvider>

}

const propsAreEqual = (oldProps, newProps) => {
  return oldProps.data === newProps.data;
}

const MemoizedProductStockAlertsEdit = memo(CampaignProductStockAlertsEdit, propsAreEqual);

export default MemoizedProductStockAlertsEdit;  