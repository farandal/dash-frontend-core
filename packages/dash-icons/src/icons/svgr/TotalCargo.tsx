import * as React from 'react';
import { SVGProps } from 'react';
const SvgTotalCargo = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M21 7c0-2.21-2.239-4-5-4m0 18a5 5 0 0 0 5-5M3 7c0-2.21 2.239-4 5-4m0 18a5 5 0 0 1-5-5'
			stroke='#363853'
			strokeWidth={1.5}
			strokeLinecap='round'
		/>
	</svg>
);
export default SvgTotalCargo;
