import * as React from 'react';
import { SVGProps } from 'react';
const SvgMenuOpen = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M21 15.61 19.59 17l-5.01-5 5.01-5L21 8.39 17.44 12 21 15.61ZM3 6h13v2H3V6Zm0 7v-2h10v2H3Zm0 5v-2h13v2H3Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgMenuOpen;
