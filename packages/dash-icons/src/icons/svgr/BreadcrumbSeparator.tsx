import * as React from 'react';
import { SVGProps } from 'react';
const SvgBreadcrumbSeparator = (props: SVGProps<SVGSVGElement>) => (
	<svg fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
		<path
			d='m9.5 7 5 5-5 5'
			stroke='#121857'
			strokeOpacity={0.4}
			strokeWidth={1.458}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgBreadcrumbSeparator;
