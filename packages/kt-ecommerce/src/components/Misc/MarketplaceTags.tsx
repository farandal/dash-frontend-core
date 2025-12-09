import React, { } from 'react'
import MarketplaceTag from './MarketplaceTag';
import { Marketplace } from '../interfaces/ICampaign';
import { Chip } from '@mui/material';


export interface IMarketplaceTags {
    marketplaces: Marketplace[]
}

const MarketplaceTags: React.FC<IMarketplaceTags> = ({ marketplaces, ...props }) => {

    return <> {marketplaces.map((marketplace,idx) => {
        
        //return <MarketplaceTag marketplace={{...marketplace.tenantSystemMarketplace.systemMarketplace, name: marketplace.name}} key={idx} />
        return <Chip label={marketplace.name.charAt(0).toUpperCase()} size="small" />})}</>

}

export default MarketplaceTags;
