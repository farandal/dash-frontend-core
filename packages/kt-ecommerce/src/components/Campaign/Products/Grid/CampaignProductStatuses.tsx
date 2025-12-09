import { Button, Paper, Stack, styled } from '@mui/material';

import React, { useMemo } from 'react'
import { useRecordContext } from "react-admin";
import ICampaignProduct, { CampaignMarketplace, Pivot, StatusHistory } from '../../../../interfaces/campaign/ICampaignProduct';
import ICampaign from '../../../../interfaces/campaign/ICampaign';
import MarketplaceTag from '../../../Misc/MarketplaceTag';
import { ProductStatus } from '../../Utils';
import moment from "moment";
import MUISimpleJsonTable from '../../../../components/MuiSimpleJsonTable';
moment.locale("es-es");

interface ICampaignProductStatuses {
    data: ICampaignProduct
    field: string
}

export const RenderStatusHistory = (pivot:Pivot) => {

    /*const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        //...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.secondary,
      }));

    return <Stack >{pivot.status_history.map((history) => {
        const date = moment(history.created_at);
        console.log(history);
        //return <Item>{date.format('YYYY-MM-DD HH:mm:ss')} | Status Campaña: {history.description} | Status Producto: {history.properties?.old?.status } ► {history.properties?.attributes?.status}</Item>
       
    })}</Stack>*/

    return <div style={{maxWidth:500}}>{pivot?.marketplace_error}</div>

      
};

export const CampaignProductStatuses: React.FC<ICampaignProductStatuses> = ({ data,field }) => {
    // const {id} = useParams();

    const contextCampaign: ICampaign = useRecordContext();
   
    const systemMarketplaces = contextCampaign.campaign_marketplaces.map((marketplace) => {
        return marketplace.marketplace.tenantSystemMarketplace.systemMarketplace
    });

    const ProductStatusesComponent = useMemo(() => (data: ICampaignProduct) => {
        
        return <table>
            {data && data.campaign_marketplaces.map((campaignMarketplaceProductData: CampaignMarketplace) => {
                const marketplace = systemMarketplaces.find(ele => ele.id == campaignMarketplaceProductData.marketplace.tenant_system_marketplace_id)
                const status = campaignMarketplaceProductData.pivot.status;
                return <tr>
                    
                        <td>{ProductStatus(status)}</td>
                        <td><MarketplaceTag noTitle={true} marketplace={marketplace} /></td>
                        {/*<td>{JSON.stringify(campaignMarketplaceProductData.pivot)}</td>*/}
                        <td>{RenderStatusHistory(campaignMarketplaceProductData.pivot)}</td>
                    </tr>
           })}
       </table>
     
    }, [data]);

    return ProductStatusesComponent(data);

}


export default CampaignProductStatuses;
