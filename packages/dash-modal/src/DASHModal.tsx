import React, { PropsWithChildren } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	DialogProps,
} from '@mui/material';

import { useEffect, useState } from 'react';

import InfoIcon from '@mui/icons-material/Info';	
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';	

/* @ts-ignore Eslint not capable to find path to resource */
import errorSound from './assets/modalError.mp3';
/* @ts-ignore Eslint not capable to find path to resource */
import successSound from './assets/success.mp3';
/* @ts-ignore Eslint not capable to find path to resource */
import infoSound from './assets/modalInfo.mp3';

import IAppDialogProps from 'dash-dialog/src/IAppDialogProps';

export interface IIcon extends PropsWithChildren {
	variant: string,
}
const Icon:React.FC<IIcon> = (props) => {
	const { children, variant } = props;

	switch (variant) {
		case 'info':
			return <>
				<div className='dash-modal-img'>
					<InfoIcon />
				</div>
				{children && <div className='dash-modal-title'>{children}</div>}
			</>;

		case 'success':
			return <>
				<div className='dash-modal-img'>
					<CheckCircleIcon />
				</div>
				{children && <div className='dash-modal-title'>{children}</div>}
			</>;

		case 'danger':
			return <>
				<div className='dash-modal-img'>
					<ErrorIcon />
				</div>
				{children && <div className='dash-modal-title'>{children}</div>}

		</>;

		case 'default':
		default:
			return children ? <div className='dash-modal-title'>{children}</div> : <></>;

	}
};

const DASHModal: React.FC<IAppDialogProps> = (props) => {
	const {
		variant = 'default',
		onClose,
		onCancel,
		onConfirm,
		//onSubmit,
		open = false,
		//closeText = null,
		confirmText = 'Continuar',
		cancelText = 'Cancelar',
		title,
		content = null,
		className,
		showCancelButton = false,
		showConfirmButton = true,
		dialogActions,
		sound = false,
		children,
		...rest
	} = props;
	const [isModalOpen, setIsModalOpen] = useState(open);

	useEffect(() => {
		setIsModalOpen(open);
	}, [open]);

	const handleOnCancel: React.MouseEventHandler<HTMLButtonElement>  = (_e) => {
		setIsModalOpen(false);
		if (onCancel) { onCancel(); }
	};

	const handleOnClose: DialogProps['onClose'] = (_e, _r) => {
		setIsModalOpen(false);
		if (onClose) { onClose(); }
	};

	const handleOnConfirm = (_e:any) => {
		setIsModalOpen(false);
		if (onConfirm) { onConfirm(); }
	};


	const playSuccess = () => {
		try {
			if(sound) {
			const audio = new Audio(successSound);
			audio.load();
			audio.play();
			}
		} catch (e) {
			console.error(e);
		}
	};

	const playInfo = () => {
		try {
			if(sound) {
			const audio = new Audio(infoSound);
			audio.load();
			audio.play();
			}
		} catch (e) {
			console.error(e);
		}
	};

	const playError = () => {
		try {
			if(sound) {
			const audio = new Audio(errorSound);
			audio.load();
			audio.play();
			}
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		if (isModalOpen === true && variant === 'danger') {
			playError();
			return;
		}

		if (isModalOpen === true && variant === 'success') {
			playSuccess();
			return;
		}

		if (isModalOpen === true) {
			playInfo();
			return;
		}
	}, [isModalOpen, variant]);
	/* @ts-ignore {...rest} is not properly sanitized */
	return <Dialog
		{...rest}
		onClose={handleOnClose}
		//onOk={handleOk}
		className={(className ? className : '') + 'dash-modal-' + variant}
		open={isModalOpen}
	>
		<DialogTitle id='alert-dialog-title'>
			<Icon variant={variant}  />
		</DialogTitle>

		<DialogContent>
			<div className='dash-modal-title'>
				<h3>{title}</h3>
			</div>

			{children || content}
		</DialogContent>

		<DialogActions>
			{dialogActions || <></>}
			{showCancelButton === true ? (
				<Button
					variant={'contained'}
					className='btn-width-md'
					color='primary'
					onClick={handleOnCancel}
				>
					{cancelText}
				</Button>
			) : (
				<></>
			)}
			{showConfirmButton === true ? (
				<Button
					variant={'contained'}
					className='btn-width-md'
					color='primary'
					onClick={handleOnConfirm}
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
				>
					{confirmText}
				</Button>
			) : (
				<></>
			)}
		</DialogActions>
	</Dialog>;

};

export default DASHModal;
