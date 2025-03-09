import * as React from 'react';
import { SVGProps } from 'react';
const SvgStatisticsColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 18' {...props}>
		<defs>
			<linearGradient
				id='StatisticsColor_svg__a'
				x1={-0.1}
				y1={0.07}
				x2={14.93}
				y2={21.55}
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
			d='M20 18H0V0h2v16h2V7h4v9h2V3h4v13h2v-5h4v7Z'
			style={{
				fill: 'url(#StatisticsColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgStatisticsColor;
