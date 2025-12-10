import React, { } from 'react'
import { IMarketplace } from '../../interfaces';
import { Chip } from '@mui/material';


export interface IMarketplaceTags {
    marketplaces: IMarketplace[]
}

const MarketplaceTags: React.FC<IMarketplaceTags> = ({ marketplaces, ...props }) => {

    return <> {marketplaces.map((marketplace,idx) => {
        
        //return <MarketplaceTag marketplace={{...marketplace.tenantSystemMarketplace.systemMarketplace, name: marketplace.name}} key={idx} />
        return <Chip label={marketplace.name.charAt(0).toUpperCase()} size="small" />})}</>

}

export default MarketplaceTags;
