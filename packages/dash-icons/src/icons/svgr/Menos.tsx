import * as React from 'react';
import { SVGProps } from 'react';
const SvgMenos = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M7.25 12.25h9.5m-13.397 2.8a13.354 13.354 0 0 1 0-6.1A7.511 7.511 0 0 1 8.95 3.353c2.006-.47 4.094-.47 6.1 0a7.511 7.511 0 0 1 5.597 5.597c.47 2.006.47 4.094 0 6.1a7.511 7.511 0 0 1-5.597 5.597c-2.006.47-4.094.47-6.1 0a7.511 7.511 0 0 1-5.597-5.597Z'
			stroke='#121857'
			strokeWidth={1.5}
			strokeLinecap='round'
		/>
	</svg>
);
export default SvgMenos;
