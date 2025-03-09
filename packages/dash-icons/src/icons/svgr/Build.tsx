import * as React from 'react';
import { SVGProps } from 'react';
const SvgBuild = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M28.625 6.563H11.75c-.553 0-1 .446-1 1v7.375H3.375c-.553 0-1 .446-1 1v8.5c0 .553.447 1 1 1H20.25c.553 0 1-.447 1-1v-7.375h7.375c.553 0 1-.447 1-1v-8.5c0-.554-.447-1-1-1Zm-15.75 2.125h6.25v6.25h-6.25v-6.25ZM10.75 23.312H4.5v-6.25h6.25v6.25Zm8.375 0h-6.25v-6.25h6.25v6.25Zm8.375-8.375h-6.25v-6.25h6.25v6.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgBuild;
