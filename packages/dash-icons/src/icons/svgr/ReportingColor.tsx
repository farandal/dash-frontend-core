import * as React from 'react';
import { SVGProps } from 'react';
const SvgReportingColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18' {...props}>
		<defs>
			<linearGradient
				id='reporting-color_svg__a'
				x1={4.19}
				y1={2.13}
				x2={13.95}
				y2={16.06}
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
			d='m13.18 16.6-2.01-3.48c.98-.72 1.66-1.84 1.8-3.12H17a8.55 8.55 0 0 1-3.82 6.6ZM10 4.03V0c4.3.26 7.74 3.7 8 8h-4.03A4.488 4.488 0 0 0 10 4.03ZM4 9.5c0 .64.13 1.25.38 1.8L.9 13.31A8.42 8.42 0 0 1 0 9.5C0 4.97 3.54 1.27 8 1v4.03c-2.25.25-4 2.15-4 4.47ZM8.5 18c-2.97 0-5.58-1.5-7.1-3.82l3.48-2.01A4.47 4.47 0 0 0 8.5 14c.64 0 1.25-.13 1.8-.38l2.01 3.48c-1.15.58-2.44.9-3.81.9Z'
			style={{
				fill: 'url(#reporting-color_svg__a)',
			}}
		/>
	</svg>
);
export default SvgReportingColor;
