import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetArrive = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 17 17'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M3.207 6.411A5.008 5.008 0 0 1 6.94 2.68a8.902 8.902 0 0 1 4.066 0 5.007 5.007 0 0 1 3.732 3.731 8.902 8.902 0 0 1 0 4.066 5.007 5.007 0 0 1-3.732 3.732 8.901 8.901 0 0 1-4.066 0 5.008 5.008 0 0 1-3.732-3.732 8.902 8.902 0 0 1 0-4.066Z'
			stroke='#121857'
			strokeWidth={1.5}
		/>
		<path
			d='M7.139 8.278 8.472 9.61l2.334-2.5'
			stroke='#121857'
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgWidgetArrive;
