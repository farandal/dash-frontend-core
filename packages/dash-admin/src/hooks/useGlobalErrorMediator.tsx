import { random } from 'lodash';
import React, { useState } from 'react';
import { dashStorage } from 'dash-utils';
const useGlobalErrorMediator = () => {
	const [error, setError] = React.useState<any>(null);
	const errorChangeHandler = React.useCallback((e) => {
		if (dashStorage.getItem('lastGlobalError') === JSON.stringify(e.data)) {
			return;
		}

		setError(e.data);
		dashStorage.setItem('lastGlobalError', JSON.stringify(e.data));

		setTimeout(() => {
			dashStorage.setItem('lastGlobalError', JSON.stringify({}));
		}, 1000);
	}, []);

	React.useEffect(() => {
		dashStorage.setItem('lastGlobalError', JSON.stringify({}));
        
		window.addEventListener('GlobalError', errorChangeHandler);
		return () => {
			dashStorage.setItem('lastGlobalError', JSON.stringify({}));
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
