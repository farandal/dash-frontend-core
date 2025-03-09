import { ModalProps } from '@mui/material';

export interface IAppDialogProps extends Omit<ModalProps, 'content' | 'title'> {
	/** */
	variant: 'default' | 'info' | 'success' | 'danger';
	/** */
	onSubmit?: () => void;
	/** */
	onClose?: () => void;
	/** */
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
	sound?: boolean;
}

export type AppDialogOptions = Omit<IAppDialogProps, 'open' | 'children'>;

export default IAppDialogProps;
