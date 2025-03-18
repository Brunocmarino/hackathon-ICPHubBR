import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/auth';

function NavBar({ isAuthenticated, onLogout }) {
  const [principalId, setPrincipalId] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const getPrincipal = async () => {
      if (isAuthenticated) {
        try {
          const principal = await authService.getPrincipal();
          setPrincipalId(principal ? principal.toString().substring(0, 10) + '...' : '');
        } catch (error) {
          console.error('Error fetching principal:', error);
        }
      }
    };
    
    getPrincipal();
  }, [isAuthenticated]);
  
  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link">
          <span className="logo-text">Voting</span>
        </Link>
      </div>
      
      {isAuthenticated && (
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Propostas
          </Link>
          <Link 
            to="/create-proposal" 
            className={`nav-link ${location.pathname === '/create-proposal' ? 'active' : ''}`}
          >
            Criar Proposta
          </Link>
          <Link 
            to="/my-votes" 
            className={`nav-link ${location.pathname === '/my-votes' ? 'active' : ''}`}
          >
            Meus Votos
          </Link>
          <Link 
            to="/register-org" 
            className={`nav-link ${location.pathname === '/register-org' ? 'active' : ''}`}
          >
            Registrar Organização
          </Link>
        </div>
      )}
      
      <div className="nav-auth">
        {isAuthenticated ? (
          <div className="user-menu">
            <button onClick={toggleDropdown} className="user-button">
              <span className="user-principal">{principalId}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item user-info">
                  <span className="label">Principal ID:</span>
                  <span className="value principal-id">{principalId}</span>
                </div>
                <button onClick={handleLogout} className="dropdown-item logout-button">
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-button">
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar;