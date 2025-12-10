
import { Dialog, DialogContent, Drawer, Fade, Popover, Tooltip } from "@mui/material";

import React, { FC, memo } from "react";


import { GearBadge, AlertBadge, ErrorBadge } from "./CellSettingsBarIcons";

export interface ICellSettings {
  type?: "drawer" | "dialog" | "tooltip",
  row: any
  field?: string
  warning?: { active: boolean, message: string }
  error?: { active: boolean, message: string }
  className?: any
  children?: React.ReactNode
}

const CellSettingsTooltip: FC<ICellSettings> = ({ type, className, children, row, field, warning, error, ...props }) => {

  if (!warning) warning = { active: false, message: "" }
  if (!error) error = { active: false, message: "" }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const openSettings = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeSettings = () => {
    setAnchorEl(null);
  };

  return <div>
    <div className="table-cell-actions">
      {error.active &&
        <div className="table-cell-action">
          <ErrorBadge onClick={() => { }}><></></ErrorBadge>
        </div>
      }
      {warning.active &&
        <Tooltip title={warning.message}>
          <div className="table-cell-action">

            <AlertBadge onClick={() => { }}><></></AlertBadge>

          </div>
        </Tooltip>
      }
      <div className="table-cell-action">
        <GearBadge onClick={openSettings} ><></></GearBadge>
      </div>
    </div>

    <Popover
       anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}

      id="fade-menu"

      anchorEl={anchorEl}
      open={open}
      onClose={closeSettings}
      TransitionComponent={Fade}
      
     
    >
      <div style={{padding:8}}>
      {children}
      </div>
    </Popover>
  </div>
}

const CellSettingsDialog: FC<ICellSettings> = ({ type,className, children, row, field, warning, error, ...props }) => {

  if (!warning) warning = { active: false, message: "" }
  if (!error) error = { active: false, message: "" }

  const [open, setOpen] = React.useState(false);

  const openSettings = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true);
  };

  const closeSettings = () => {
    setOpen(false);
  };

  return <div>
    <div className="table-cell-actions">
      {error.active &&
        <div className="table-cell-action">
          <ErrorBadge onClick={() => { }}><></></ErrorBadge>
        </div>
      }
      {warning.active &&
        <Tooltip title={warning.message}>
          <div className="table-cell-action">

            <AlertBadge onClick={() => { }}><></></AlertBadge>

          </div>
        </Tooltip>
      }
      <div className="table-cell-action">
        <GearBadge onClick={openSettings} ><></></GearBadge>
      </div>
    </div>

    <Dialog open={open} onClose={closeSettings}>
        <DialogContent>
           {children}
        </DialogContent>
      </Dialog>

  </div>
}



const CellSettingsDrawer: FC<ICellSettings> = ({ type,className, children, row, field, warning, error, ...props }) => {

  if (!warning) warning = { active: false, message: "" }
  if (!error) error = { active: false, message: "" }

  const [open, setOpen] = React.useState(false);

  const openSettings = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true);
  };

  const closeSettings = () => {
    setOpen(false);
  };

  return <div>
    <div className="table-cell-actions">
      {error.active &&
        <div className="table-cell-action">
          <ErrorBadge onClick={() => { }}><></></ErrorBadge>
        </div>
      }
      {warning.active &&
        <Tooltip title={warning.message}>
          <div className="table-cell-action">

            <AlertBadge onClick={() => { }}><></></AlertBadge>

          </div>
        </Tooltip>
      }
      <div className="table-cell-action">
        <GearBadge onClick={openSettings} ><></></GearBadge>
      </div>
    </div>

    <Drawer 
      open={open}
      onClose={closeSettings}
      anchor={'right'}
      PaperProps={{
        sx: { width: "20%" },
      }}
      >
       
           {children}
 
      </Drawer>

  </div>
}


const propsAreEqual = (oldProps, newProps) => {  
  return oldProps.row === newProps.row;
}

const CellSettings: FC<ICellSettings> = ({ type="dialog",...props }) => {
  switch(type) {
    case "tooltip":
      return <CellSettingsTooltip type={type} {...props} />
    case "drawer":
      return <CellSettingsDrawer  type={type} {...props} />
      case "dialog":
      default:
        return <CellSettingsDialog  type={type} {...props} />
  }
}



const MemoizedCellSettings = memo(CellSettings, propsAreEqual);

export default MemoizedCellSettings;
