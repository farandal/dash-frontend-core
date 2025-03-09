import React, { PropsWithChildren, ReactNode } from 'react';

export interface IPageTitle extends PropsWithChildren {
	avatar: ReactNode;
	title: string | JSX.Element;
	subTitle?: string;
	className?: string;
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
