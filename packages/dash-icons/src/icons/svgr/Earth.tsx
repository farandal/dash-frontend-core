import * as React from 'react';
import { SVGProps } from 'react';
const SvgEarth = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<rect width={24} height={24} rx={7.778} fill='url(#Earth_svg__a)' />
		<path
			d='M16 16.334a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6L18.307 12h-2.974v-1.666H17Zm-9 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm9.333-7h-2V6.667H6c-.74 0-1.333.593-1.333 1.333v7.334H6a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h1.333V12l-2-2.666Z'
			fill='#fff'
		/>
		<defs>
			<linearGradient
				id='Earth_svg__a'
				x1={-21.326}
				y1={33.37}
				x2={9.489}
				y2={51.187}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0062FF' />
				<stop offset={0.859} stopColor='#FF6047' />
				<stop offset={1} stopColor='#F98D51' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEarth;
