import * as React from 'react';
import { SVGProps } from 'react';
const SvgNotification = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 158 162'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			opacity={0.15}
			d='M85 140.001c30.375 0 55-24.577 55-55 0-30.424-24.734-55-55-55-30.375 0-55 24.576-55 55 0 30.423 24.625 55 55 55ZM146.525 118.729a4.839 4.839 0 1 0 0-9.678 4.839 4.839 0 0 0 0 9.678ZM153.607 99.845a3.304 3.304 0 1 0 0-6.609 3.304 3.304 0 0 0 0 6.609ZM26.32 40.626a3.305 3.305 0 1 0-.001-6.61 3.305 3.305 0 0 0 0 6.61ZM6.137 104.357a6.137 6.137 0 1 0 0-12.275 6.137 6.137 0 0 0 0 12.275Z'
			fill='#66A2FF'
		/>
		<g filter='url(#notification_svg__a)'>
			<path
				d='M90.478 101.781H77.18c-3.081 0-5.676 2.842-5.676 6.218v7.283c0 7.462 5.514 13.502 12.325 13.502 6.811 0 12.325-6.04 12.325-13.502v-7.283c0-3.553-2.595-6.218-5.676-6.218Z'
				fill='url(#notification_svg__b)'
			/>
		</g>
		<g filter='url(#notification_svg__c)'>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M76.001 31.99v-1.242c0-3.729 2.92-6.647 6.649-6.647 3.73 0 6.649 2.918 6.649 6.647v1.243c13.011 3.01 22.703 14.662 22.703 28.588v3.729c0 31.45 23.677 52.04 23.677 52.04H29.458s23.839-20.59 23.839-52.04v-3.73C53.297 46.654 62.989 35 76 31.99Z'
				fill='url(#notification_svg__d)'
			/>
		</g>
		<path
			d='M70.324 77.114c-4.054 0-7.46-2.594-8.757-6.323-.324-.81.163-1.621.973-1.945.811-.325 1.622.162 1.946.972.811 2.432 3.244 4.215 5.838 4.215 2.595 0 5.028-1.62 5.838-4.215.325-.81 1.136-1.297 1.947-.972.81.324 1.297 1.134.973 1.945-1.298 3.89-4.703 6.323-8.758 6.323ZM94.811 77.113c-4.054 0-7.46-2.594-8.757-6.322-.324-.81.162-1.621.973-1.946.811-.324 1.622.162 1.946.973.811 2.432 3.244 4.215 5.838 4.215 2.595 0 5.028-1.621 5.839-4.215.324-.81 1.135-1.297 1.946-.973.81.325 1.297 1.135.973 1.946-1.298 3.89-4.703 6.322-8.758 6.322ZM82.649 96.964a3.73 3.73 0 1 0 .001-7.459 3.73 3.73 0 0 0-.001 7.459ZM102.636 5.488V0h21.209v5.488l-14.472 17.46h14.721v5.488h-22.207v-5.488l14.472-17.46h-13.723ZM120.101 46.644v-3.492h13.724v3.492l-9.232 11.225h9.481v3.492h-14.472V57.87l9.233-11.225h-8.734Z'
			fill='#66A2FF'
		/>
		<defs>
			<linearGradient
				id='notification_svg__b'
				x1={83.821}
				y1={101.156}
				x2={83.821}
				y2={129.075}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#FDFEFF' />
				<stop offset={0.996} stopColor='#ECF0F5' />
			</linearGradient>
			<linearGradient
				id='notification_svg__d'
				x1={82.534}
				y1={21.967}
				x2={82.534}
				y2={117.343}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#FDFEFF' />
				<stop offset={0.996} stopColor='#ECF0F5' />
			</linearGradient>
			<filter
				id='notification_svg__a'
				x={49.504}
				y={90.781}
				width={68.65}
				height={71.003}
				filterUnits='userSpaceOnUse'
				colorInterpolationFilters='sRGB'
			>
				<feFlood floodOpacity={0} result='BackgroundImageFix' />
				<feColorMatrix
					in='SourceAlpha'
					values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
					result='hardAlpha'
				/>
				<feOffset dy={11} />
				<feGaussianBlur stdDeviation={11} />
				<feColorMatrix values='0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0' />
				<feBlend
					in2='BackgroundImageFix'
					result='effect1_dropShadow_1031_602'
				/>
				<feBlend
					in='SourceGraphic'
					in2='effect1_dropShadow_1031_602'
					result='shape'
				/>
			</filter>
			<filter
				id='notification_svg__c'
				x={7.458}
				y={13.101}
				width={150.221}
				height={136.247}
				filterUnits='userSpaceOnUse'
				colorInterpolationFilters='sRGB'
			>
				<feFlood floodOpacity={0} result='BackgroundImageFix' />
				<feColorMatrix
					in='SourceAlpha'
					values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
					result='hardAlpha'
				/>
				<feOffset dy={11} />
				<feGaussianBlur stdDeviation={11} />
				<feColorMatrix values='0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0' />
				<feBlend
					in2='BackgroundImageFix'
					result='effect1_dropShadow_1031_602'
				/>
				<feBlend
					in='SourceGraphic'
					in2='effect1_dropShadow_1031_602'
					result='shape'
				/>
			</filter>
		</defs>
	</svg>
);
export default SvgNotification;
