import { useLogger } from "../../hooks/useLogger";
import * as React from "react";
import { createGlobalState } from 'react-hooks-global-state';
import { StackableAppDialog, StackableAppDialogOptions, StackableAppDialogOptionsIndexed } from "./StackableAppDialog";

export const StackableDialogServiceContext = React.createContext(null);
const { useGlobalState } = createGlobalState({ stackableDialgogs: [] });

export const useStackableDialogServiceContext = () => {
  const context = React.useContext(StackableDialogServiceContext);
  if(!context) throw new Error("Context must be used within the stackable dialogs provider");
  return context;
}

export const StackableDialogServiceProvider = ({ children }) => {
  
  const logger = useLogger("StackableDialogServiceProvider")
  // TODO: Bug, el useState y el GlobalState de todas maneras se refresca, cada vez que se actualiza el recurso del react admin
  const [dialogs,setDialogs] = useGlobalState("stackableDialgogs");
  //const [dialogs,setDialogs] = React.useState<StackableAppDialogOptionsIndexed[]>([]);

  logger.log("Init",dialogs);

  const value = React.useMemo(() => {

    logger.log("Memo",dialogs);
    return {
      dialogs,
      setDialogs
    }
  },[dialogs,setDialogs])
  
  return (
      <StackableDialogServiceContext.Provider value={value}>
        {children}
      </StackableDialogServiceContext.Provider>
    );
  };



 export const StackedDialogs = () => {
    
    const {dialogs} = useStackableDialogServiceContext();

    return <>
        {dialogs.map((dialogState,key) => {

    return <StackableAppDialog key={key}
    open={Boolean(dialogState?.open)}

    {...dialogState}

    {...(dialogState?.id && { id: dialogState.id })}
    {...(dialogState?.title && { title: dialogState.title })}
    {...(dialogState?.content && { content: dialogState.content })}
    {...(dialogState?.variant && { variant: dialogState.variant })}
    {...(dialogState?.onSubmit && { onSubmit: () => dialogState.onSubmit() })}
    {...(dialogState?.onClose && { onClose: () => dialogState.onClose() })}


    />
    })}
    </>

 }



export const useStackableDialog = () => {

  //const { dialogs, setDialogs }:{dialogs:StackableAppDialogOptionsIndexed[],setDialogs:React.Dispatch<React.SetStateAction<StackableAppDialogOptionsIndexed[]>>} = React.useContext(StackableDialogServiceContext);
  const logger = useLogger("StackableDialogServiceProvider")

  const {dialogs,setDialogs} = useStackableDialogServiceContext();
    /**
   * @deprecated The method should not be used
   */
  const getDialog = (id:string) => {
    if(!dialogs.find((dialog:StackableAppDialogOptions) => dialog.id = id )) console.error(`Dialog ${id} not found`);
    const dialog = dialogs.find((dialog:StackableAppDialogOptions) => dialog.id = id );
    return { 
              ...dialog,
              close: update(id,{open:false}),
              open: update(id,{open:true})
    }     
  }

  const update = (id:string,options:Partial<StackableAppDialogOptions>) => {
    
    
    if(!dialogs.find((dialog:StackableAppDialogOptionsIndexed) => dialog.id = id )) { 
      //logger.log(dialogs);
      //logger.error(`Dialog ${id} not found`); 
      return;
    }
    setDialogs(dialogs.map((dialog,idx) => {
      return {
                ...dialog,
                ...(dialog.id === id && { ...options  })
              }
      }));
  }

  const create = (id,newDialog:StackableAppDialogOptions) => {
    if(dialogs.find((dialog:StackableAppDialogOptionsIndexed) => dialog.id = id )) {
      logger.log("Dialog updated - "+id)
      update(id,newDialog);
      return;
    }
    logger.log("Dialog created - "+id)
    setDialogs([...dialogs,{...newDialog,id:id}]);
  }

  const remove = (id:string) => {
    setDialogs([...dialogs.filter(dialog => dialog.id !== id)]);
  }

  const open = (id:string,options?:Partial<StackableAppDialogOptions>) => {
    if(dialogs.find((dialog:StackableAppDialogOptionsIndexed) => dialog.id = id )) {
      if(options) { update(id,{...options,open:true}); return; }
      update(id,{open:true});
      return;
    }
    create(id,{...options,open:true})
  }

  const close = (id:string) => {
    update(id,{open:false});
  }

  return {dialogs,create,remove,update,open,close};

}
