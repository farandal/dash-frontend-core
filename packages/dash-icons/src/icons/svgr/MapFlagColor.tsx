import * as React from 'react';
import { SVGProps } from 'react';
const SvgMapFlagColor = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<circle
			opacity={0.4}
			cx={12}
			cy={12}
			r={12}
			fill='url(#map-flag-color_svg__a)'
		/>
		<circle
			cx={12}
			cy={12}
			r={8}
			fill='#fff'
			stroke='url(#map-flag-color_svg__b)'
			strokeWidth={2}
		/>
		<path
			d='M13.4 8.5h3.266v5.833h-4.083l-.234-1.166H9.083v4.083H7.916V7.333h5.25l.233 1.167Zm-.234 4.667h1.167V12h1.166v-1.167h-1.166V9.667h-1.167v1.166l-.583-1.166V8.5h-1.167v1.167h-1.167V8.5H9.083v1.167h1.166v1.166H9.083V12h1.166v-1.167h1.167V12h1.167v-1.167L13.166 12v1.167Zm-1.75-2.334V9.667h1.167v1.166h-1.167Zm1.75 0h1.167V12h-1.167v-1.167Z'
			fill='url(#map-flag-color_svg__c)'
		/>
		<defs>
			<linearGradient
				id='map-flag-color_svg__a'
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
			<linearGradient
				id='map-flag-color_svg__b'
				x1={-7.44}
				y1={24.466}
				x2={10.535}
				y2={34.859}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0062FF' />
				<stop offset={0.859} stopColor='#FF6047' />
				<stop offset={1} stopColor='#F98D51' />
			</linearGradient>
			<linearGradient
				id='map-flag-color_svg__c'
				x1={0.141}
				y1={21.122}
				x2={12.036}
				y2={27.19}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0062FF' />
				<stop offset={0.859} stopColor='#FF6047' />
				<stop offset={1} stopColor='#F98D51' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgMapFlagColor;
