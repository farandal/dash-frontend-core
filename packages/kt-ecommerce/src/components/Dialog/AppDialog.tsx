import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper
} from '@mui/material'
import Draggable from "react-draggable";

export interface AppDialogOptions {
  catchOnCancel?: boolean;
  variant: "danger" | "info";
  title: string;
  content: React.ReactNode | string;
  onSubmit?: () => any;
  onClose?: () => any;
  open?: boolean;
}

export interface AppDialogProps extends AppDialogOptions {
  open: boolean;
}

const PaperComponent = (props) => {
  return (
    <Draggable>
      <Paper {...props} />
    </Draggable>
  )
}

export const AppDialog: React.FC<AppDialogProps> = ({
  open,
  title,
  variant,
  content,
  onSubmit,
  onClose
}) => {

  return (
    <Dialog 
    hideBackdrop
    disableEnforceFocus

    PaperComponent={PaperComponent}

    open={open}
    
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
      <DialogActions>
        {onClose && (
          <Button color="primary" onClick={() => onClose()}>
            Cerrar
          </Button>
        )}
        {onSubmit && (
          <Button color="primary" onClick={() => onSubmit()}>
            Continuar
          </Button>
        )}
       
      </DialogActions>
    </Dialog>
  );
};
