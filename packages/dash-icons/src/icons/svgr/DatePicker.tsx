import * as React from 'react';
import { SVGProps } from 'react';
const SvgDatePicker = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M10.724 8H5.276M8.214 5.499s2.51 1.685 2.51 2.501c0 .816-2.51 2.499-2.51 2.499'
			stroke='#B2B3BD'
			strokeWidth={0.972}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			clipRule='evenodd'
			d='M8 14.167c4.625 0 6.167-1.542 6.167-6.167S12.625 1.833 8 1.833 1.833 3.375 1.833 8 3.375 14.167 8 14.167Z'
			stroke='#B2B3BD'
			strokeWidth={1.458}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgDatePicker;
