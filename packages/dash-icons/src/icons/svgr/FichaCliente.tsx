import * as React from 'react';
import { SVGProps } from 'react';
const SvgFichaCliente = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M15.5 13a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 1 1 0-2.5ZM13 18v-.625c0-.688 1.119-1.25 2.5-1.25s2.5.563 2.5 1.25V18h-5Z'
			fill='#121857'
		/>
		<path
			d='M6.5 7.5h11M6.5 10.5h11M6.5 13.5h5'
			stroke='#121857'
			strokeLinecap='square'
		/>
		<rect x={3.5} y={3.5} width={17} height={17} rx={1.5} stroke='#121857' />
	</svg>
);
export default SvgFichaCliente;
