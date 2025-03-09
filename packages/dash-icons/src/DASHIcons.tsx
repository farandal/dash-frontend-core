import React, { JSX } from 'react';
import * as Svgicons from './icons/svgr';

export const DASHSvgicons = {
	...Svgicons,
};

export interface IDASHIcons extends React.SVGProps<SVGSVGElement> {
	icon: keyof typeof DASHSvgicons | JSX.Element;
	size?: 10 | 12 | 16 | 20 | 24 | 32 | 60;
	className?: string;
}
const DASHIcons = ({ icon, size, className, ...props }: IDASHIcons) => {
	const _size = size ?? 16;

	if (typeof icon !== 'string') {
		return icon;
	}

	if (DASHSvgicons[icon]) {
		const Icon = DASHSvgicons[icon];
		return (
			<Icon
				className={className}
				width={`${_size}`}
				height={`${_size}`}
				{...props}
			/>
		);
	}
	return <></>;
};

export default DASHIcons;
