import * as React from 'react';
import { SVGProps } from 'react';
const SvgMinus = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path d='M19 13H5v-2h14v2Z' fill='#121857' />
	</svg>
);
export default SvgMinus;
