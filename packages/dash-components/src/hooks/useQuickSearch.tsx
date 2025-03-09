import React, { useState } from 'react';

const useQuickSearch = () => {
	const quickSearchUseState = useState<string>(null);

	const sendQuickSearchEvent = (quickSearchString: string) => {
		window.dispatchEvent(
			new MessageEvent('quickSearch', { data: { value: quickSearchString } }),
		);
	};

	const eventHook = (e: any) => {
		quickSearchUseState[1](e.data.value);
	};

	React.useEffect(() => {
		window.addEventListener('quickSearch', eventHook);
		return () => {
			window.removeEventListener('quickSearch', eventHook);
		};
	}, []);

	return {
		quickSearchUseState: quickSearchUseState,
		sendQuickSearchEvent: sendQuickSearchEvent,
	};
};

export default useQuickSearch;
