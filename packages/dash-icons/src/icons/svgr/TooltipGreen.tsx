import * as React from 'react';
import { SVGProps } from 'react';
const SvgTooltipGreen = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 25'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M15.5 13.13a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5Zm-2.5 5v-.626c0-.687 1.119-1.25 2.5-1.25s2.5.563 2.5 1.25v.625h-5Z'
			fill='#73DD9D'
		/>
		<path
			d='M6.5 7.63h11M6.5 10.63h11M6.5 13.63h5'
			stroke='#73DD9D'
			strokeLinecap='square'
		/>
		<rect x={3.5} y={3.629} width={17} height={17} rx={1.5} stroke='#73DD9D' />
	</svg>
);
export default SvgTooltipGreen;
