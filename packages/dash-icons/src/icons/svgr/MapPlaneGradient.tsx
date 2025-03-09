import * as React from 'react';
import { SVGProps } from 'react';
const SvgMapPlaneGradient = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 40 39'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<ellipse
			cx={20.001}
			cy={19.444}
			rx={19.46}
			ry={19.444}
			fill='url(#map-plane-gradient_svg__a)'
		/>
		<path
			d='M25.267 13.607a.993.993 0 0 1 0 1.413l-2.596 2.593 1.415 6.127-.941.947-2.589-4.954-2.602 2.6.24 1.647-.714.707-1.174-2.12-2.128-1.18.707-.72 1.668.246 2.582-2.58-4.957-2.606.947-.94 6.132 1.413 2.595-2.593a1.007 1.007 0 0 1 1.415 0Z'
			fill='#fff'
		/>
		<defs>
			<linearGradient
				id='map-plane-gradient_svg__a'
				x1={-34.042}
				y1={54.072}
				x2={15.909}
				y2={82.976}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0062FF' />
				<stop offset={0.859} stopColor='#FF6047' />
				<stop offset={1} stopColor='#F98D51' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgMapPlaneGradient;
