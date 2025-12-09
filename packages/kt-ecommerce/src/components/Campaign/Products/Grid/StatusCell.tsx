import { Chip, Tooltip } from "@mui/material";
import {
    GridRenderCellParams
} from "@mui/x-data-grid";
import { ProductStatus } from "../../Utils";
import CampaignProductStatuses from "./CampaignProductStatuses";

import CellSettings from "./CellSettings";

const EditionWarning = (props: any) => {

    return <Tooltip title={props.warning.message}><Chip label={"────"} size={"small"} /></Tooltip>
}

export const StatusRenderCell = (props: GridRenderCellParams) => {

    let _warning = (props.value === null) ?
        { active: true, message: "Status diferentes por marketplace" } :
        { active: false, message: "" }
    
    return <>
        <div className="table-cell-container">
            <div className="table-cell-content">
                {_warning.active ? <EditionWarning warning={_warning} /> : ProductStatus(props.value)}
            </div>

            <CellSettings
                warning={_warning}
                row={props.row}
                field={props.field}
                
            >
             
                <CampaignProductStatuses data={props.row} field={props.field} />
            </CellSettings>
        </div>
    </>
}


export default StatusRenderCell;