import * as React from 'react';
import { SVGProps } from 'react';
const SvgCs = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M18.8 11.333C18.4 6.75 16.197 3 12 3c-4.197 0-6.4 3.333-6.8 8.333'
			stroke='#121857'
			strokeWidth={1.25}
			strokeLinecap='round'
		/>
		<path
			d='M5.406 16.333c-.134 2.692 3.004 3.54 4.6 3.37'
			stroke='#121857'
			strokeWidth={0.833}
			strokeLinecap='round'
		/>
		<path
			d='M18 8.833h.667A3.333 3.333 0 0 1 22 12.167v.186a3.147 3.147 0 0 1-3.147 3.147.853.853 0 0 1-.853-.853V8.833ZM6 14.647a.853.853 0 0 1-.853.853A3.147 3.147 0 0 1 2 12.353v-.186a3.333 3.333 0 0 1 3.333-3.334H6v5.814Z'
			fill='#121857'
		/>
		<rect
			x={10.8}
			y={18.833}
			width={2.4}
			height={1.667}
			rx={0.833}
			fill='#121857'
		/>
	</svg>
);
export default SvgCs;
