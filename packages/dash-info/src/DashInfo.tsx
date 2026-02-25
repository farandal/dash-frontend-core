import React, { PropsWithChildren } from 'react';
import {
    Box,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
    Paper,
} from '@mui/material';

import { useEffect, useState } from 'react';

import InfoIcon from '@mui/icons-material/Info';	
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Dangerous';


import { useTranslate } from 'react-admin';
import IDashInfoProps from './IDashInfoProps';

import "./styles/info.less";


export interface IIcon extends PropsWithChildren {
	variant: string,
}

const Icon:React.FC<IIcon> = (props) => {
	const { children, variant } = props;

	switch (variant) {

		case 'success':
			return <>
					<div className={`dash-modal-img dash-modal-img-${variant}`}>
					<CheckCircleIcon />
				</div>
				{children && <div className='dash-modal-title'>{children}</div>}
			</>;
		case 'danger':
			return <>
					<div className={`dash-modal-img dash-modal-img-${variant}`}>
					<ErrorIcon />
				</div>
				{children && <div className='dash-modal-title'>{children}</div>}

		</>;
        case 'info':
        case 'default':
			return <>
				<div className={`dash-modal-img dash-modal-img-${variant}`}>
					<InfoIcon />
				</div>
				{children && <div className='dash-modal-title'>{children}</div>}
			</>;
		default:
			return children ? <div className='dash-modal-title'>{children}</div> : <></>;

	}
};

const DashInfo: React.FC<IDashInfoProps> = (props) => {
	const translate = useTranslate();
	const {
		variant = 'default',
		onCancel,
		onConfirm,
		//onSubmit,
		//closeText = null,
		cancelText = translate('dash.action.cancel'),
        confirmText = translate('dash.action.continue'),
        closeText = null,
		title,
		content = null,
		className,

		showCancelButton = false,
		showConfirmButton = false,
		dialogActions,
        fullscreen = false,

		children,
		...rest
	} = props;
    // Show cancel button if cancelText is provided and showCancelButton is not explicitly set
    const effectiveShowCancelButton = typeof showCancelButton === 'boolean'
        ? showCancelButton
        : !!cancelText;
	const [isModalOpen, setIsModalOpen] = useState(open);



	const handleOnCancel: React.MouseEventHandler<HTMLButtonElement>  = (_e) => {
		
		if (onCancel) { onCancel(); }
	};

	
	const handleOnConfirm = (_e:any) => {
	
		if (onConfirm) { onConfirm(); }
	};

	/* @ts-ignore {...rest} is not properly sanitized */
	return <Box
        component={fullscreen ? 'div' : Paper}
		{...rest}
		className={`dash-modal ${className ? className + ' ' : ''}${fullscreen ? 'fullscreen ' : ''}dash-modal-${variant}`}
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
            
		</DialogActions>
	</Box>;

};

export default DashInfo;
