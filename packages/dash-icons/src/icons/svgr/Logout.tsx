import * as React from 'react';
import { SVGProps } from 'react';
const SvgLogout = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='m20.845 11.21-.036.033.036-.034-4.351-4.583a.68.68 0 0 0-.996 0l.036.034-.036-.034a.763.763 0 0 0 0 1.041l.035-.033-.035.033 3.157 3.325H8.743c-.39 0-.703.333-.703.738 0 .404.313.737.703.737h9.912l-3.157 3.325a.763.763 0 0 0 0 1.041.68.68 0 0 0 .996 0l-.036-.033.036.033 4.351-4.583-.032-.03.032.03a.764.764 0 0 0 0-1.04Z'
			fill='#121857'
			stroke='#121857'
			strokeWidth={0.1}
		/>
		<path
			stroke='#121857'
			strokeLinecap='round'
			strokeLinejoin='round'
			d='M4.5 6.5v10.458'
		/>
	</svg>
);
export default SvgLogout;
