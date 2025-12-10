import { Chip, Tooltip } from "@mui/material";
import {
    GridEditInputCell,
    GridRenderEditCellParams,
    GridRenderCellParams
} from "@mui/x-data-grid";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CampaignProductPriceEdit from "./CampaignProductPrice";

import CellSettings from "./CellSettings";

const EditionWarning = (props: any) => {

    return <Tooltip title={props.warning.message}><Chip label={"────"} size={"small"} /></Tooltip>
}

export const PriceEditCell = ({...props}) => {
    const { error,event } = props;

    let evtId = "event-" + props?.id;
    
    let _warning = (props.value === null) ?
        { active: true, message: "Precios modificados específicamente" } :
        { active: false, message: "" }

    
    let _error = (error) ?
        { active: true, message: "Error" } :
        { active: false, message: "" }


    return (
        <>
            {props?.hasFocus ?
                <>
                {/* @ts-ignore */}
                    <GridEditInputCell {...props} />
                    <CellSettings error={_error} warning={_warning} row={props.row} field={props.field} >
                    </CellSettings>
                </>
                :
                <>
                 {/* @ts-ignore */}
                    <GridEditInputCell readOnly={true}  {...props} />
                    <CellSettings  error={_error} warning={_warning} row={props.row} field={props.field} >
                    </CellSettings>
                </>}
        </>
    );
}

export const PriceRenderCell = ({...props}) => {
    const { error,event } = props;

    let _warning = (props.value === null) ?
        { active: true, message: "Precios modificados específicamente" } :
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
                <CampaignProductPriceEdit data={props.row} field={props.field} />
            </CellSettings>
        </div>
    </>
}

export default PriceEditCell;