import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { installRuntimeMonitoring } from '@/utils/runtimeMonitoring';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

installRuntimeMonitoring();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
