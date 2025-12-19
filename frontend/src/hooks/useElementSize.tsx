import React from 'react';

export const useElementSize = (visible?: boolean, timeOut?: number, recalculate?: boolean) => {
	const elementRef = React.useRef<HTMLDivElement>(undefined);
	const [size, setSize] = React.useState({
		width: 0,
		height: 0,
	});

	React.useLayoutEffect(() => {
		// Only measure when popup is visible and element exists
		if (!visible && !elementRef.current) return;

		const handleResize = () => {
			// Check if the elementRef has a current value before accessing its properties.
			if (elementRef.current) {
				// Use `getBoundingClientRect()` to get the current size of the element.
				const { width, height } = (elementRef.current as HTMLDivElement).getBoundingClientRect();
				setSize({ width, height });
			}
		};

		// Initial size calculation.
		setTimeout(handleResize, timeOut ?? 100);

		// Add event listener for window resize to update dimensions.
		window.addEventListener('resize', handleResize);

		// Clean up the event listener when the component unmounts.
		return () => window.removeEventListener('resize', handleResize);
	}, [visible, recalculate]);

	// Return the ref to be attached to an element and the size state.
	return [elementRef, size];
};
