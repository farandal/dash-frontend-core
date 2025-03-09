import * as React from 'react';
import { SVGProps } from 'react';
const SvgMas = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 28 30'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g filter='url(#Mas_svg__a)'>
			<path
				d='M9.25 12.25h9.5M14 7.5V17m-8.647-1.95a13.354 13.354 0 0 1 0-6.1 7.511 7.511 0 0 1 5.597-5.597c2.006-.47 4.094-.47 6.1 0a7.511 7.511 0 0 1 5.597 5.597c.47 2.006.47 4.094 0 6.1a7.511 7.511 0 0 1-5.597 5.597c-2.006.47-4.094.47-6.1 0a7.511 7.511 0 0 1-5.597-5.597Z'
				stroke='#121857'
				strokeWidth={1.5}
				strokeLinecap='round'
			/>
		</g>
		<defs>
			<filter
				id='Mas_svg__a'
				x={-2}
				y={0}
				width={32}
				height={32}
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
					result='effect1_dropShadow_403_1349'
				/>
				<feBlend
					in='SourceGraphic'
					in2='effect1_dropShadow_403_1349'
					result='shape'
				/>
			</filter>
		</defs>
	</svg>
);
export default SvgMas;
