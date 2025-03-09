import * as React from 'react';
import { SVGProps } from 'react';
const SvgFilterVariant = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path d='M6 13h12v-2H6M3 6v2h18V6M10 18h4v-2h-4v2Z' fill='#121857' />
	</svg>
);
export default SvgFilterVariant;
