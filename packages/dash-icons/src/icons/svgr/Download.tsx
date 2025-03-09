import * as React from 'react';
import { SVGProps } from 'react';
const SvgDownload = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M15.803 20.656a.25.25 0 0 0 .394 0l3.5-4.428a.25.25 0 0 0-.197-.403h-2.316V5.25a.25.25 0 0 0-.25-.25H15.06a.25.25 0 0 0-.25.25v10.572H12.5a.25.25 0 0 0-.197.403l3.5 4.431Zm11.634-1.093h-1.875a.25.25 0 0 0-.25.25v4.812H6.688v-4.813a.25.25 0 0 0-.25-.25H4.563a.25.25 0 0 0-.25.25V26c0 .553.447 1 1 1h21.375c.554 0 1-.447 1-1v-6.188a.25.25 0 0 0-.25-.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgDownload;
