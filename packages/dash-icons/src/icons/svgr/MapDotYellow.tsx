import * as React from 'react';
import { SVGProps } from 'react';
const SvgMapDotYellow = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 20 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<circle opacity={0.4} cx={10} cy={10} r={8.125} fill='#FFCB2F' />
		<circle
			cx={10}
			cy={10}
			r={4.375}
			fill='#fff'
			stroke='#FFCB2F'
			strokeWidth={2}
		/>
	</svg>
);
export default SvgMapDotYellow;
