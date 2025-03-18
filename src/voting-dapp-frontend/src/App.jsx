import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/auth';

// Componentes
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateProposal from './pages/CreateProposal';
import ProposalDetails from './pages/ProposalDetails';
import Vote from './pages/Vote';
import MyVotes from './pages/MyVotes';
import RegisterOrg from './pages/RegisterOrg';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = async () => {
    const success = await authService.login();
    setIsAuthenticated(success);
  };
  
  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };
  
  // Proteção de rotas - redireciona para login se não autenticado
  const ProtectedRoute = ({ children }) => {
    if (isLoading) return <div className="loading">Carregando...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  
  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }
  
  return (
    <Router>
      <div className="app">
        <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        
        <div className="container">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/create-proposal" element={
              <ProtectedRoute>
                <CreateProposal />
              </ProtectedRoute>
            } />
            
            <Route path="/proposal/:id" element={
              <ProtectedRoute>
                <ProposalDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/vote/:id" element={
              <ProtectedRoute>
                <Vote />
              </ProtectedRoute>
            } />
            
            <Route path="/my-votes" element={
              <ProtectedRoute>
                <MyVotes />
              </ProtectedRoute>
            } />
            
            <Route path="/register-org" element={
              <ProtectedRoute>
                <RegisterOrg />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;