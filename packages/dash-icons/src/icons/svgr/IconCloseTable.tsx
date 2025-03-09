import * as React from 'react';
import { SVGProps } from 'react';
const SvgIconCloseTable = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M3.353 8.95A7.511 7.511 0 0 1 8.95 3.353c2.006-.47 4.094-.47 6.1 0a7.511 7.511 0 0 1 5.597 5.597c.47 2.006.47 4.094 0 6.1a7.511 7.511 0 0 1-5.597 5.597c-2.006.47-4.094.47-6.1 0a7.511 7.511 0 0 1-5.597-5.597 13.354 13.354 0 0 1 0-6.1Z'
			stroke='#DD7373'
			strokeWidth={1.5}
		/>
		<path
			d='M9.168 9.168a.573.573 0 0 1 .81 0l2.026 2.025 2.025-2.025a.573.573 0 0 1 .81.81l-2.026 2.026 2.026 2.025a.573.573 0 0 1-.81.81l-2.025-2.026-2.026 2.026a.573.573 0 0 1-.81-.81l2.025-2.025-2.025-2.026a.573.573 0 0 1 0-.81Z'
			fill='#DD7373'
		/>
	</svg>
);
export default SvgIconCloseTable;
