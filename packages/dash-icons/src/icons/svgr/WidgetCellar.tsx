import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetCellar = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M7.569 5.602a.956.956 0 0 1 .863 0l3.34 1.694a.43.43 0 0 1 .167.15c.04.061.061.132.061.205v3.342a.758.758 0 0 1-.123.412.857.857 0 0 1-.334.298L8.432 13.28a.955.955 0 0 1-.863 0l-3.111-1.579a.858.858 0 0 1-.335-.297.759.759 0 0 1-.123-.412V7.651a.38.38 0 0 1 .062-.206.429.429 0 0 1 .167-.149l3.34-1.694h0Z'
			stroke='#121857'
			strokeWidth={0.4}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='m4 7.412 4 2.03m0 0 4-2.03m-4 2.03V13.5'
			stroke='#121857'
			strokeWidth={0.4}
			strokeLinejoin='round'
		/>
		<path
			d='m6 8.427 4-2.03M5.335 9.574l1.334.68'
			stroke='#121857'
			strokeWidth={0.4}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='m1 7.123 7-5M15.003 7.118l-7.006-4.99M2 6.5v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8'
			stroke='#121857'
			strokeWidth={0.6}
			strokeLinecap='round'
		/>
	</svg>
);
export default SvgWidgetCellar;
