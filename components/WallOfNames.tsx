import React, { useRef, useEffect } from 'react';

/**
 * @interface WallOfNamesProps
 * Defines the props for the WallOfNames component.
 * @property {boolean} isPlaying - Determines if the scrolling animation is active.
 * @property {string[]} names - The array of names to display. The list is expected to be duplicated for a seamless loop.
 * @property {() => void} [onTogglePlay] - Optional callback to toggle the play state, triggered on click.
 */
interface WallOfNamesProps {
    isPlaying: boolean;
    names: string[];
    onTogglePlay?: () => void;
}

/**
 * Renders a vertically scrolling wall of names.
 * The animation is achieved using `requestAnimationFrame` for performance and smoothness.
 * It creates a seamless infinite scroll effect by resetting the scroll position.
 */
const WallOfNames: React.FC<WallOfNamesProps> = ({ isPlaying, names, onTogglePlay }) => {
    // Ref to the scrollable div element.
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Ref to store the ID of the animation frame, used for cancellation.
    const animationFrameIdRef = useRef<number | null>(null);

    // useEffect hook to manage the scrolling animation.
    useEffect(() => {
        /**
         * The core animation function.
         * It increments the scroll position on each frame.
         * When the scroll position reaches the halfway point (the end of the original content),
         * it resets to the top, creating a seamless loop.
         */
        const scrollStep = () => {
            if (scrollContainerRef.current) {
                // The list of names is duplicated. We reset the scroll when the first half is scrolled past.
                if (scrollContainerRef.current.scrollTop >= scrollContainerRef.current.scrollHeight / 2) {
                    scrollContainerRef.current.scrollTop = 0; // Reset for seamless loop
                } else {
                    scrollContainerRef.current.scrollTop += 0.25; // Adjust speed here
                }
            }
            // Request the next animation frame to continue the loop.
            animationFrameIdRef.current = requestAnimationFrame(scrollStep);
        };

        // Start the animation only if isPlaying is true.
        if (isPlaying) {
            animationFrameIdRef.current = requestAnimationFrame(scrollStep);
        }

        // Cleanup function: This is called when the component unmounts or dependencies change.
        return () => {
            // Cancel any pending animation frame to prevent memory leaks and unnecessary processing.
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [isPlaying]); // Rerun the effect whenever the isPlaying state changes.

    return (
        // The outer container handles the click event to toggle play/pause.
        <div className="names-container" onClick={onTogglePlay}>
            <div className="scroll-container" ref={scrollContainerRef}>
                <div className="names-grid">
                    {/* Map over the names array to render each name as a paragraph element. */}
                    {names.map((name, index) => <p key={index} className="name">{name}</p>)}
                </div>
            </div>
        </div>
    );
};

export default WallOfNames;
