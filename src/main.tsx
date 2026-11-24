import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/bellefair/400.css';
import '@fontsource/ms-madi/400.css';
import '@/styles/tokens.css';
import '@/styles/global.css';
import App from '@/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
