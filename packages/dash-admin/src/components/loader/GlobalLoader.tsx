/**
 * @author Francisco Aranda - @farandal - http://www.linkedin.com/in/farandal
 * @email farandal@gmail.com
 * @create date 2021-06-30
 * @desc @farandal React Boilerplate Framework - 2020
 */

import { deepmerge } from '@mui/utils';

import React, { PropsWithChildren, useEffect } from 'react';
import useGlobalLoaderMgr from '../../hooks/useGlobalLoaderMgr';

interface IGlobalLoader extends PropsWithChildren {
	styles?: any;
}

const GlobalLoader: React.FC<IGlobalLoader> = ({
	styles,
    children,
}) => {
	const [loading] = useGlobalLoaderMgr();

	useEffect(() => {
		console.log('GlobalLoader loading state changed:', loading);
	}, [loading]);

    if (!loading) return null;

    const wrapperStyle = deepmerge(
        {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        styles?.wrapper
    );

    return (
        <div className='loadingOverlay' style={wrapperStyle}>
            {children}
        </div>
    );

};

export default GlobalLoader;
