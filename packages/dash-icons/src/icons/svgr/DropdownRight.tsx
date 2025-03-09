import * as React from 'react';
import { SVGProps } from 'react';
const SvgDropdownRight = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='m9.5 7 5 5-5 5'
			stroke='#121857'
			strokeWidth={1.458}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgDropdownRight;
