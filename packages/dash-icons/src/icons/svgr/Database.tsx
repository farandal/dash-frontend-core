import * as React from 'react';
import { SVGProps } from 'react';
const SvgDatabase = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M26 2H6c-.553 0-1 .447-1 1v26c0 .553.447 1 1 1h20c.553 0 1-.447 1-1V3c0-.553-.447-1-1-1ZM7.25 4.25h17.5v6.5H7.25v-6.5Zm17.5 15H7.25v-6.5h17.5v6.5Zm0 8.5H7.25v-6.5h17.5v6.5ZM9.5 7.5a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Zm0 8.5a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Zm0 8.5a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgDatabase;
