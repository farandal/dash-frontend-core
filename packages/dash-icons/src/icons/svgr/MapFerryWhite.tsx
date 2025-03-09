import * as React from 'react';
import { SVGProps } from 'react';
const SvgMapFerryWhite = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 30 30'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<circle opacity={0.4} cx={15} cy={15} r={12.188} fill='#EEE' />
		<circle
			cx={15}
			cy={15}
			r={7.563}
			fill='#fff'
			stroke='#fff'
			strokeWidth={2}
		/>
		<path
			d='M12 12h6v1.98L15 13l-3 .98V12Zm-1.03 6.5H11c.8 0 1.5-.44 2-1 .5.56 1.2 1 2 1s1.5-.44 2-1c.5.56 1.2 1 2 1h.025l.95-3.345a.54.54 0 0 0-.03-.385.513.513 0 0 0-.3-.25L19 14.31V12a1 1 0 0 0-1-1h-1.5V9.5h-3V11H12a1 1 0 0 0-1 1v2.31l-.645.21a.513.513 0 0 0-.3.25.54.54 0 0 0-.03.385l.945 3.345Zm8.03 1c-.695 0-1.39-.235-2-.665a3.44 3.44 0 0 1-4 0c-.61.43-1.305.665-2 .665h-1v1h1c.685 0 1.37-.175 2-.5 1.25.65 2.75.65 4 0 .63.325 1.31.5 2 .5h1v-1h-1Z'
			fill='url(#map-ferry-white_svg__a)'
		/>
		<defs>
			<linearGradient
				id='map-ferry-white_svg__a'
				x1={1.114}
				y1={24.794}
				x2={14.537}
				y2={31.85}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0062FF' />
				<stop offset={0.859} stopColor='#FF6047' />
				<stop offset={1} stopColor='#F98D51' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgMapFerryWhite;
