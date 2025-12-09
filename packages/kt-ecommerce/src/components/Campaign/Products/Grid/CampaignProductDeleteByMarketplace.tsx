import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React, { useState } from 'react'
import { useRecordContext } from "react-admin";
import { useForm } from 'react-hook-form';
import { useNotify, useRefresh } from 'react-admin';
import ICampaignProduct from '../../../../interfaces/campaign/ICampaignProduct';
import ICampaign, { SystemMarketplace } from '../../../../interfaces/campaign/ICampaign';
import MarketplaceTag from '../../../Misc/MarketplaceTag';
import { useDelete } from 'react-admin';

interface ICampaignProductDeleteByMarketplace {
    data: ICampaignProduct
}

interface IDeleteProductActionPayload {
    product_id: number
    marketplace_id:number
    marketplace: SystemMarketplace
}
export const CampaignProductDeleteByMarketplace: React.FC<ICampaignProductDeleteByMarketplace> = ({ data }) => {
    // const {id} = useParams();

    const [deleteOne] = useDelete();
    const refresh = useRefresh();
    const notify = useNotify();
    const [open, setOpen] = useState(false);

    const deleteProductFromMarketplace = async (marketplace_id,product_id) => {
      
        try {
            console.log("delete",marketplace_id,product_id);
            
            await deleteOne(
                `campaign_marketplace/${marketplace_id}/products`,
                {id: product_id/*, data: {...data, price: data.primary_price} */},
                {
                    onSuccess: () => {notify('Producto removido.') },
                    onError: (error:any) => {console.log(error); notify(`Error al remover el producto, ${error?.body?.message || ''}`)}
                }
            );
        } catch (error) {
            console.log(error)
        }
        finally{
            refresh();
        }
    }

    const contextCampaign: ICampaign = useRecordContext();
    const fieldPrefix = ""

    const systemMarketplaces = contextCampaign.campaign_marketplaces.map((marketplace) => {
        return marketplace.marketplace.tenantSystemMarketplace.systemMarketplace
    });

    const [payload,setPayload] = useState<IDeleteProductActionPayload>(null);
    return <><table>
                {data && data.campaign_marketplaces.map((campaignMarketplaceProductData: any) => {
                
                    const marketplace = systemMarketplaces.find(ele => ele.id == campaignMarketplaceProductData.marketplace.tenant_system_marketplace_id)
                    
                    return <tr>
                            <td><MarketplaceTag marketplace={marketplace} /></td>
                            <td><Button onClick={() => { 
                                //deleteProductFromMarketplace(campaignMarketplaceProductData.marketplace_id,campaignMarketplaceProductData.id); }
                                setPayload({marketplace:marketplace,product_id:campaignMarketplaceProductData.pivot.product_id,marketplace_id:campaignMarketplaceProductData.id})  
                                setOpen(true);
                            }} >Eliminar</Button></td>
                            </tr>
            })}
            </table>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>
                    Aviso
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro de eliminar este producto en ésta campaña para éste marketplace?
                        {payload?.marketplace && <MarketplaceTag marketplace={payload.marketplace} />}
                    </DialogContentText>
                </DialogContent>
                {payload?.product_id && payload?.marketplace_id && 
                <DialogActions>
                    <Button 
                    onClick={() => { deleteProductFromMarketplace(payload.marketplace_id,payload.product_id); setOpen(false); }} 
                    color='primary' >Continuar</Button>
                    <Button autoFocus onClick={() => {refresh(); setOpen(false);}}>
                        Cancelar
                    </Button>
                </DialogActions>
            }
            </Dialog>
            </>

}


export default CampaignProductDeleteByMarketplace;
