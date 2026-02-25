import { ModalProps } from '@mui/material';
import { JSX, PropsWithChildren } from 'react';

export interface IAppDialogProps extends PropsWithChildren {	/** */
	variant: 'default' | 'info' | 'success' | 'danger';
	
	onConfirm?: () => void;
	/** */
	onCancel?: () => void;
	/** */
	closeText?: React.ReactNode;
	/** */
	confirmText?: React.ReactNode;
	/** */
	cancelText?: React.ReactNode;
	/** */
	showCancelButton?: boolean;
	/** */
	showConfirmButton?: boolean;
	/** */
	dialogActions?: JSX.Element;
	/** */
	title: string | JSX.Element;
	/** */
	content?: string | JSX.Element;
	/** enable/disable sound (optional) */
    className?: string;

    fullscreen?: boolean;
   
}

export default IAppDialogProps;
