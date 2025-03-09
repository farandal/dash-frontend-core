import * as React from 'react';
import { SVGProps } from 'react';
const SvgRedoVariant = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M10.5 7a6.5 6.5 0 1 0 0 13H14v-2h-3.5C8 18 6 16 6 13.5S8 9 10.5 9h5.67l-3.08 3.09 1.41 1.41L20 8l-5.5-5.5-1.42 1.41L16.17 7H10.5ZM18 18h-2v2h2v-2Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgRedoVariant;
