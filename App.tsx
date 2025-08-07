import React, { useState, useEffect, useCallback } from 'react';
import WallOfNames from './components/WallOfNames';
import { fetchCsvWallOfNames } from './constants';

/**
 * @interface AppProps
 * Defines the props for the main App component.
 * @property {string} [csvUrl] - Optional URL for the CSV file.
 */
interface AppProps {
  csvUrl?: string;
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
 * The main application component.
 * It displays a scrolling wall of names fetched from a CSV file.
 */
const App: React.FC<AppProps> = ({ csvUrl }) => {
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // useEffect hook to fetch and process the CSV data when the component mounts or csvUrl changes.
  useEffect(() => {
    const loadCsvNames = async () => {
      setIsLoading(true);
      const fetchedNames = await fetchCsvWallOfNames(csvUrl);
      setNames(fetchedNames);
      setIsLoading(false);
    };
    loadCsvNames();
  }, [csvUrl]);

  // Memoized callback to toggle the play/pause state.
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Effect to handle side effects like keyboard controls and reduced motion preference
  useEffect(() => {
    /**
     * Handles global keydown events for accessibility.
     * - 'Spacebar' toggles the play/pause state of the animation.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault(); // Prevents default spacebar action (e.g., scrolling).
        togglePlay();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Set initial play state based on user's motion preference.
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsPlaying(!mediaQuery.matches);
    
    // Cleanup function to remove the event listener.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay]);
  
  // A simple loading state
  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#111827', fontSize: '1.5rem' }}>
              Loading Signers...
          </div>
      );
  }

  return (
    <>
    {/* Scoped CSS for the wall component. */}
    <style>{`
      /* Placeholder for the rest of the page content */
      .placeholder-content {
        position: fixed;
        top: 0;
        left: 0;
        width: 50%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #6b7280; /* text-gray-500 */
        font-size: 2rem;
        font-weight: 500;
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
      .wall-of-signers {
        position: fixed; /* Use fixed positioning to place it relative to the viewport */
        top: 0;
        right: 0;
        width: 50%; /* Only take up the right half of the screen */
        height: 100vh; /* Fill the viewport height */
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000000; /* Black background for the container */
        overflow: hidden;
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
        background-color: rgba(30, 30, 30, 0.7);
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
          background-color: rgba(50, 50, 50, 0.8);
      }
    `}</style>
    <div className="placeholder-content" aria-hidden="true">
        <h2>Rest of Page</h2>
    </div>
    <div 
      className="wall-of-signers"
      aria-labelledby="wall-of-signers-title"
    >
        {/* Screen-reader only title for accessibility */}
        <h1 id="wall-of-signers-title" className="sr-only">Wall of Signers</h1>
        
        {/* The component that renders the scrolling names. It receives play state and a toggle handler. */}
        <WallOfNames isPlaying={isPlaying} names={names} onTogglePlay={togglePlay} />

        {/* Container for the main action buttons at the bottom */}
        <div className="controls-container">
          {/* Play/Pause button with dynamic ARIA label */}
          <button className="play-pause-button" aria-label={isPlaying ? 'Pause scrolling' : 'Play scrolling'} onClick={togglePlay}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    </>
  );
};

export default App;