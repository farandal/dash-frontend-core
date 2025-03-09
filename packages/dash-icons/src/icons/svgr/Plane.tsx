import * as React from 'react';
import { SVGProps } from 'react';
const SvgPlane = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<rect width={24} height={24} rx={7.778} fill='url(#Plane_svg__a)' />
		<path
			d='M17.707 6.606a.994.994 0 0 1 0 1.414l-2.594 2.593 1.414 6.127-.94.946L13 12.733l-2.6 2.6.24 1.647-.713.706-1.174-2.12-2.126-1.18.706-.72L9 13.913l2.58-2.58-4.953-2.607.946-.94L13.7 9.2l2.593-2.594a1.006 1.006 0 0 1 1.414 0Z'
			fill='#fff'
		/>
		<defs>
			<linearGradient
				id='Plane_svg__a'
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
export default SvgPlane;
