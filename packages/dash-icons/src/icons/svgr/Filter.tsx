import * as React from 'react';
import { SVGProps } from 'react';
const SvgFilter = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M27.503 4.813H4.497a.999.999 0 0 0-.86 1.5l7.27 12.356v7.518c0 .554.443 1 .993 1h8.2c.55 0 .994-.446.994-1V18.67l7.272-12.357c.381-.665-.097-1.5-.863-1.5Zm-8.647 20.125h-5.712v-4.875h5.716v4.875h-.004Zm.3-7.394-.296.518h-5.72l-.296-.518L6.647 7.062h18.706l-6.197 10.482Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgFilter;
