import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';
import { Workflows } from './pages/Workflows';
import { Login } from './pages/Login';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated, token } = useAuthStore();

  // Check if token exists in localStorage on app load
  useEffect(() => {
    // Authentication state is handled in the authStore initialization
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/search" element={<Search />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;