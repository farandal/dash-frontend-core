import React, { forwardRef, useCallback, ReactElement, ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Link, LinkProps, useMatch } from 'react-router-dom';

import { useTranslate, useBasename } from 'react-admin';
import { useSidebarState } from 'react-admin';

export type CustomMenuItemLinkProps = LinkProps & {
	// @ts-ignore - JSX namespace issue
	leftIcon?: JSX.Element;
	primaryText?: ReactNode;
};

const MenuItemLink: React.FC<CustomMenuItemLinkProps> = (props /*, ref*/) => {
	const { className, primaryText, leftIcon, onClick, ...rest } = props;

	const translate = useTranslate();
	const basename = useBasename();

	const [open, setOpen] = useSidebarState();
	const handleMenuTap = useCallback(
		(e) => {
			setOpen(false);

			onClick && onClick(e);
		},
		[setOpen, onClick],
	);

	const to =
		(typeof props.to === 'string' ? props.to : props.to.pathname) || '';
	const match = useMatch({ path: to, end: to === `${basename}/` });

	return (
		<Link
			className={clsx(className, {
				[MenuItemLinkClasses.active]: !!match,
			})}
			//ref={ref}
			tabIndex={0}
			{...rest}
			onClick={handleMenuTap}
		>
			{leftIcon && <span className={MenuItemLinkClasses.icon}>{leftIcon}</span>}
			{typeof primaryText === 'string'
				? translate(primaryText, { _: primaryText })
				: primaryText}
		</Link>
	);
};

const PREFIX = 'RaMenuItemLink';

export const MenuItemLinkClasses = {
	active: `${PREFIX}-active`,
	icon: `${PREFIX}-icon`,
};

export default MenuItemLink;
