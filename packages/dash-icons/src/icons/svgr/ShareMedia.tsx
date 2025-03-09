import * as React from 'react';
import { SVGProps } from 'react';
const SvgShareMedia = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M14.75 5.25a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm2.5 3.5a3.492 3.492 0 0 1-2.644-1.206l-4.671 3.003c.202.442.315.935.315 1.453s-.113 1.01-.315 1.453l4.671 3.003a3.5 3.5 0 1 1-.541.84l-4.671-3.002a3.5 3.5 0 1 1 0-4.588l4.671-3.003A3.5 3.5 0 1 1 17.25 8.75Zm-8.383 4.58a.521.521 0 0 0-.027.043 2.5 2.5 0 1 1 .027-.042Zm6.267 4.087a2.5 2.5 0 1 0 4.231 2.666 2.5 2.5 0 0 0-4.23-2.666Z'
			fill='#1B1D21'
		/>
	</svg>
);
export default SvgShareMedia;
