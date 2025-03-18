import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

function Home() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadProposals();
  }, []);
  
  const loadProposals = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.getProposals();
      
      // Organizar propostas: ativas primeiro, depois por data de criação (mais recentes primeiro)
      const sortedProposals = result.sort((a, b) => {
        const aActive = Number(a.deadline) > Date.now() * 1000000;
        const bActive = Number(b.deadline) > Date.now() * 1000000;
        
        // Primeiro ordenar por status (ativo/inativo)
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        
        // Depois ordenar por data (mais recente primeiro)
        return Number(b.created) - Number(a.created);
      });
      
      setProposals(sortedProposals);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      setError('Falha ao carregar propostas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isProposalActive = (deadline) => {
    return Number(deadline) > Date.now() * 1000000;
  };
  
  if (isLoading) {
    return <div className="loading">Carregando propostas...</div>;
  }
  
  return (
    <div className="home">
      <div className="header-actions">
        <h1>Propostas de Votação</h1>
        <Link to="/create-proposal" className="btn-primary">
          Criar Nova Proposta
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {proposals.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma proposta encontrada.</p>
          <p>Seja o primeiro a criar uma proposta para votação!</p>
        </div>
      ) : (
        <div className="proposals-list">
          {proposals.map((proposal) => (
            <div 
              key={proposal.id} 
              className={`proposal-card ${isProposalActive(proposal.deadline) ? 'active' : 'inactive'}`}
            >
              <h2>{proposal.title}</h2>
              <p className="description">
                {proposal.description.length > 150 
                  ? `${proposal.description.substring(0, 150)}...` 
                  : proposal.description}
              </p>
              
              <div className="proposal-meta">
                <span className="created">
                  Criado em: {apiService.formatDate(proposal.created)}
                </span>
                <span className={`status ${isProposalActive(proposal.deadline) ? 'active' : 'inactive'}`}>
                  {isProposalActive(proposal.deadline) 
                    ? `Ativa - Encerra em ${apiService.getRemainingTime(proposal.deadline)}` 
                    : 'Encerrada'}
                </span>
              </div>
              
              <div className="proposal-actions">
                <Link to={`/proposal/${proposal.id}`} className="btn-secondary">
                  Ver Detalhes
                </Link>
                {isProposalActive(proposal.deadline) && (
                  <Link to={`/vote/${proposal.id}`} className="btn-primary">
                    Votar
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;