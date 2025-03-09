import { random } from 'lodash';
import React, { useState } from 'react';

const useGlobalErrorMediator = () => {
	const [error, setError] = React.useState<any>(null);
	const errorChangeHandler = React.useCallback((e) => {
		if (localStorage.getItem('lastGlobalError') === JSON.stringify(e.data)) {
			return;
		}

		setError(e.data);
		localStorage.setItem('lastGlobalError', JSON.stringify(e.data));

		setTimeout(() => {
			localStorage.setItem('lastGlobalError', JSON.stringify({}));
		}, 1000);
	}, []);

	React.useEffect(() => {
		localStorage.setItem('lastGlobalError', JSON.stringify({}));
		window.addEventListener('GlobalError', errorChangeHandler);
		return () => {
			localStorage.setItem('lastGlobalError', JSON.stringify({}));
			window.removeEventListener('GlobalError', errorChangeHandler);
		};
	}, []);

	const _update = React.useCallback(
		(newError) => {
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:newError} }));
		},
		[error],
	);

	const sendError = (error: any) => {
		_update(error);
	};

	return { error, sendError };
};

export default useGlobalErrorMediator;
