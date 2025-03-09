import * as React from 'react';
import { SVGProps } from 'react';
const SvgInformation = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M13 9h-2V7h2m0 10h-2v-6h2m-1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgInformation;
