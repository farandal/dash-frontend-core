import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { Typography } from '@mui/material'
import HtmlTooltip from '../Misc/HtmlToolTip'


const ProductStatusCell: React.FC<GridRenderCellParams> = (props) => {
  return (
    <HtmlTooltip
      title={
        <React.Fragment>
          <Typography color="inherit">Historial</Typography>
          {JSON.stringify(props.row?.local_status_history)}
        </React.Fragment>
      }
    >
      <Typography color="inherit">{props.formattedValue}</Typography>
    </HtmlTooltip>
  )
}

export default ProductStatusCell
