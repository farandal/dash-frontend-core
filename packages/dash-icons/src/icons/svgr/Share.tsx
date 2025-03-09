import * as React from 'react';
import { SVGProps } from 'react';
const SvgShare = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M21.75 10.875 13.875 3v4.5C6 8.625 2.625 14.25 1.5 19.875c2.813-3.938 6.75-5.738 12.375-5.738v4.613l7.875-7.875Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgShare;
