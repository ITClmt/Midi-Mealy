import { type RefObject, useEffect, useRef } from "react";

/**
 * Hook that calls a handler when a click happens outside the referenced element.
 *
 * Uses a ref for the handler to avoid re-attaching the event listener
 * on every render (the old version had `handler` in the dependency array,
 * causing unnecessary re-runs if the caller didn't wrap it in useCallback).
 *
 * @see https://usehooks-ts.com/react-hook/use-on-click-outside
 */
export function useClickOutside(
	ref: RefObject<HTMLElement | null>,
	handler: () => void,
) {
	// Keep handler in a ref so the effect never re-runs just because
	// the callback identity changes.
	const savedHandler = useRef(handler);

	useEffect(() => {
		savedHandler.current = handler;
	});

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				savedHandler.current();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref]);
}
