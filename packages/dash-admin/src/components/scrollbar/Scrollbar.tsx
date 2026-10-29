import React, { PropsWithChildren } from 'react';
import { Scrollbars, ScrollbarProps } from 'react-custom-scrollbars-2';

export interface IScrollbar extends PropsWithChildren, ScrollbarProps {
	horizontal?: boolean;
}

// react-custom-scrollbars-2 ships no default thumb/track styling of its own —
// without renderThumbVertical/renderTrackVertical, the browser's native
// scrollbar fills the library's view instead. macOS's overlay-style native
// scrollbar is thin and unobtrusive, so this went unnoticed there; Windows'
// always-visible, chunky native scrollbar looked exactly as out of place as
// it is — plain gray, square-edged, clashing with the dark theme. A themed
// thumb fixes that on every platform, not just Windows.
const thumbStyle: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.25)',
	borderRadius: 'var(--border-radius-base, 4px)',
	cursor: 'pointer',
};

const renderThumb = (props: any) => (
	<div
		{...props}
		style={{ ...props.style, ...thumbStyle }}
		className={(props.className ? props.className + ' ' : '') + 'dash-scrollbar-thumb'}
	/>
);

const Scrollbar: React.FC<IScrollbar> = (props) => {
	const { horizontal, children, ...scrollprops } = props;
	scrollprops.renderTrackVertical = (props) => (
		<div {...props} className='track-vertical' />
	);
	scrollprops.renderThumbVertical = renderThumb;

	if (horizontal) {
		scrollprops.renderTrackHorizontal = (props) => (
			<div {...props} className='track-horizontal' />
		);
		scrollprops.renderThumbHorizontal = renderThumb;
	} else {
		// No consumer of this component opts into horizontal scrolling today
		// (the one sidebar position that needs it, top/bottom, uses a plain
		// Box with overflowX instead — see AppMaterialMenu.tsx). Forcing
		// overflow-x: hidden on the inner view here is a hard guarantee that
		// no content — a long untranslated label, a stray wide child — can
		// ever produce a horizontal scrollbar in a vertical sidebar/panel,
		// rather than relying on every consumer's content to behave.
		scrollprops.renderView = (props) => (
			<div {...props} style={{ ...props.style, overflowX: 'hidden' }} />
		);
	}

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
