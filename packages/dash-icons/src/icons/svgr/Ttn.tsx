import * as React from 'react';
import { SVGProps } from 'react';
const SvgTtn = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<rect width={24} height={24} rx={7.778} fill='url(#ttn_svg__a)' />
		<path
			d='M8.96 14h-.964v-2.78h-.871v-.79H9.83v.79h-.87V14ZM11.915 14h-.965v-2.78h-.871v-.79h2.705v.79h-.87V14ZM16.692 14h-1.264l-1.304-2.515h-.022c.008.077.015.169.022.276l.017.33c.005.11.007.21.007.3V14h-.854v-3.57h1.26l1.298 2.481h.015l-.015-.27-.014-.316a9.11 9.11 0 0 1-.005-.28V10.43h.86V14Z'
			fill='#fff'
		/>
		<path
			d='M5 4.75h14a.25.25 0 0 1 .25.25v14a.25.25 0 0 1-.25.25H5a.25.25 0 0 1-.25-.25V5A.25.25 0 0 1 5 4.75Z'
			stroke='#fff'
			strokeWidth={1.5}
		/>
		<defs>
			<linearGradient
				id='ttn_svg__a'
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
export default SvgTtn;
