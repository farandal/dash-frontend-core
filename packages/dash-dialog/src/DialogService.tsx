import * as React from 'react';
import IAppDialogProps, { AppDialogOptions } from './IAppDialogProps';

import { AppDialog } from './AppDialog';
import {
	FC,
	PropsWithChildren,
	createContext,
	useContext,
	useState,
} from 'react';

export const DialogServiceContext =
	createContext<(options: AppDialogOptions) => void>(null);

export const useDialog = () => useContext(DialogServiceContext);

export interface IDialogServiceProviderProps extends PropsWithChildren {
	component?: FC<IAppDialogProps>;
	componentProps?: Partial<IAppDialogProps>;
}
export const DialogServiceProvider = (props: IDialogServiceProviderProps) => {
	const { component, componentProps = {}, children } = props;

	const DialogComponent: FC<IAppDialogProps> = component || AppDialog;

	const defaultState: IAppDialogProps = {
		open: false,
		variant: 'default',
		content: '',
		title: '',
		children: null,
	};

	const [dialogState, setDialogState] = useState<IAppDialogProps>({...defaultState,...componentProps});

	/*const openDialog = (options: IAppDialogProps) => {
    setDialogState({...dialogState,...options});
  };*/

	const handleCancel = () => {
		setDialogState(null);
		if (dialogState.onCancel) {
			dialogState.onCancel();
		}
	};

	const handleClose = () => {
		setDialogState(null);
		if (dialogState.onClose) {
			dialogState.onClose();
		}
	};

	const handleConfirm = () => {
		setDialogState(null);
		if (dialogState.onConfirm) {
			dialogState.onConfirm();
		}
	};

	const exposedDialogHook = (options: AppDialogOptions) => {
		setDialogState({
			...dialogState,
			...options,
			...(options ? { open: true } : { open: false }),
		});
	};

	return <>
		<DialogComponent
			//open={Boolean(dialogState)}
			{...dialogState}
			/*...(dialogState?.onSubmit && { onSubmit:() => handleSubmit() })*/
			/*...(dialogState?.onClose && { onClose:() => handleClose() })*/
			onConfirm={() => handleConfirm()}
			onClose={() => handleClose()}
			onCancel={() => handleCancel()}
		/>
		<DialogServiceContext.Provider value={exposedDialogHook}>
			{children}
		</DialogServiceContext.Provider>
	</>;
};

export default DialogServiceProvider;
