import * as React from 'react';
import { SVGProps } from 'react';
const SvgMapDotGreen = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 26 27'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g opacity={0.4} filter='url(#map-dot-green_svg__a)'>
			<circle cx={13} cy={10} r={8.125} fill='#73DD9D' />
		</g>
		<circle
			cx={13}
			cy={10}
			r={4.375}
			fill='#fff'
			stroke='#73DD9D'
			strokeWidth={2}
		/>
		<defs>
			<filter
				id='map-dot-green_svg__a'
				x={0.875}
				y={1.875}
				width={24.25}
				height={24.25}
				filterUnits='userSpaceOnUse'
				colorInterpolationFilters='sRGB'
			>
				<feFlood floodOpacity={0} result='BackgroundImageFix' />
				<feColorMatrix
					in='SourceAlpha'
					values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
					result='hardAlpha'
				/>
				<feOffset dy={4} />
				<feGaussianBlur stdDeviation={2} />
				<feComposite in2='hardAlpha' operator='out' />
				<feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0' />
				<feBlend
					in2='BackgroundImageFix'
					result='effect1_dropShadow_83_37815'
				/>
				<feBlend
					in='SourceGraphic'
					in2='effect1_dropShadow_83_37815'
					result='shape'
				/>
			</filter>
		</defs>
	</svg>
);
export default SvgMapDotGreen;
