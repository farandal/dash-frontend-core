import * as React from 'react';
import { SVGProps } from 'react';
const SvgNotificationsColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 21' {...props}>
		<defs>
			<linearGradient
				id='notifications-color_svg__a'
				x1={2.3}
				y1={4.25}
				x2={13.92}
				y2={20.85}
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
			d='M7 19h4c0 1.1-.9 2-2 2s-2-.9-2-2Zm11-2v1H0v-1l2-2V9c0-3.1 2-5.8 5-6.7V2c0-1.1.9-2 2-2s2 .9 2 2v.3c3 .9 5 3.6 5 6.7v6l2 2Zm-4-8c0-2.8-2.2-5-5-5S4 6.2 4 9v7h10V9Z'
			style={{
				fill: 'url(#notifications-color_svg__a)',
			}}
		/>
	</svg>
);
export default SvgNotificationsColor;
