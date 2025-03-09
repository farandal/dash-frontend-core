import React from 'react';

const useVirtualHash = () => {
	const [hash, setHash] = React.useState<string>(() => window.location.hash);

	const hashChangeHandler = React.useCallback((e) => {
   
		setHash(e.data);
	}, []);

	React.useEffect(() => {
		window.addEventListener('virtualhash', hashChangeHandler);
		return () => {
			window.removeEventListener('virtualhash', hashChangeHandler);
		};
	}, []);

	const _update = React.useCallback(
		(newHash) => {
			history.replaceState(null, '', newHash);
			window.dispatchEvent(new MessageEvent('virtualhash', { data: newHash }));
			//}
		},
		[hash],
	);

	const setVirtualHash = (h: string) => {
		_update(h);
	};

	return { hash, setVirtualHash };
};

export default useVirtualHash;
