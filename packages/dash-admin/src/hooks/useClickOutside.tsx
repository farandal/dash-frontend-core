import { useEffect, useRef } from 'react';

/**
 * Closes a dropdown/menu when the user interacts outside of it.
 *
 * Takes an ARRAY of refs on purpose: these menus render their content via
 * `ReactDOM.createPortal(..., document.body)`, so the trigger (e.g. the
 * avatar) and the menu content are two separate DOM subtrees — a click
 * inside the portal is not a descendant of the trigger ref, so checking
 * only the trigger would treat every click inside the menu itself as
 * "outside" and close it immediately. Pass every root that should count as
 * "inside" (trigger + portal content).
 *
 * Listens on 'mousedown'/'touchstart' rather than 'click': the containment
 * check already excludes clicks on the trigger itself (so it never
 * self-closes the menu it just opened), and the earlier event avoids fights
 * with libraries that stopPropagation() on 'click'.
 *
 * `enabled` lets the caller skip attaching the listener entirely while the
 * menu is closed (pass the same `open` state driving the menu) instead of
 * registering a global document listener for the lifetime of the component.
 */
const useClickOutside = (
    refs: React.RefObject<HTMLElement>[],
    onClickOutside: () => void,
    enabled: boolean = true,
) => {
    // Ref so the effect doesn't need to re-subscribe every time the caller
    // passes a new callback identity (common here since these callbacks
    // close over component state).
    const callbackRef = useRef(onClickOutside);
    callbackRef.current = onClickOutside;

    useEffect(() => {
        if (!enabled) return;

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            const isInside = refs.some((ref) => ref.current && ref.current.contains(target));
            if (!isInside) {
                callbackRef.current();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `refs` are
        // stable useRef objects from the caller; only `enabled` should
        // re-trigger (re)subscription.
    }, [enabled]);
};

export default useClickOutside;
