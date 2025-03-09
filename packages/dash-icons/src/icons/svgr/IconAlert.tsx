import * as React from 'react';
import { SVGProps } from 'react';
const SvgIconAlert = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g clipPath='url(#IconAlert_svg__a)' fill='#F98D51'>
			<path d='m3.24 17.316 7.203-12.421C10.764 4.34 11.358 4 12 4c.642 0 1.235.341 1.556.895l7.203 12.421a1.781 1.781 0 0 1 0 1.79c-.321.553-.915.894-1.557.894H4.797a1.8 1.8 0 0 1-1.557-.895 1.783 1.783 0 0 1 0-1.789Zm15.962.895L12 5.789 4.797 18.21h14.405Z' />
			<path d='M12.899 9.921v3.734a.897.897 0 0 1-.899.894.897.897 0 0 1-.899-.894V9.92c0-.494.403-.895.899-.895s.899.4.899.895ZM11.101 16.131c0 .494.403.895.899.895s.899-.4.899-.895a.897.897 0 0 0-.899-.895c-.496 0-.899.401-.899.895Z' />
		</g>
		<defs>
			<clipPath id='IconAlert_svg__a'>
				<path fill='#fff' transform='matrix(-1 0 0 1 21 4)' d='M0 0h18v16H0z' />
			</clipPath>
		</defs>
	</svg>
);
export default SvgIconAlert;
