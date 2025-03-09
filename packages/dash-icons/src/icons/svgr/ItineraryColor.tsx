import * as React from 'react';
import { SVGProps } from 'react';
const SvgItineraryColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 21' {...props}>
		<defs>
			<linearGradient
				id='ItineraryColor_svg__a'
				x1={2.81}
				y1={0.16}
				x2={17.01}
				y2={20.44}
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
			d='M13 10h1.5v4.25l2.86 1.69-.75 1.22L13 15v-5Zm1-3c.69 0 1.37.1 2 .29V2.7l-3 1.16v3.21c.33-.07.66-.07 1-.07Zm7 7a7.001 7.001 0 0 1-7 7c-3 0-5.6-1.92-6.58-4.6L6 15.9.66 17.97.5 18a.47.47 0 0 1-.35-.15.51.51 0 0 1-.15-.35V2.38c0-.23.15-.41.36-.48L6 0l6 2.1L17.34.03 17.5 0c.13 0 .26.05.35.15.09.09.15.22.15.35v7.75c1.81 1.25 3 3.37 3 5.75ZM7 14c0-2.79 1.63-5.2 4-6.33v-3.8l-4-1.4V14Zm7-5c-1.33 0-2.6.53-3.54 1.46C9.52 11.4 9 12.67 9 14s.53 2.6 1.46 3.54C11.4 18.48 12.67 19 14 19s2.6-.53 3.54-1.46C18.48 16.6 19 15.33 19 14s-.53-2.6-1.46-3.54A4.994 4.994 0 0 0 14 9ZM2 3.46v11.85l3-1.16V2.45L2 3.46Z'
			style={{
				fill: 'url(#ItineraryColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgItineraryColor;
