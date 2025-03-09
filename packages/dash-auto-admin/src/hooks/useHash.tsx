import React from 'react';

const useHash = () => {
	const [hash, setHash] = React.useState(() => window.location.hash);

	const hashChangeHandler = React.useCallback(() => {
		setHash(window.location.hash);
	}, []);

	React.useEffect(() => {
		window.addEventListener('hashchange', hashChangeHandler);
		return () => {
			window.removeEventListener('hashchange', hashChangeHandler);
		};
	}, []);

	const updateHash = React.useCallback(
		(newHash) => {
			if (newHash !== hash) window.location.hash = newHash;
		},
		[hash],
	);

	return [hash, updateHash];
};

export default useHash;
