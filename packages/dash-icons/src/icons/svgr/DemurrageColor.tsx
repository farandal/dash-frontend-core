import * as React from 'react';
import { SVGProps } from 'react';
const SvgDemurrageColor = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 18' {...props}>
		<defs>
			<linearGradient
				id='DemurrageColor_svg__a'
				x1={6.5}
				y1={1.87}
				x2={16.82}
				y2={16.61}
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
			d='M12.5 5H11v5l4.28 2.54.72-1.21-3.5-2.08V5ZM12 0C9.61 0 7.32.95 5.64 2.64A9.001 9.001 0 0 0 3 9H0l3.96 4.03L8 9H5a7.001 7.001 0 1 1 7 7c-1.86 0-3.68-.79-4.94-2.06l-1.42 1.42C7.27 17 9.5 18 12 18s4.68-.95 6.36-2.64C20.05 13.67 21 11.38 21 9s-.95-4.68-2.64-6.36A9.001 9.001 0 0 0 12 0Z'
			style={{
				fill: 'url(#DemurrageColor_svg__a)',
			}}
		/>
	</svg>
);
export default SvgDemurrageColor;
