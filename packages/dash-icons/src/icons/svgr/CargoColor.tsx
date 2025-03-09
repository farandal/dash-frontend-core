import * as React from 'react';
import { SVGProps } from 'react';
const SvgCargoColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 20' {...props}>
		<defs>
			<linearGradient
				id='CargoColor_svg__a'
				x1={3.68}
				y1={2.4}
				x2={14.32}
				y2={17.6}
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
			d='M18 14.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 0 14.5v-9c0-.38.21-.71.53-.88L8.43.18C8.59.06 8.79 0 9 0s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9ZM9 2.15 7.11 3.22 13 6.61l1.96-1.11L9 2.15ZM3.04 5.5 9 8.85l1.96-1.1-5.88-3.4L3.04 5.5ZM2 13.91l6 3.38v-6.71L2 7.21v6.7Zm14 0v-6.7l-6 3.37v6.71l6-3.38Z'
			style={{
				fill: 'url(#CargoColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgCargoColor;
