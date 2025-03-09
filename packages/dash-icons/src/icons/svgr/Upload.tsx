import * as React from 'react';
import { SVGProps } from 'react';
const SvgUpload = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M12.5 9.93h2.31V20.5c0 .138.112.25.25.25h1.874a.25.25 0 0 0 .25-.25V9.93H19.5a.25.25 0 0 0 .197-.403l-3.5-4.431a.25.25 0 0 0-.394 0l-3.5 4.428a.251.251 0 0 0 .197.406Zm14.938 9.634h-1.875a.25.25 0 0 0-.25.25v4.812H6.688v-4.812a.25.25 0 0 0-.25-.25H4.563a.25.25 0 0 0-.25.25V26c0 .553.446 1 1 1h21.375c.553 0 1-.447 1-1v-6.187a.25.25 0 0 0-.25-.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgUpload;
