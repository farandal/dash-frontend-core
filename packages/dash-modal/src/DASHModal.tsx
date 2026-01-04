import React, { PropsWithChildren } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	DialogProps,
	IconButton,
} from '@mui/material';

import { useEffect, useState } from 'react';

import InfoIcon from '@mui/icons-material/Info';	
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

/* @ts-ignore Eslint not capable to find path to resource */
import errorSound from './assets/modalError.mp3';
/* @ts-ignore Eslint not capable to find path to resource */
import successSound from './assets/success.mp3';
/* @ts-ignore Eslint not capable to find path to resource */
import infoSound from './assets/modalInfo.mp3';

import { useTranslate } from 'react-admin';

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
	const translate = useTranslate();
	const {
		variant = 'default',
		onClose,
		onCancel,
		onConfirm,
		//onSubmit,
		open = false,
		//closeText = null,
		confirmText = translate('dash.action.continue'),
		cancelText = translate('dash.action.cancel'),
        closeText = null,
		title,
		content = null,
		className,
        showCloseButton = true,
		showCancelButton = undefined,
		showConfirmButton = true,
		dialogActions,
		sound = true,
		children,
		...rest
	} = props;
    // Show cancel button if cancelText is provided and showCancelButton is not explicitly set
    const effectiveShowCancelButton = typeof showCancelButton === 'boolean'
        ? showCancelButton
        : !!cancelText;
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
		className={(className ? className : '') + 'dash-modal-' + variant}
		open={isModalOpen}
	>
		<DialogTitle id='alert-dialog-title'>
			<Icon variant={variant}  />
			{showCloseButton && !closeText && (
                <IconButton
                    aria-label="close"
                    size='small'
                    onClick={(e) => handleOnClose(e, 'backdropClick')}
                    sx={{
                        position: 'absolute',
                        right: 5,
                        top: 20,
                        color: 'white',
                        bgcolor: 'error.main',
                        '&:hover': {
                            bgcolor: 'error.dark',
                        },
                        borderRadius: '50%',
                        padding: '8px',
                    }}
                >
                    <CloseIcon />
                </IconButton>
			)}
		</DialogTitle>

		<DialogContent>
			<div className='dash-modal-title'>
				<h3>{title}</h3>
			</div>

			{children || content}
		</DialogContent>

		<DialogActions>
			{dialogActions || <></>}
			{effectiveShowCancelButton ? (
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
            {showCloseButton === true && closeText ? (
				<Button
					variant={'contained'}
					className='btn-width-md'
					color='primary'
					onClick={(e) => handleOnClose(e,'backdropClick')}
				>
					{closeText}
				</Button>
			) : (
				<></>
			)}
		</DialogActions>
	</Dialog>;

};

export default DASHModal;
