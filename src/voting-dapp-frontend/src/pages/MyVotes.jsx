import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

function MyVotes() {
  const [proposals, setProposals] = useState([]);
  const [myVotedProposals, setMyVotedProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadMyVotes();
  }, []);
  
  const loadMyVotes = async () => {
    try {
      setIsLoading(true);
      
      // Carregar todas as propostas
      const allProposals = await apiService.getProposals();
      setProposals(allProposals);
      
      // Verificar em quais propostas o usuário votou
      const votedProposals = [];
      
      for (const proposal of allProposals) {
        try {
          const voted = await apiService.didIVote(proposal.id);
          if (voted) {
            votedProposals.push(proposal);
          }
        } catch (err) {
          console.error(`Erro ao verificar voto na proposta ${proposal.id}:`, err);
        }
      }
      
      setMyVotedProposals(votedProposals);
    } catch (error) {
      console.error('Erro ao carregar votos:', error);
      setError('Falha ao carregar seus votos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isProposalActive = (deadline) => {
    return Number(deadline) > Date.now() * 1000000;
  };
  
  if (isLoading) {
    return <div className="loading">Carregando seus votos...</div>;
  }
  
  return (
    <div className="my-votes-page">
      <h1>Meus Votos</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {myVotedProposals.length === 0 ? (
        <div className="no-votes">
          <p>Você ainda não votou em nenhuma proposta.</p>
          <Link to="/" className="btn-primary">Ver propostas disponíveis</Link>
        </div>
      ) : (
        <div className="voted-proposals">
          <p>Você votou em {myVotedProposals.length} propostas:</p>
          
          <div className="proposals-list">
            {myVotedProposals.map((proposal) => (
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
                    Votado em: {apiService.formatDate(proposal.created)}
                  </span>
                  <span className={`status ${isProposalActive(proposal.deadline) ? 'active' : 'inactive'}`}>
                    {isProposalActive(proposal.deadline) 
                      ? `Ativa - Encerra em ${apiService.getRemainingTime(proposal.deadline)}` 
                      : 'Encerrada'}
                  </span>
                </div>
                
                <div className="merkle-badge">
                  <span>Voto Anônimo (Merkle Tree)</span>
                  <div className="badge-tooltip">
                    Seu voto foi registrado de forma anônima usando tecnologia de árvores Merkle
                  </div>
                </div>
                
                <div className="proposal-actions">
                  <Link to={`/proposal/${proposal.id}`} className="btn-primary">
                    Ver Resultados
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyVotes;