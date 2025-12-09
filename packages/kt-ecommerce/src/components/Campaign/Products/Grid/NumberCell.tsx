import {
    GridEditInputCell,
    GridRenderEditCellParams,
    GridRenderCellParams
} from "@mui/x-data-grid";

export const NumberCell = (props: GridRenderEditCellParams) => {
    const { error } = props;

    return (
        <>
            {props?.hasFocus ?
                <>
                    <GridEditInputCell {...props} />
                </>
                :
                <>
                    <GridEditInputCell readOnly={true}  {...props} />
                </>}
        </>
    );
}

export const NumberRenderCell = (props: GridRenderCellParams) => {
    return <>
        <div className="table-cell-container">
            <div className="table-cell-content">
                {props.value}
            </div>
        </div>
    </>
}

export default NumberCell;