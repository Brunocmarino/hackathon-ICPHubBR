import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import authService from '../services/auth';

function RegisterOrg() {
  const [principalId, setPrincipalId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadPrincipal = async () => {
      try {
        const principal = await authService.getPrincipal();
        setPrincipalId(principal ? principal.toString() : '');
      } catch (error) {
        console.error('Erro ao carregar principal ID:', error);
        setError('Falha ao carregar seu ID principal. Tente novamente mais tarde.');
      }
    };
    
    loadPrincipal();
  }, []);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!principalId) {
      setError('ID Principal é obrigatório');
      return;
    }
    
    try {
      setIsRegistering(true);
      setError('');
      
      const result = await apiService.registerAsOrganization(principalId);
      
      if (result) {
        setIsSuccess(true);
      } else {
        setError('Falha ao registrar como organização. Talvez você já esteja registrado.');
      }
    } catch (error) {
      console.error('Erro ao registrar como organização:', error);
      setError('Falha ao registrar como organização. Tente novamente mais tarde.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <div className="register-org-page">
      <h1>Registrar como Organização</h1>
      
      <div className="info-box">
        <h2>O que é uma Organização?</h2>
        <p>As organizações podem criar propostas para votação usando o sistema Merkle Tree para votação anônima.</p>
        <p>Ao se registrar como organização, você poderá:</p>
        <ul>
          <li>Criar propostas de votação</li>
          <li>Escolher o método de votação</li>
          <li>Acompanhar os resultados das votações</li>
        </ul>
        <p>Todos os usuários ainda podem participar das votações criadas pelas organizações.</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isSuccess ? (
        <div className="success-message">
          <h2>Registro concluído com sucesso!</h2>
          <p>Você agora está registrado como uma organização e pode criar propostas para votação.</p>
          <a href="/" className="btn-primary">Ir para a página inicial</a>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="principalId">Seu ID Principal:</label>
            <input
              type="text"
              id="principalId"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              disabled={isRegistering}
              readOnly
              className="readonly-input"
            />
            <small className="input-help">Este é seu identificador único no Internet Computer.</small>
          </div>
          
          <button 
            type="submit" 
            disabled={isRegistering || !principalId} 
            className="btn-primary"
          >
            {isRegistering ? 'Registrando...' : 'Registrar como Organização'}
          </button>
        </form>
      )}
    </div>
  );
}

export default RegisterOrg;