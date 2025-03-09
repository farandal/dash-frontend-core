import * as React from 'react';
import { SVGProps } from 'react';
const SvgWidgetIncome = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 17 17'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M2.04 6.318a4.656 4.656 0 0 1 3.534-3.393l.328-.07a11.367 11.367 0 0 1 4.695 0l.328.07a4.656 4.656 0 0 1 3.534 3.393 8.43 8.43 0 0 1 0 4.252 4.656 4.656 0 0 1-3.534 3.393l-.328.07a11.368 11.368 0 0 1-4.695 0l-.328-.07a4.656 4.656 0 0 1-3.533-3.393 8.43 8.43 0 0 1 0-4.252Z'
			stroke='#121857'
			strokeWidth={1.458}
		/>
		<path
			d='M4.36 8.444h1.297l1.296 1.945 2.593-3.89 1.296 1.945h1.297'
			stroke='#121857'
			strokeWidth={0.972}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgWidgetIncome;
