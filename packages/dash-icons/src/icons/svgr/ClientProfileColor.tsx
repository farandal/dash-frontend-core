import * as React from 'react';
import { SVGProps } from 'react';
const SvgClientProfileColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' {...props}>
		<defs>
			<linearGradient
				id='ClientProfileColor_svg__a'
				x1={1.84}
				y1={3.43}
				x2={12.41}
				y2={18.52}
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
			d='M8 0c1.06 0 2.08.42 2.83 1.17a4.004 4.004 0 0 1 0 5.66 4.004 4.004 0 0 1-5.66 0 4.004 4.004 0 0 1 0-5.66C5.92.42 6.94 0 8 0Zm0 2c-.53 0-1.04.21-1.41.59a1.983 1.983 0 0 0 0 2.82 1.983 1.983 0 0 0 2.82 0 1.983 1.983 0 0 0 0-2.82C9.03 2.21 8.53 2 8 2Zm0 7c2.67 0 8 1.33 8 4v3H0v-3c0-2.67 5.33-4 8-4Zm0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V13c0-.64-3.13-2.1-6.1-2.1Z'
			style={{
				fill: 'url(#ClientProfileColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgClientProfileColor;
