import * as React from 'react';
import { SVGProps } from 'react';
const SvgMenu = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M28.25 5H3.75a.25.25 0 0 0-.25.25v2c0 .138.112.25.25.25h24.5a.25.25 0 0 0 .25-.25v-2a.25.25 0 0 0-.25-.25Zm0 19.5H3.75a.25.25 0 0 0-.25.25v2c0 .137.112.25.25.25h24.5a.25.25 0 0 0 .25-.25v-2a.25.25 0 0 0-.25-.25Zm0-9.75H3.75a.25.25 0 0 0-.25.25v2c0 .137.112.25.25.25h24.5a.25.25 0 0 0 .25-.25v-2a.25.25 0 0 0-.25-.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgMenu;
