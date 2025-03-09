import * as React from 'react';
import { SVGProps } from 'react';
const SvgCheckCircle = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M21.843 11.031h-1.466a.995.995 0 0 0-.81.416l-4.912 6.812-2.225-3.087a1 1 0 0 0-.81-.416h-1.465a.25.25 0 0 0-.203.397l3.894 5.4a.993.993 0 0 0 1.615 0l6.582-9.125a.249.249 0 0 0-.2-.397Z'
			fill='#9A65E0'
		/>
		<path
			d='M16 2C8.269 2 2 8.269 2 16s6.269 14 14 14 14-6.269 14-14S23.731 2 16 2Zm0 25.625C9.581 27.625 4.375 22.419 4.375 16S9.581 4.375 16 4.375 27.625 9.581 27.625 16 22.419 27.625 16 27.625Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgCheckCircle;
