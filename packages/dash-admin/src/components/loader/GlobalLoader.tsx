/**
 * @author Francisco Aranda - @farandal - http://www.linkedin.com/in/farandal
 * @email farandal@gmail.com
 * @create date 2021-06-30
 * @desc @farandal React Boilerplate Framework - 2020
 */

import { deepmerge } from '@mui/utils';

import React, { PropsWithChildren, useEffect } from 'react';
import LoadingOverlay from 'react-loading-overlay-ts';
import useGlobalLoaderMgr from '../../hooks/useGlobalLoaderMgr';

interface IGlobalLoader extends PropsWithChildren {
	styles?: any;
}

const GlobalLoader: React.FC<IGlobalLoader> = ({
	styles,
    children,
	...props
}) => {
	const [loading, setLoading] = useGlobalLoaderMgr();

  
    
    	useEffect(() => {
    		console.log('GlobalLoader loading state changed:', loading);
    1	}, [loading]);
    

    const _styles = deepmerge(
        {
            wrapper: {
                width: '100%',
                height: '100%',
                overflow: loading ? 'hidden' : 'scroll',
            },
            overlay: (base) => ({
                ...base,
            }),
        },
        styles
    );

   
    return loading ? <LoadingOverlay
        className='loadingOverlay'
        active={loading}
        styles={_styles}
        spinner={children}
    /> : <></>

};

export default GlobalLoader;
