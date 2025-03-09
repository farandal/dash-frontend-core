import * as React from 'react';
import { SVGProps } from 'react';
const SvgSearchCopy = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M11.5 3A6.5 6.5 0 0 1 18 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 11.5 16a6.5 6.5 0 1 1 0-13Zm0 2C9 5 7 7 7 9.5S9 14 11.5 14 16 12 16 9.5 14 5 11.5 5Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgSearchCopy;
