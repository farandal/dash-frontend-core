import * as React from 'react';
import { SVGProps } from 'react';
const SvgCross = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='m5 5 7 7m0 0 7 7m-7-7 7-7m-7 7-7 7'
			stroke='#121857'
			strokeWidth={1.8}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgCross;
