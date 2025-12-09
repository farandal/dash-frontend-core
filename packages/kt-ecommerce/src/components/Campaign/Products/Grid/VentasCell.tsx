import { Chip, Tooltip } from "@mui/material";
import {
    GridEditInputCell,
    GridRenderEditCellParams,
    GridRenderCellParams
} from "@mui/x-data-grid";

import { useMemo } from "react";
import { useRecordContext } from "react-admin";

import CellSettings from "./CellSettings";
import MarketplaceTag from "./Misc/MarketplaceTag";

import React from "react";
import { ICampaignProduct, ICampaign } from "../../../../interfaces";

export interface ICampaignProductVentas {
    data : any // the row,
    field : string
}
export const CampaignProductVentas: React.FC<ICampaignProductVentas> = ({ data,field }) => {
    // const {id} = useParams();

    const contextCampaign: ICampaign = useRecordContext();
  
    const systemMarketplaces = contextCampaign.campaign_marketplaces.map((marketplace) => {
        return marketplace.marketplace
    });

    const VentasByMarketplaceComponent = useMemo(() => (data: ICampaignProduct) => {
    
        return <table>
            <tr>
            {data && data.campaign_marketplaces.map((campaignMarketplaceProductData: any) => {
              
                const marketplace = systemMarketplaces.find(ele => ele.tenant_system_marketplace_id == campaignMarketplaceProductData.marketplace.tenant_system_marketplace_id)
               
                return <tr>
                        <td><Chip label={marketplace.name.charAt(0).toUpperCase()} size="small" /></td>
                        <td>{campaignMarketplaceProductData[field]}</td>
                    </tr>
           })}
           </tr>
       </table>
    }, [data]);
    

    return VentasByMarketplaceComponent(data);

}


const EditionWarning = (props: any) => {

    return <Tooltip title={props.warning.message}><Chip label={"────"} size={"small"} /></Tooltip>
}

// ventas no implementa esto
/*
export const VentasEditCell = (props: GridRenderEditCellParams) => {
    const { error } = props;
    let evtId = "event-" + props?.id;

    let _warning = (props.value === null) ?
        { active: true, message: "Stocks modificados específicamente" } :
        { active: false, message: "" }

    return (
        <>
            {props?.hasFocus ?
                <>
                    <GridEditInputCell {...props} />
                    <CellSettings warning={_warning} row={props.row} field={props.field} />
                </>
                :
                <>
                    <GridEditInputCell readOnly={true}  {...props} />
                    <CellSettings warning={_warning} row={props.row} field={props.field} />
                </>}
        </>
    );
}
*/

export const VentasRenderCell = (props: GridRenderCellParams) => {

    let _warning = (props.value === null) ?
        { active: true, message: "ventas modificadas específicamente" } :
        { active: false, message: "" }

    return <>
        <div className="table-cell-container">
            <div className="table-cell-content">
                {_warning.active ? <EditionWarning warning={_warning} /> : props.value}
            </div>

            <CellSettings

                warning={_warning}
                row={props.row}
                field={props.field}
                
            >
                <CampaignProductVentas data={props.row} field={props.field} />
            </CellSettings>
        </div>
    </>
}

export default VentasRenderCell;