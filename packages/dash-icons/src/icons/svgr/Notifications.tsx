import * as React from 'react';
import { SVGProps } from 'react';
const SvgNotifications = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M10 21h4c0 1.1-.9 2-2 2s-2-.9-2-2Zm11-2v1H3v-1l2-2v-6c0-3.1 2-5.8 5-6.7V4c0-1.1.9-2 2-2s2 .9 2 2v.3c3 .9 5 3.6 5 6.7v6l2 2Zm-4-8c0-2.8-2.2-5-5-5s-5 2.2-5 5v7h10v-7Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgNotifications;
