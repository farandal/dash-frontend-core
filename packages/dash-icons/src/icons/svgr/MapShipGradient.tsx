import * as React from 'react';
import { SVGProps } from 'react';
const SvgMapShipGradient = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 40 39'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<ellipse
			cx={19.741}
			cy={19.444}
			rx={19.46}
			ry={19.444}
			fill='url(#map-ship-gradient_svg__a)'
		/>
		<path
			d='M15 15h8v2.64l-4-1.307-4 1.307V15Zm-1.373 8.667h.04c1.067 0 2-.587 2.667-1.334.667.747 1.6 1.334 2.667 1.334 1.066 0 2-.587 2.666-1.334.667.747 1.6 1.334 2.667 1.334h.033l1.267-4.46a.721.721 0 0 0-.04-.514.683.683 0 0 0-.4-.333l-.86-.28V15c0-.74-.6-1.333-1.333-1.333h-2v-2h-4v2h-2A1.333 1.333 0 0 0 13.667 15v3.08l-.86.28a.683.683 0 0 0-.4.333.721.721 0 0 0-.04.514l1.26 4.46ZM24.334 25c-.927 0-1.853-.313-2.667-.887a4.586 4.586 0 0 1-5.333 0c-.813.574-1.74.887-2.667.887h-1.333v1.333h1.333c.914 0 1.827-.233 2.667-.666a5.795 5.795 0 0 0 5.333 0c.84.433 1.747.666 2.667.666h1.333V25h-1.333Z'
			fill='#fff'
		/>
		<defs>
			<linearGradient
				id='map-ship-gradient_svg__a'
				x1={-34.302}
				y1={54.072}
				x2={15.65}
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
export default SvgMapShipGradient;
