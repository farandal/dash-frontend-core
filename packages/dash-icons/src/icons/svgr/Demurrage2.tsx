import * as React from 'react';
import { SVGProps } from 'react';
const SvgDemurrage2 = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M16.086 12H7.914M12.321 8.248s3.764 2.528 3.764 3.752c0 1.224-3.764 3.748-3.764 3.748'
			stroke='#121857'
			strokeWidth={0.972}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			clipRule='evenodd'
			d='M12 21.25c6.937 0 9.25-2.314 9.25-9.25 0-6.937-2.313-9.25-9.25-9.25-6.937 0-9.25 2.313-9.25 9.25 0 6.936 2.313 9.25 9.25 9.25Z'
			stroke='#121857'
			strokeWidth={1.458}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgDemurrage2;
