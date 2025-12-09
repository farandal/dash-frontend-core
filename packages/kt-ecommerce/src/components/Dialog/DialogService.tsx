import * as React from "react";
import { AppDialog, AppDialogOptions, AppDialogProps } from "./AppDialog";

const DialogServiceContext = React.createContext<(options: AppDialogOptions) => void>(null);

export const useDialog = () =>
  React.useContext(DialogServiceContext);

export const DialogServiceProvider = ({ children }) => {
  
  const [
    dialogState,
    setDialogState
  ] = React.useState<AppDialogOptions>(null);
  
  /*({
    catchOnCancel: false,
    variant: "info",
    title: null,
    content: null,
    onSubmit: () =>  {},
    onClose: () => {},
    open: false,
  });*/
  
  const openDialog = (options: AppDialogOptions) => {
    setDialogState(options);
  };
  
  const handleClose = () => {
   
    setDialogState(null);
    //dashStorage.removeItem('axiosError');
    dialogState.onClose && dialogState.onClose();

  };
  
  const handleSubmit = () => {
   
    setDialogState(null);
    //dashStorage.removeItem('axiosError');
    dialogState.onSubmit && dialogState.onSubmit();
  };

  //const {onSubmit, onClose, open, ...otherDialogStateProps} = dialogState;

  return (
    <>
      <DialogServiceContext.Provider
        value={openDialog}
        children={children}
      />
      <AppDialog
        open={Boolean(dialogState)}
        {...dialogState}
        /*...(dialogState?.onSubmit && { onSubmit:() => handleSubmit() })*/
        /*...(dialogState?.onClose && { onClose:() => handleClose() })*/
        onSubmit={() => handleSubmit()}
        onClose={() => handleClose()}
      
      />
     
    </>
  );

};
