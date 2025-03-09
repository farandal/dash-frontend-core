import * as React from 'react';
import { SVGProps } from 'react';
const SvgFormatListChecks = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M3 5h6v6H3V5Zm2 2v2h2V7H5Zm6 0h10v2H11V7Zm0 8h10v2H11v-2Zm-6 5-3.5-3.5 1.41-1.41L5 17.17l4.59-4.58L11 14l-6 6Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgFormatListChecks;
