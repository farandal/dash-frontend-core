import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetDemurrage = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 17 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M11.148 8.111H5.852M8.708 5.68s2.44 1.638 2.44 2.431c0 .793-2.44 2.43-2.44 2.43'
			stroke='#121857'
			strokeWidth={0.972}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			clipRule='evenodd'
			d='M8.5 14.106c4.496 0 5.995-1.499 5.995-5.995S12.996 2.116 8.5 2.116 2.505 3.615 2.505 8.11s1.499 5.995 5.995 5.995Z'
			stroke='#121857'
			strokeWidth={1.458}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgWidgetDemurrage;
