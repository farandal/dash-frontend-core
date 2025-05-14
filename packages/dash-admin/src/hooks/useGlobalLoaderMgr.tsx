import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGlobalLoaderMgr = () => {
	const useLoader = useState<boolean>(false);
	React.useEffect(() => {
 
		window.addEventListener('dash-global-loader', (e: any) => {
            
			return useLoader[1](e.data)
        });
		return () => {
			window.removeEventListener('dash-global-loader', (e: any) =>
				useLoader[1](e.data),
			);
		};
	}, []);
	return useLoader;
};

export default useGlobalLoaderMgr;
