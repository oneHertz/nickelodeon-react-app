import React from 'react';
import './index.css';
import App from './App';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';


const container = document.getElementById('app')
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={5}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>
);

