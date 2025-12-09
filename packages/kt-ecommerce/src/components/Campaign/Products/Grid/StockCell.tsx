import { Chip, Tooltip } from "@mui/material";
import {
    GridEditInputCell,
    GridRenderEditCellParams,
    GridRenderCellParams
} from "@mui/x-data-grid";

import CellSettings from "./CellSettings";
import { CampaignProductStockEdit } from "./CampaignProductStock";

const EditionWarning = (props: any) => {

    return <Tooltip title={props.warning.message}><Chip label={"────"} size={"small"} /></Tooltip>
}

export const StockEditCell = (props: GridRenderEditCellParams) => {

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
                    <CellSettings warning={_warning} row={props.row} field={props.field} >
                    </CellSettings>
                </>
                :
                <>
                    <GridEditInputCell readOnly={true}  {...props} />
                    <CellSettings warning={_warning} row={props.row} field={props.field} >
                    </CellSettings>
                </>}
        </>
    );
}

export const StockRenderCell = (props: GridRenderCellParams) => {

    let _warning = (props.value === null) ?
        { active: true, message: "Stocks modificados específicamente" } :
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
                <CampaignProductStockEdit data={props.row} field={props.field} />
            </CellSettings>
        </div>
    </>
}

export default StockEditCell;