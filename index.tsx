/**
 * @file This is the main entry point for the React application.
 * It reads an optional global configuration, finds the specified root DOM element,
 * and renders the main App component into it.
 * React.StrictMode is used to highlight potential problems in the application.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * @interface AppConfig
 * Defines the shape of the optional global configuration object.
 */
interface AppConfig {
  targetSelector?: string;
  csvUrl?: string;
}

// Access the global config from the window object, with a fallback to an empty object.
const config: AppConfig = (window as any).WALL_OF_SIGNERS_CONFIG || {};

// Determine the target element for rendering, defaulting to '#root'.
const targetSelector = config.targetSelector || '#root';
const rootElement = document.querySelector(targetSelector);

// Ensure the root element exists before trying to render the app.
if (rootElement) {
  // Create a React root for the application container.
  const root = ReactDOM.createRoot(rootElement);
  
  // Render the App component, passing the csvUrl from the config.
  root.render(
    <React.StrictMode>
      <App csvUrl={config.csvUrl} />
    </React.StrictMode>
  );
} else {
  // Log an error if the specified target element isn't found in the DOM.
  console.error(`[WallOfSigners] Target element "${targetSelector}" not found in the DOM.`);
}
