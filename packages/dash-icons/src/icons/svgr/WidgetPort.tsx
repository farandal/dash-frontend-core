import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetPort = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M8.4 1.667v1.266A1.267 1.267 0 1 1 7.133 4.2'
			stroke='#121857'
			strokeWidth={0.633}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='m1.434 8.633 6.442-2.928a1.267 1.267 0 0 1 1.049 0l6.442 2.928'
			stroke='#121857'
			strokeWidth={0.76}
			strokeLinecap='round'
		/>
		<rect
			x={1.117}
			y={8.316}
			width={14.567}
			height={6.967}
			rx={0.317}
			fill='#fff'
			stroke='#121857'
			strokeWidth={0.633}
		/>
		<path
			d='M3.333 9.9v3.8M5.866 9.9v3.8M8.4 9.9v3.8M10.934 9.9v3.8M13.467 9.9v3.8'
			stroke='#121857'
			strokeWidth={0.76}
			strokeLinecap='round'
		/>
		<mask id='WidgetPort_svg__a' fill='#fff'>
			<rect x={7.133} y={0.4} width={2.533} height={1.267} rx={0.253} />
		</mask>
		<rect
			x={7.133}
			y={0.4}
			width={2.533}
			height={1.267}
			rx={0.253}
			fill='#fff'
			stroke='#121857'
			strokeWidth={0.76}
			mask='url(#WidgetPort_svg__a)'
		/>
	</svg>
);
export default SvgWidgetPort;
