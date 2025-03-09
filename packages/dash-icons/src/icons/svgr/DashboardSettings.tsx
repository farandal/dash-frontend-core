import * as React from 'react';
import { SVGProps } from 'react';
const SvgDashboardSettings = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M21 13.1c-.1 0-.3.1-.4.2l-1 1 2.1 2.1 1-1c.2-.2.2-.6 0-.8l-1.3-1.3c-.1-.1-.2-.2-.4-.2Zm-1.9 1.8-6.1 6V23h2.1l6.1-6.1-2.1-2ZM21 3h-8v6h8V3Zm-2 4h-4V5h4v2Zm-6 11.06V11h8v.1c-.76 0-1.43.4-1.81.79L18.07 13H15v3.07l-2 1.99ZM11 3H3v10h8V3Zm-2 8H5V5h4v6Zm2 9.06V15H3v6h8v-.94ZM9 19H5v-2h4v2Z'
			fill='#121857'
		/>
	</svg>
);
export default SvgDashboardSettings;
