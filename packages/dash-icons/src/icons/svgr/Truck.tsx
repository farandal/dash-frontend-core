import * as React from 'react';
import { SVGProps } from 'react';
const SvgTruck = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M18 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1.5-9 1.96 2.5H17V9.5h2.5ZM6 18.5a1.5 1.5 0 1 1 0-2.999 1.5 1.5 0 0 1 0 3ZM20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h2v-5l-3-4Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgTruck;
