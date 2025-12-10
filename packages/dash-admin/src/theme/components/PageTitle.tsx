// @Deprecated: not in use.

import React, { PropsWithChildren, ReactNode } from 'react';

export interface IPageTitle extends PropsWithChildren {
	avatar: ReactNode;
	// @ts-ignore - JSX namespace issue
	title: string | JSX.Element;
	subTitle?: string;
	className?: string;
	// @ts-ignore - JSX namespace issue
	extra?: JSX.Element[];
	// custom component props
}

const PageTitle: React.FC<IPageTitle> = ({
	avatar,
	title,
	subTitle,
	className,
	extra,
	children,
	...props
}) => {

    if(!title || title === "") { return <></>}
	return (
		<div className={`dash-page-header ${className || ''}`} {...props}>
			<h3>{title}</h3>
			<b>{subTitle}</b>
			{/*...(avatar && {avatar:{src: avatar}})*/}
			{children || extra}
		</div>
	);
};

export default PageTitle;
