import * as React from 'react';
import { SVGProps } from 'react';
const SvgStepArrow = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 16 14'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='m7.346 13.257 7.47-5.834a.57.57 0 0 0 .16-.191.514.514 0 0 0 0-.467.57.57 0 0 0-.16-.191L7.347.74A.171.171 0 0 0 7.18.72a.152.152 0 0 0-.066.052.13.13 0 0 0-.025.076V2.27c0 .08.04.158.108.212l4.928 3.848H1.124c-.085 0-.156.064-.156.14v1.056c0 .077.07.14.156.14h10.998l-4.927 3.848a.268.268 0 0 0-.108.213v1.424c0 .12.157.184.258.105Z'
			fill='#9A65E0'
		/>
	</svg>
);
export default SvgStepArrow;
