import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { removeStaticHead } from './lib/staticHead';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource-variable/saira/wght.css';
import './styles/site.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

removeStaticHead();

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
