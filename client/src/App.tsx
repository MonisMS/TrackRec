import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { config } from './lib/config';
import AppLayout from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { Settings } from './pages/Settings';
import './index.css';

// Initialize API client with auth
import { setAuthTokenProvider } from './lib/api-client';
import { useAuth } from '@clerk/clerk-react';

const AppWithAuth: React.FC = () => {
  const { getToken } = useAuth();
  
  React.useEffect(() => {
    setAuthTokenProvider(getToken);
  }, [getToken]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={config.clerk.publishableKey}>
      <Router>
        <SignedIn>
          <AppWithAuth />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Router>
    </ClerkProvider>
  );
}

export default App;