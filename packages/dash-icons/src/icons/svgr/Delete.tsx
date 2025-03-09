import * as React from 'react';
import { SVGProps } from 'react';
const SvgDelete = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M11.25 5.75H11a.25.25 0 0 0 .25-.25v.25h9.5V5.5c0 .138.113.25.25.25h-.25V8H23V5.5c0-1.103-.897-2-2-2H11c-1.103 0-2 .897-2 2V8h2.25V5.75ZM27 8H5c-.553 0-1 .447-1 1v1c0 .137.112.25.25.25h1.888l.771 16.344A2.002 2.002 0 0 0 8.906 28.5h14.188a1.997 1.997 0 0 0 1.997-1.906l.771-16.344h1.888A.25.25 0 0 0 28 10V9c0-.553-.447-1-1-1Zm-4.147 18.25H9.147l-.756-16h15.218l-.756 16Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgDelete;
