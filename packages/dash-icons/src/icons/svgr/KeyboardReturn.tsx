import * as React from 'react';
import { SVGProps } from 'react';
const SvgKeyboardReturn = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.42L5.83 13H21V7h-2Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgKeyboardReturn;
