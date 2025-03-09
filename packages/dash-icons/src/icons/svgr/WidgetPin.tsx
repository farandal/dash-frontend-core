import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetPin = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 10 14'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M9.446 4.886c0 .582-.113 1.159-.334 1.697l-.004.01-.003.01a2.38 2.38 0 0 1-.16.372l-3.747 6.376a1.434 1.434 0 0 1-.216.243c-.06.05-.088.052-.09.052l-.01-.001a.199.199 0 0 1-.053-.027 1.078 1.078 0 0 1-.232-.236L1.2 7.512l-.008-.014-.01-.014a4.482 4.482 0 0 1-.83-2.598C.354 2.396 2.403.354 4.9.354c2.5 0 4.546 2.042 4.546 4.532Z'
			stroke='#121857'
			strokeWidth={0.707}
		/>
		<circle
			cx={4.946}
			cy={4.946}
			r={1.923}
			stroke='#121857'
			strokeWidth={0.55}
		/>
	</svg>
);
export default SvgWidgetPin;
