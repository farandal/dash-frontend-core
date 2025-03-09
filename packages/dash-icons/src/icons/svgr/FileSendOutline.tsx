import * as React from 'react';
import { SVGProps } from 'react';
const SvgFileSendOutline = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M14 2H6a2 2 0 0 0-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Zm-5.46-1.5v-2h-4v-2h4v-2l3 3-3 3Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgFileSendOutline;
