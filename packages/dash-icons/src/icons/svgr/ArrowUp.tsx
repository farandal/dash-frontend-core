import * as React from 'react';
import { SVGProps } from 'react';
const SvgArrowUp = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='m4.876 14.954 10.372 11.953a1 1 0 0 0 1.51 0l10.368-11.953a.25.25 0 0 0-.187-.412h-2.531a.506.506 0 0 0-.379.172l-6.84 7.884V5.001a.25.25 0 0 0-.25-.25h-1.875a.25.25 0 0 0-.25.25v17.597l-6.84-7.884a.496.496 0 0 0-.379-.172H5.064a.249.249 0 0 0-.188.412Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgArrowUp;
