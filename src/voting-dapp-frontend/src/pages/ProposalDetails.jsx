import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import authService from '../services/auth';

function ProposalDetails() {
  const { id } = useParams();
  
  const [proposal, setProposal] = useState(null);
  const [votingStats, setVotingStats] = useState(null);
  const [userVoted, setUserVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [principalId, setPrincipalId] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar principal ID do usuário
        const principal = await authService.getPrincipal();
        setPrincipalId(principal ? principal.toString() : null);
        
        // Carregar dados da proposta
        const proposals = await apiService.getProposals();
        const foundProposal = proposals.find(p => p.id.toString() === id);
        
        if (!foundProposal) {
          setError('Proposta não encontrada');
          return;
        }
        
        setProposal(foundProposal);
        
        // Verificar se o usuário já votou
        const voted = await apiService.didIVote(foundProposal.id);
        setUserVoted(voted);
        
        // Carregar estatísticas da votação
        const stats = await apiService.getVotingStats(foundProposal.id);
        setVotingStats(stats);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Falha ao carregar dados da proposta. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const isProposalActive = (deadline) => {
    return Number(deadline) > Date.now() * 1000000;
  };
  
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(1);
  };
  
  if (isLoading) {
    return <div className="loading">Carregando dados da proposta...</div>;
  }
  
  if (error || !proposal) {
    return (
      <div className="error-container">
        <h1>Erro</h1>
        <p>{error || 'Proposta não encontrada'}</p>
        <Link to="/" className="btn-secondary">Voltar para a lista de propostas</Link>
      </div>
    );
  }
  
  return (
    <div className="proposal-details-page">
      <div className="proposal-header">
        <h1>{proposal.title}</h1>
        <div className={`status-badge ${isProposalActive(proposal.deadline) ? 'active' : 'inactive'}`}>
          {isProposalActive(proposal.deadline) ? 'Ativa' : 'Encerrada'}
        </div>
      </div>
      
      <div className="proposal-content">
        <div className="proposal-info">
          <div className="info-section">
            <h2>Detalhes da Proposta</h2>
            <p className="description">{proposal.description}</p>
            
            <div className="meta-info">
              <div className="meta-item">
                <span className="label">Criada em:</span>
                <span className="value">{apiService.formatDate(proposal.created)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Encerra em:</span>
                <span className="value">{apiService.formatDate(proposal.deadline)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Tempo restante:</span>
                <span className="value">{apiService.getRemainingTime(proposal.deadline)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Método de Votação:</span>
                <span className="value">Merkle Tree (Anônimo)</span>
              </div>
            </div>
          </div>
          
          <div className="voting-actions">
            {isProposalActive(proposal.deadline) ? (
              userVoted ? (
                <div className="already-voted-message">
                  <p>Você já votou nesta proposta!</p>
                  <p>Seu voto foi registrado de forma anônima.</p>
                </div>
              ) : (
                <Link to={`/vote/${proposal.id}`} className="btn-primary vote-btn">
                  Votar nesta proposta
                </Link>
              )
            ) : (
              <div className="closed-voting-message">
                <p>Esta votação já foi encerrada.</p>
                <p>Consulte os resultados abaixo.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="voting-results">
          <h2>Resultados da Votação</h2>
          
          {votingStats ? (
            <div className="results-container">
              <div className="stats-overview">
                <div className="stat-item">
                  <span className="stat-value">{votingStats.totalVotes}</span>
                  <span className="stat-label">Votos Totais</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{votingStats.totalWeight}</span>
                  <span className="stat-label">Peso Total</span>
                </div>
              </div>
              
              <div className="vote-bars">
                <div className="vote-bar-item">
                  <div className="vote-label">
                    <span className="label">Sim</span>
                    <span className="count">{votingStats.yesVotes} votos ({calculatePercentage(votingStats.yesVotes, votingStats.totalVotes)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress yes-progress" 
                      style={{ width: `${calculatePercentage(votingStats.yesVotes, votingStats.totalVotes)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="vote-bar-item">
                  <div className="vote-label">
                    <span className="label">Não</span>
                    <span className="count">{votingStats.noVotes} votos ({calculatePercentage(votingStats.noVotes, votingStats.totalVotes)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress no-progress" 
                      style={{ width: `${calculatePercentage(votingStats.noVotes, votingStats.totalVotes)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="vote-bar-item">
                  <div className="vote-label">
                    <span className="label">Abstenções</span>
                    <span className="count">{votingStats.abstainVotes} votos ({calculatePercentage(votingStats.abstainVotes, votingStats.totalVotes)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress abstain-progress" 
                      style={{ width: `${calculatePercentage(votingStats.abstainVotes, votingStats.totalVotes)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="merkle-info-box">
                <h3>Votação Anônima com Merkle Tree</h3>
                <p>Esta proposta utiliza votação anônima com tecnologia de árvores Merkle.</p>
                <p>Todos os votos são armazenados de forma segura e privada, sem revelar a identidade dos votantes.</p>
                <p>Cada votante recebe uma prova criptográfica que permite verificar que seu voto foi contabilizado.</p>
              </div>
            </div>
          ) : (
            <div className="no-votes-yet">
              <p>Ainda não há votos para esta proposta.</p>
              {isProposalActive(proposal.deadline) && (
                <p>Seja o primeiro a votar!</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="actions-footer">
        <Link to="/" className="btn-secondary">
          Voltar para a lista de propostas
        </Link>
      </div>
    </div>
  );
}

export default ProposalDetails;