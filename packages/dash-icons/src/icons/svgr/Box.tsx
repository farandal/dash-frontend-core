import * as React from 'react';
import { SVGProps } from 'react';
const SvgBox = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns='http://www.w3.org/2000/svg' {...props}>
		<rect width={22} height={22} rx={7.778} fill='url(#Box_svg__a)' />
		<path
			d='M10.245 4.179c.23-.118.49-.179.755-.179.264 0 .524.061.755.179L17.6 7.143a.75.75 0 0 1 .293.26c.07.11.107.234.107.361v5.849c0 .253-.074.502-.215.72a1.5 1.5 0 0 1-.585.521l-5.445 2.763a1.673 1.673 0 0 1-1.51 0L4.8 14.854a1.5 1.5 0 0 1-.585-.52 1.328 1.328 0 0 1-.215-.72v-5.85c0-.127.037-.251.107-.36a.75.75 0 0 1 .293-.26l5.846-2.965h-.001Z'
			stroke='#fff'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='m4 7.347 7 3.55m0 0 7-3.55m-7 3.55V18'
			stroke='#fff'
			strokeLinejoin='round'
		/>
		<path
			d='m7.5 9.122 7-3.552m-8.166 5.56 2.333 1.188'
			stroke='#fff'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<defs>
			<linearGradient
				id='Box_svg__a'
				x1={-19.549}
				y1={30.59}
				x2={8.699}
				y2={46.922}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0062FF' />
				<stop offset={0.859} stopColor='#FF6047' />
				<stop offset={1} stopColor='#F98D51' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgBox;
