import * as React from 'react';
import { SVGProps } from 'react';
const SvgTransferLeft = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M7.914 12h8.172M11.678 15.752S7.914 13.224 7.914 12c0-1.224 3.764-3.748 3.764-3.748'
			stroke='#121857'
			strokeWidth={0.972}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			clipRule='evenodd'
			d='M12 2.75c-6.937 0-9.25 2.313-9.25 9.25 0 6.937 2.313 9.25 9.25 9.25 6.937 0 9.25-2.313 9.25-9.25 0-6.937-2.313-9.25-9.25-9.25Z'
			stroke='#121857'
			strokeWidth={1.458}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgTransferLeft;
