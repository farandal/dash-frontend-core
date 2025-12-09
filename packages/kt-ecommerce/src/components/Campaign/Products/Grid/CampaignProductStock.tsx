import MarketplaceTag from "../../../Misc/MarketplaceTag";
import { ICampaign, ICampaignProduct } from "../../../../interfaces";

import React, { useEffect, memo } from "react";
import { useRecordContext, useUpdate, useRefresh, useNotify, TextField, Button } from "react-admin";
import { useForm, FormProvider } from "react-hook-form";

interface ICampaignProductStock {
  data: ICampaignProduct
  field: string
}


export const CampaignProductStockEdit: React.FC<ICampaignProductStock> = ({ data, field }) => {
  // const {id} = useParams();
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
        [field]: d[field]
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
      defaultValues[campaignMarketplaceProductData.id + "." + field] = campaignMarketplaceProductData.pivot[field] ?? null;
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
            /* @ts-ignore */
            inputProps={{ type: "number" }}
            InputLabelProps={{
              shrink: true,
            }}
          />

        </div>
      })}
      <>
        <Button type={"submit"} variant="contained" ><>Guardar</></Button>
      </>
    </form>
  </FormProvider>

}


const propsAreEqual = (oldProps, newProps) => {
  return oldProps.data === newProps.data;
}

const MemoizedCampaignProductStockEdit = memo(CampaignProductStockEdit, propsAreEqual);

export default MemoizedCampaignProductStockEdit;
