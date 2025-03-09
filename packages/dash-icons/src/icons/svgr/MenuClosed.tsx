import * as React from 'react';
import { SVGProps } from 'react';
const SvgMenuClosed = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M3 8.39 4.41 7l5.01 5-5.01 5L3 15.61 6.56 12 3 8.39ZM21 18H8v-2h13v2Zm0-7v2H11v-2h10Zm0-5v2H8V6h13Z'
			fill='#fff'
		/>
	</svg>
);
export default SvgMenuClosed;
