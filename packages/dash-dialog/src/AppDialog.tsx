import * as React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  PaperProps,
} from '@mui/material';

//import Draggable from 'react-draggable';
import IAppDialogProps from './IAppDialogProps';

//const DraggableInstance: any = Draggable;

const PaperComponent = (props: PaperProps) => {
  /*return <DraggableInstance>
    <Paper {...props} />
  </DraggableInstance>*/
  return <Paper {...props} />
};

export const AppDialog: React.FC<IAppDialogProps> = (props) => {  const {
    onClose,
    onConfirm,
    onCancel,
    open,
    closeText = <></>,
    confirmText = <></>,
    cancelText = <></>,
    title,
    variant,
    className,
    showCancelButton = false,
    showConfirmButton = true,
    dialogActions,
    content,
    children,
    ...rest
  } = props;

  const [isModalOpen, setIsModalOpen] = React.useState(open);

  React.useEffect(() => {
    setIsModalOpen(open);
  }, [open]);

  const handleOnClose = (_e: any) => {
    setIsModalOpen(false);
    if (onClose) { onClose(); }
  };

  const handleOnCancel = (_e: any) => {
    setIsModalOpen(false);
    if (onCancel) { onCancel(); }
  };

  const handleOnConfirm = (_e: any) => {
    setIsModalOpen(false);
    if (onConfirm) { onConfirm(); }
  };

  return (
    <Dialog
      hideBackdrop
      disableEnforceFocus
      PaperComponent={PaperComponent}
      onClose={handleOnClose}
      className={className}
      open={isModalOpen}
      {...rest}
    >
      <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
      <DialogContent>{children || content}</DialogContent>
      <DialogActions>
        {dialogActions || <></>}
        {showCancelButton === true ? (
          <Button onClick={handleOnCancel}>{cancelText}</Button>
        ) : (
          <></>
        )}
        {showConfirmButton === true ? (
          <Button onClick={handleOnConfirm} /*autoFocus*/>
            {confirmText}
          </Button>
        ) : (
          <></>
        )}
      </DialogActions>
    </Dialog>
  );
};


export default AppDialog;