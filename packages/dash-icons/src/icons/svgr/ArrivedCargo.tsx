import * as React from 'react';
import { SVGProps } from 'react';
const SvgArrivedCargo = (props: SVGProps<SVGSVGElement>) => (
	<svg fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
		<path
			d='M3.353 8.95A7.511 7.511 0 0 1 8.95 3.353c2.006-.47 4.094-.47 6.1 0a7.511 7.511 0 0 1 5.597 5.597c.47 2.006.47 4.094 0 6.1a7.511 7.511 0 0 1-5.597 5.597c-2.006.47-4.094.47-6.1 0a7.511 7.511 0 0 1-5.597-5.597 13.354 13.354 0 0 1 0-6.1Z'
			stroke='#121857'
			strokeWidth={1.5}
		/>
		<path
			d='m9.25 11.75 2 2 3.5-3.75'
			stroke='#121857'
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgArrivedCargo;
