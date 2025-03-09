/**
 * @author Francisco Aranda - @farandal - http://www.linkedin.com/in/farandal
 * @email farandal@gmail.com
 * @create date 2021-06-30
 * @desc @farandal React Boilerplate Framework - 2020
 */

import React, { PropsWithChildren } from 'react';
import LoadingOverlay from 'react-loading-overlay-ts';
import useGlobalLoaderMgr from '../../hooks/useGlobalLoaderMgr';

interface IGlobalLoader extends PropsWithChildren {
	color?: string;
	size?: number;
	overlayBackground?: string;
}

const GlobalLoader: React.FC<IGlobalLoader> = ({
	color = '#222',
	size = 30,
	overlayBackground,
	children,
	...props
}) => {
	const [loading, setLoading] = useGlobalLoaderMgr();
	return loading ? (
		<LoadingOverlay
			className='loadingOverlay'
			active={loading}
			styles={{
				wrapper: {
					width: '100%',
					height: '100%',
					overflow: loading ? 'hidden' : 'scroll',
				},
				overlay: (base) => ({
					...base,
					background: overlayBackground || 'rgba(255, 255, 255, 0.0)',
				}),
			}}
			spinner={children}
		/>
	) : (
		<></>
	);
};

export default GlobalLoader;
