import React, { useState, useEffect, useCallback } from 'react';
import WallOfNames from './WallOfNames';

/**
 * @interface SignersOverlayProps
 * Defines the props for the SignersOverlay component.
 * @property {boolean} isVisible - Controls whether the overlay is visible.
 * @property {() => void} onClose - Callback function to close the overlay.
 * @property {string[]} names - The array of names to display in the wall.
 */
interface SignersOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  names: string[];
}

/**
 * A simple, reusable Play icon component.
 */
const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '2rem', height: '2rem' }}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

/**
 * A simple, reusable Pause icon component.
 */
const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '2rem', height: '2rem' }}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75h-3zm7.5 0a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75h-3z" clipRule="evenodd" />
    </svg>
);

/**
 * A full-screen overlay component that displays a scrolling wall of names.
 * It includes controls for play/pause, closing the overlay, and adding a name.
 * It is fully keyboard-accessible and respects user motion preferences.
 */
const SignersOverlay: React.FC<SignersOverlayProps> = ({ isVisible, onClose, names }) => {
  // State to manage the play/pause status of the scrolling animation.
  const [isPlaying, setIsPlaying] = useState(true);

  // Memoized callback to toggle the play/pause state.
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Memoized callback to handle closing the overlay and resetting its state.
  const closeAndReset = useCallback(() => {
    onClose();
    // Delay resetting play state to allow the closing transition to finish.
    setTimeout(() => {
        // Respect the user's OS-level preference for reduced motion.
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setIsPlaying(!mediaQuery.matches);
    }, 300);
  }, [onClose]);

  // Effect to handle side effects when the overlay's visibility changes.
  useEffect(() => {
    /**
     * Handles global keydown events for accessibility.
     * - 'Escape' key closes the overlay.
     * - 'Spacebar' toggles the play/pause state of the animation.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAndReset();
      }
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault(); // Prevents default spacebar action (e.g., scrolling).
        togglePlay();
      }
    };
    
    if (isVisible) {
      // Prevent scrolling of the background content when the overlay is open.
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Set initial play state based on user's motion preference.
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsPlaying(!mediaQuery.matches);
    } else {
      // Restore body scrolling when the overlay is closed.
      document.body.style.overflow = '';
    }

    // Cleanup function to remove the event listener and restore body overflow.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVisible, closeAndReset, togglePlay]);

  return (
    <>
    {/* Scoped CSS for the overlay component. */}
    <style>{`
      .wall-overlay {
        position: fixed;
        inset: 0;
        z-index: 50;
        background-color: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px); /* Frosted glass effect */
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.3s ease-out, visibility 0.3s;
      }
      .wall-overlay.visible {
        visibility: visible;
        opacity: 1;
      }
      /* Style for screen-reader-only elements, used for accessibility. */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      .wall-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .names-container {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        cursor: pointer; /* Indicate the entire area is clickable for play/pause. */
      }
      .scroll-container {
        height: 100%;
        width: 100%;
        overflow-y: auto; /* Fallback if animation fails */
        /* Creates a fading effect at the top and bottom of the scroll view. */
        -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        /* Hide scrollbars */
        scrollbar-width: none; /* Firefox */
      }
      .scroll-container::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
      }
      .names-grid {
        text-align: center;
        padding: 2rem;
        columns: 14rem; /* Creates a masonry-like column layout */
        gap: 2rem;
        user-select: none; /* Prevent text selection during interaction */
      }
      .name {
        color: #fdb913; /* A gold-like color for emphasis */
        font-weight: 600;
        font-size: 1.125rem;
        line-height: 1.75rem;
        white-space: nowrap;
        break-inside: avoid-column; /* Prevents names from breaking across columns */
        margin-bottom: 0.5rem;
      }
      .close-button {
        position: absolute;
        top: 1.25rem;
        right: 1.25rem;
        color: white;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 60; /* Ensures it's above the name wall */
        transition: color 0.2s;
      }
      .close-button:hover {
        color: #ccc;
      }
      .close-button svg {
        width: 2.5rem;
        height: 2.5rem;
      }
      .controls-container {
        position: absolute;
        bottom: 2.5rem;
        left: 0;
        right: 0;
        z-index: 60;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 2.5rem;
        pointer-events: none; /* Allows clicks to pass through the container itself */
        gap: 1rem;
      }
      .controls-container > * {
        pointer-events: auto; /* Re-enables pointer events for child buttons */
      }
      .play-pause-button {
        color: white;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 9999px; /* Creates a circular button */
        padding: 0.5rem;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }
      .play-pause-button:hover {
          background-color: rgba(0, 0, 0, 0.5);
      }
      .action-button {
        background-color: #006837;
        color: white;
        font-weight: bold;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        transition: all 0.3s;
        border: none;
        cursor: pointer;
      }
      .action-button:hover {
        background-color: #00532c;
        transform: scale(1.05);
      }
    `}</style>
    <div 
      className={`wall-overlay ${isVisible ? 'visible' : ''}`} 
      role="dialog" // ARIA role for accessibility
      aria-modal="true" // Indicates the overlay is modal
      aria-labelledby="wall-of-signers-title" // Associates the dialog with its title
    >
      <div className="wall-container">
        {/* Screen-reader only title for accessibility */}
        <h2 id="wall-of-signers-title" className="sr-only">Wall of Signers</h2>
        
        {/* The component that renders the scrolling names. It receives play state and a toggle handler. */}
        <WallOfNames isPlaying={isPlaying} names={names} onTogglePlay={togglePlay} />

        {/* Close button with ARIA label for accessibility */}
        <button className="close-button" aria-label="Close" onClick={closeAndReset}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Container for the main action buttons at the bottom */}
        <div className="controls-container">
          {/* Play/Pause button with dynamic ARIA label */}
          <button className="play-pause-button" aria-label={isPlaying ? 'Pause scrolling' : 'Play scrolling'} onClick={togglePlay}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          {/* Main call-to-action button */}
          <button className="action-button" onClick={closeAndReset}>Add Your Name</button>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignersOverlay;
