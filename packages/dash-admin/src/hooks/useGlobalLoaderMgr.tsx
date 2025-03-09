import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGlobalLoaderMgr = () => {
	const useLoader = useState<boolean>(false);
	React.useEffect(() => {
		window.addEventListener('ra-auto-global-loader', (e: any) =>
			useLoader[1](e.data.value),
		);
		return () => {
			window.removeEventListener('ra-auto-global-loader', (e: any) =>
				useLoader[1](e.data.value),
			);
		};
	}, []);
	return useLoader;
};

export default useGlobalLoaderMgr;
