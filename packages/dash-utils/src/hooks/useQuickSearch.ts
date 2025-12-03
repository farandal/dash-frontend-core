import { useState, useEffect } from 'react';

export interface UseQuickSearchReturn {
    quickSearchUseState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
    sendQuickSearchEvent: (quickSearchString: string) => void;
}

/**
 * Hook for managing quick search events across components
 * Uses window events for cross-component communication
 */
export const useQuickSearch = (): UseQuickSearchReturn => {
    const quickSearchUseState = useState<string | null>(null);

    const sendQuickSearchEvent = (quickSearchString: string) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new MessageEvent('quickSearch', { data: { value: quickSearchString } }),
            );
        }
    };

    const eventHook = (e: MessageEvent) => {
        quickSearchUseState[1](e.data?.value ?? null);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('quickSearch', eventHook as EventListener);
            return () => {
                window.removeEventListener('quickSearch', eventHook as EventListener);
            };
        }
    }, []);

    return {
        quickSearchUseState,
        sendQuickSearchEvent,
    };
};

export default useQuickSearch;
