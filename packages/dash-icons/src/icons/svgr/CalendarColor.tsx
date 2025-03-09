import * as React from 'react';
import { SVGProps } from 'react';
const SvgCalendarColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 20' {...props}>
		<defs>
			<linearGradient
				id='CalendarColor_svg__a'
				x1={1.86}
				y1={0.8}
				x2={15.74}
				y2={20.62}
				gradientUnits='userSpaceOnUse'
			>
				<stop offset={0} stopColor='#0068ff' />
				<stop offset={0.07} stopColor='#0967f8' />
				<stop offset={0.18} stopColor='#2266e5' />
				<stop offset={0.32} stopColor='#4c65c7' />
				<stop offset={0.48} stopColor='#86639e' />
				<stop offset={0.67} stopColor='#ce6169' />
				<stop offset={0.78} stopColor='#ff6047' />
				<stop offset={0.99} stopColor='#f98d51' />
			</linearGradient>
		</defs>
		<path
			d='M16 2h-1V0h-2v2H5V0H3v2H2a2 2 0 0 0-2 2v14c0 .53.21 1.04.59 1.41.38.38.88.59 1.41.59h14c.53 0 1.04-.21 1.41-.59.38-.38.59-.88.59-1.41V4c0-.53-.21-1.04-.59-1.41C17.03 2.21 16.53 2 16 2Zm0 16H2V8h14v10Zm0-12H2V4h14v2Z'
			style={{
				fill: 'url(#CalendarColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgCalendarColor;
