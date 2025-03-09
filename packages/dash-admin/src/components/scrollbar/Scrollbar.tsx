import React, { PropsWithChildren } from 'react';
import { Scrollbars, ScrollbarProps } from 'react-custom-scrollbars-2';

export interface IScrollbar extends PropsWithChildren, ScrollbarProps {
	horizontal?: boolean;
}

const Scrollbar: React.FC<IScrollbar> = (props) => {
	const { horizontal, children, ...scrollprops } = props;
	scrollprops.renderTrackVertical = (props) => (
		<div {...props} className='track-vertical' />
	);
	if (horizontal)
		scrollprops.renderTrackHorizontal = (props) => (
			<div {...props} className='track-horizontal' />
		);

	return (
		<Scrollbars
			{...props}
			{...scrollprops}
			autoHide
			autoHideTimeout={1000}
			autoHideDuration={200}
		>
			{children}
		</Scrollbars>
	);
};

export default Scrollbar;
