import * as React from 'react';
import { SVGProps } from 'react';
const SvgWarning = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M14.5 22.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM15 13v5.75c0 .137.112.25.25.25h1.5a.25.25 0 0 0 .25-.25V13a.25.25 0 0 0-.25-.25h-1.5A.25.25 0 0 0 15 13Zm14.865 13.75-13-22.5a.988.988 0 0 0-.865-.5.985.985 0 0 0-.866.5l-13 22.5A1 1 0 0 0 3 28.25h26a1 1 0 0 0 .865-1.5Zm-24.484-.872L16 7.497l10.619 18.381H5.38Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgWarning;
