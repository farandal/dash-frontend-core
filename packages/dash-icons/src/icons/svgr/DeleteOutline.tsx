import * as React from 'react';
import { SVGProps } from 'react';
const SvgDeleteOutline = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM8 9h8v10H8V9Zm7.5-5-1-1h-5l-1 1H5v2h14V4h-3.5Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgDeleteOutline;
