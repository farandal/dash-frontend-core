import * as React from 'react';
import { SVGProps } from 'react';
const SvgShip = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<rect width={24} height={24} rx={7.778} fill='url(#Ship_svg__a)' />
		<path
			d='M8 8h8v2.64l-4-1.306-4 1.306V8Zm-1.373 8.667h.04c1.066 0 2-.587 2.666-1.333.667.746 1.6 1.333 2.667 1.333 1.067 0 2-.587 2.667-1.333.666.746 1.6 1.333 2.666 1.333h.034l1.266-4.46a.72.72 0 0 0-.04-.513.684.684 0 0 0-.4-.334l-.86-.28V8c0-.74-.6-1.333-1.333-1.333h-2v-2h-4v2H8A1.333 1.333 0 0 0 6.667 8v3.08l-.86.28a.684.684 0 0 0-.4.334.72.72 0 0 0-.04.513l1.26 4.46ZM17.333 18c-.926 0-1.853-.313-2.666-.886a4.586 4.586 0 0 1-5.334 0c-.813.573-1.74.886-2.666.886H5.333v1.334h1.334a5.83 5.83 0 0 0 2.666-.667 5.795 5.795 0 0 0 5.334 0 5.81 5.81 0 0 0 2.666.667h1.334V18h-1.334Z'
			fill='#fff'
		/>
		<defs>
			<linearGradient
				id='Ship_svg__a'
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
export default SvgShip;
