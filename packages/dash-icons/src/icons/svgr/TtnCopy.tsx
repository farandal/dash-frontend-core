import * as React from 'react';
import { SVGProps } from 'react';
const SvgTtnCopy = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M7.44 15H5.995v-4.171H4.687V9.646h4.057v1.183H7.441V15ZM11.872 15h-1.447v-4.171H9.118V9.646h4.057v1.183h-1.303V15ZM19.039 15h-1.897l-1.956-3.772h-.033c.012.115.023.253.033.414.01.161.018.326.026.494.007.166.01.316.01.45V15h-1.281V9.646h1.89l1.948 3.72h.022a27.803 27.803 0 0 1-.022-.406l-.022-.472c-.005-.159-.008-.3-.008-.421V9.646h1.29V15Z'
			fill='#121857'
		/>
		<path
			d='M1.5.75h21a.75.75 0 0 1 .75.75v21a.75.75 0 0 1-.75.75h-21a.75.75 0 0 1-.75-.75v-21A.75.75 0 0 1 1.5.75Z'
			stroke='#121857'
			strokeWidth={1.5}
		/>
	</svg>
);
export default SvgTtnCopy;
