import React, { useEffect, useState } from 'react';

const useAutoAdminLoadingStateMediator = (origin?: string) => {
	const useAutoAdminLoadingState = useState<boolean>(false);

	const localState = useState<MessageEvent>(null);

	useEffect(() => {
		if (!localState[0]) return;

		if (origin && localState[0]?.origin) {
		
			if ( 	/* @ts-ignore : An expression of type 'void' cannot be tested for truthiness.ts(1345).  */
				localState[0].origin === origin &&
				useAutoAdminLoadingState[1](localState[0].data)
			) {
				 // eslint-disable-line no-debugger
				return;
			}
		}

		useAutoAdminLoadingState[1](localState[0]?.data);

		return;
	}, [localState[0]]);

	React.useEffect(() => {
		window.addEventListener('auto-admin-loading-state', (e: any) =>
			localState[1](e),
		);

		return () => {
			window.removeEventListener('auto-admin-loading-state', (e: any) =>
				localState[1](e),
			);
		};
	}, []);

	return useAutoAdminLoadingState;
};

export default useAutoAdminLoadingStateMediator;
