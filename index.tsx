
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected the import path to be relative.
import App from './App';
// The import for index.css is removed because the file is not provided.
// Animations are handled in the Tailwind config in index.html.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);