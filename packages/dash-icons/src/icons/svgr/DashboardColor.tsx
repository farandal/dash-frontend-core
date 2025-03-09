import * as React from 'react';
import { SVGProps } from 'react';
const SvgDashboardColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18' {...props}>
		<defs>
			<linearGradient
				id='DashboardColor_svg__a'
				x1={1.81}
				y1={-1.27}
				x2={16.19}
				y2={19.27}
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
			d='M16 2v2h-4V2h4ZM6 2v6H2V2h4Zm10 8v6h-4v-6h4ZM6 14v2H2v-2h4ZM18 0h-8v6h8V0ZM8 0H0v10h8V0Zm10 8h-8v10h8V8ZM8 12H0v6h8v-6Z'
			style={{
				fill: 'url(#DashboardColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgDashboardColor;
