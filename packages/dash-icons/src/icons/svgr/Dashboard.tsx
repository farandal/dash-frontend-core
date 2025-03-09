import * as React from 'react';
import { SVGProps } from 'react';
const SvgDashboard = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M19 5v2h-4V5h4ZM9 5v6H5V5h4Zm10 8v6h-4v-6h4ZM9 17v2H5v-2h4ZM21 3h-8v6h8V3ZM11 3H3v10h8V3Zm10 8h-8v10h8V11Zm-10 4H3v6h8v-6Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgDashboard;
