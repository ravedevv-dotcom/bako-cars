import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against circular structure errors from telemetry, third-party loggers, or Google services
const originalJSONStringify = JSON.stringify;
JSON.stringify = function (value: any, replacer?: any, space?: any) {
  try {
    return originalJSONStringify.call(JSON, value, replacer, space);
  } catch (err: any) {
    if (err && typeof err.message === 'string' && err.message.toLowerCase().includes('circular')) {
      const seen = new WeakSet();
      return originalJSONStringify.call(
        JSON,
        value,
        (key, val) => {
          if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) {
              return '[Circular]';
            }
            seen.add(val);
          }
          if (typeof replacer === 'function') {
            return replacer(key, val);
          }
          return val;
        },
        space
      );
    }
    throw err;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
