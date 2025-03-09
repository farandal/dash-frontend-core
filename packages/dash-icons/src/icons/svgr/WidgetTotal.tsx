import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetTotal = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 17 17'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M14.222 5.111c0-1.473-1.492-2.667-3.333-2.667m0 12a3.333 3.333 0 0 0 3.333-3.333m-12-6c0-1.473 1.493-2.667 3.334-2.667m0 12a3.333 3.333 0 0 1-3.334-3.333'
			stroke='#121857'
			strokeWidth={1.5}
			strokeLinecap='round'
		/>
	</svg>
);
export default SvgWidgetTotal;
