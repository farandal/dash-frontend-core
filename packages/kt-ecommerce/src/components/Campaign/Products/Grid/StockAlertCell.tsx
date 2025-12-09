import { Chip, Tooltip } from "@mui/material";
import {
    GridEditInputCell,
    GridRenderEditCellParams,
    GridRenderCellParams
} from "@mui/x-data-grid";
import { ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import CampaignProductStockAlertsEdit from "./CampaignProductStockAlerts";

import CellSettings from "./CellSettings";

const EditionWarning = (props: any) => {

    return <Tooltip title={props.warning.message}><Chip label={"────"} size={"small"} /></Tooltip>
}



 export const StockAlertEditCell = ({...props}) => {
        const { error,event } = props;
    let evtId = "event-" + props?.id;
    
    let _warning = (props.value === null) ?
        { active: true, message: "Alertas de srock modificadas específicamente" } :
        { active: false, message: "" }

    
    let _error = (error) ?
        { active: true, message: "Error" } :
        { active: false, message: "" }


   /* return (
        <>
            {props?.hasFocus ?
                <>
                    <GridEditInputCell {...props} />
                    <CellSettings error={_error} warning={_warning} row={props.row} field={props.field} >
                        </CellSettings>
                </>
                :
                <>
                    <GridEditInputCell readOnly={true}  {...props} />
                    <CellSettings  error={_error} warning={_warning} row={props.row} field={props.field} >
                    </CellSettings>
                </>}
        </>
    );*/

            return<><GridEditInputCell {...props} />
                        <CellSettings   type="drawer" error={_error} warning={_warning} row={props.row} field={props.field} >
                </CellSettings></>
}

export const StockAlertRenderCell = ({...props}) => {
    const { error,event } = props;

    let _warning = (props.value === null) ?
        { active: true, message: "Alertas de stock modificadas específicamente" } :
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
                type="dialog"
            
            >
                
                <CampaignProductStockAlertsEdit data={props.row} field={props.field} />
            </CellSettings>
        </div>
    </>
}

export default StockAlertEditCell;