import * as React from 'react';
import { SVGProps } from 'react';
const SvgMedicineBox = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M26.225 8.69a1 1 0 0 0-.95-.69H23V4.5c0-.553-.447-1-1-1H10c-.553 0-1 .447-1 1V8H6.725a.997.997 0 0 0-.95.69L3.5 15.689V27.5c0 .553.447 1 1 1h23c.553 0 1-.447 1-1V15.687l-2.275-6.996ZM11.25 5.75h9.5V8h-9.5V5.75Zm15 20.5H5.75V16.044l1.884-5.794h16.732l1.884 5.794V26.25Zm-5.875-8.375H17V14.5a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25v3.375h-3.375a.25.25 0 0 0-.25.25v1.5c0 .137.113.25.25.25H15v3.375c0 .137.113.25.25.25h1.5a.25.25 0 0 0 .25-.25v-3.375h3.375a.25.25 0 0 0 .25-.25v-1.5a.25.25 0 0 0-.25-.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgMedicineBox;
