import * as React from 'react';
import { SVGProps } from 'react';
const SvgBlock = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M26.75 11.75h-6.5v-6.5c0-.275-.225-.5-.5-.5H5.25c-.275 0-.5.225-.5.5v14.5c0 .275.225.5.5.5h6.5v6.5c0 .275.225.5.5.5h14.5c.275 0 .5-.225.5-.5v-14.5c0-.275-.225-.5-.5-.5Zm-15 .5v5.875H6.875V6.875h11.25v4.875H12.25c-.275 0-.5.225-.5.5Zm6.375 1.625v4.25h-4.25v-4.25h4.25Zm7 11.25h-11.25V20.25h5.875c.275 0 .5-.225.5-.5v-5.875h4.875v11.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgBlock;
