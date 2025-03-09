import * as React from 'react';
import { SVGProps } from 'react';
const SvgImport = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M27.76 23.669h-1.682c-.131 0-.24.11-.24.24v1.932H6.159V6.159h19.682v1.932c0 .13.109.24.24.24h1.681a.24.24 0 0 0 .241-.24V4.959a.958.958 0 0 0-.96-.959H4.96A.958.958 0 0 0 4 4.96v22.08c0 .532.428.96.96.96h22.08c.532 0 .96-.428.96-.96v-3.13a.24.24 0 0 0-.24-.241Zm.427-8.794h-9.812V12.5a.25.25 0 0 0-.406-.197l-4.435 3.5a.25.25 0 0 0 0 .394l4.435 3.5a.25.25 0 0 0 .406-.197v-2.375h9.813a.25.25 0 0 0 .25-.25v-1.75a.25.25 0 0 0-.25-.25Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgImport;
