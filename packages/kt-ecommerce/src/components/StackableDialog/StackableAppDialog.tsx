import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
  DialogProps
} from '@mui/material'
import Draggable from "react-draggable";



export interface StackableAppDialogOptions extends DialogProps {

  variant?: "danger" | "info";
  title?: string;
  content?: React.ReactNode | string;
  onSubmit?: () => any;
  onClose?: () => any;
  
}

export interface StackableAppDialogOptionsIndexed extends StackableAppDialogOptions {
  id: string;
}

export interface StackableAppDialogProps extends StackableAppDialogOptions {
  open: boolean;
  onSubmit: () => any;
  onClose: () => any;
}

const PaperComponent = (props) => {
  return (
    <Draggable>
      <Paper {...props} />
    </Draggable>
  )
}

export const StackableAppDialog: React.FC<StackableAppDialogProps> = ({
  //open,
  title,
  variant,
  content,
  onSubmit,
  onClose,
  ...rest
}) => {

  return (
    <Dialog 

    PaperComponent={PaperComponent}
    {...rest}
    //hideBackdrop
    //disableEnforceFocus
    //open={open}

    >
      {title ? <DialogTitle id="alert-dialog-title">{title}</DialogTitle> : <></>}
      {content ? <DialogContent>
        {content}
      </DialogContent>: <></>}
      <DialogActions>
          
            {onSubmit && <Button color="primary" onClick={() => onSubmit()}>
              Continuar
            </Button>}
            {onClose &&<Button color="primary" onClick={() => onClose()} autoFocus>
              Cerrar
            </Button>}

      </DialogActions>
    </Dialog>
  );
};
