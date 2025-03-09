
import React, { useState } from 'react';

const usePrintSelected = () => {
	const printSelectedUseState = useState<{
		selectedIds: number[];
		filterValues: any;
	}>(null);

	const sendPrintSelectedEvent = (selectedIds: number[], filterValues: any) => {
		window.dispatchEvent(
			new MessageEvent('printSelected', {
				data: {
					value: { selectedIds: selectedIds, filterValues: filterValues },
				},
			}),
		);
	};

	const eventHook = (e: any) => {
		printSelectedUseState[1](e.data.value);
	};

	React.useEffect(() => {
		window.addEventListener('printSelected', eventHook);
		return () => {
			window.removeEventListener('printSelected', eventHook);
		};
	}, []);

	return {
		printSelectedUseState: printSelectedUseState,
		sendPrintSelectedEvent: sendPrintSelectedEvent,
	};
};

export default usePrintSelected;
