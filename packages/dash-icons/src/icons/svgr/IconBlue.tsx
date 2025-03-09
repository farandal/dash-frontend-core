import * as React from 'react';
import { SVGProps } from 'react';
const SvgIconBlue = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M8.667 6H7.333V4.667h1.334m0 6.666H7.333v-4h1.334m-.667-6a6.667 6.667 0 1 0 0 13.334A6.667 6.667 0 0 0 8 1.333Z'
			fill='#66A2FF'
		/>
	</svg>
);
export default SvgIconBlue;
