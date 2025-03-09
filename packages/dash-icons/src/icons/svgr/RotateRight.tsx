import * as React from 'react';
import { SVGProps } from 'react';
const SvgRotateRight = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M15.015 7.85c.406-.05.81-.074 1.212-.077v1.996c0 .204.235.316.394.191l4.003-3.16a.244.244 0 0 0 0-.384l-4-3.156a.243.243 0 0 0-.394.19l-.006 2a12.512 12.512 0 0 0-9.831 4.82 12.492 12.492 0 0 0-2.534 9.45h2.34a10.186 10.186 0 0 1 2.019-8.022 10.141 10.141 0 0 1 3.075-2.635 10.152 10.152 0 0 1 3.722-1.212Z'
			fill='#9A65E0'
		/>
		<path
			d='M27.5 13.063H11c-.553 0-1 .446-1 1V27c0 .553.447 1 1 1h16.5c.553 0 1-.447 1-1V14.062c0-.553-.447-1-1-1Zm-1.375 12.562h-13.75V15.437h13.75v10.188Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgRotateRight;
