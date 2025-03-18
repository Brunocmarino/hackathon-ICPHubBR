import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function Vote() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState(null);
  const [voteValue, setVoteValue] = useState('');
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [proof, setProof] = useState(null);
  const [showProof, setShowProof] = useState(false);
  
  useEffect(() => {
    loadProposalAndCheckVote();
  }, [id]);
  
  const loadProposalAndCheckVote = async () => {
    try {
      setIsLoading(true);
      
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
      setAlreadyVoted(voted);
      
      // Verificar se a proposta ainda está ativa
      const isActive = Number(foundProposal.deadline) > Date.now() * 1000000;
      if (!isActive) {
        setError('Esta votação já foi encerrada');
      }
    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      setError('Falha ao carregar proposta. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = async (e) => {
    e.preventDefault();
    
    if (!voteValue) {
      setError('Por favor, selecione uma opção de voto');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Gerar salt para votação anônima
      const salt = await apiService.generateSalt();
      
      // Enviar voto
      const result = await apiService.vote(proposal.id, voteValue, 1, salt);
      
      if (result.success) {
        setProof(result.proof);
        setAlreadyVoted(true);
      } else {
        setError(`Falha ao registrar voto: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao enviar voto:', error);
      setError('Falha ao enviar voto. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackToProposal = () => {
    navigate(`/proposal/${id}`);
  };
  
  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }
  
  if (error && !proposal) {
    return (
      <div className="vote-error">
        <h1>Erro</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Voltar para a lista de propostas
        </button>
      </div>
    );
  }
  
  return (
    <div className="vote-page">
      <h1>Votar em Proposta</h1>
      
      {proposal && (
        <div className="proposal-details">
          <h2>{proposal.title}</h2>
          <p className="description">{proposal.description}</p>
          
          <div className="proposal-meta">
            <div>
              <strong>Criado em:</strong> {apiService.formatDate(proposal.created)}
            </div>
            <div>
              <strong>Encerra em:</strong> {apiService.formatDate(proposal.deadline)}
            </div>
            <div>
              <strong>Tempo restante:</strong> {apiService.getRemainingTime(proposal.deadline)}
            </div>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {alreadyVoted ? (
        <div className="already-voted">
          <h2>Você já votou nesta proposta</h2>
          
          {proof && (
            <div className="vote-proof">
              <h3>Prova do seu voto (Merkle Tree)</h3>
              <p>Esta prova criptográfica garante que seu voto foi registrado corretamente, mantendo seu anonimato.</p>
              
              <button 
                onClick={() => setShowProof(!showProof)} 
                className="btn-secondary"
              >
                {showProof ? 'Esconder Prova' : 'Mostrar Prova'}
              </button>
              
              {showProof && (
                <pre className="proof-data">
                  {JSON.stringify(proof, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          <button onClick={handleBackToProposal} className="btn-primary">
            Ver Resultados da Votação
          </button>
        </div>
      ) : (
        <div className="vote-form-container">
          <h2>Escolha sua opção de voto</h2>
          <form onSubmit={handleVote} className="vote-form">
            <div className="vote-options">
              <div className="vote-option">
                <input
                  type="radio"
                  id="yes"
                  name="vote"
                  value="Yes"
                  checked={voteValue === 'Yes'}
                  onChange={() => setVoteValue('Yes')}
                  disabled={isSubmitting}
                />
                <label htmlFor="yes">Sim</label>
              </div>
              
              <div className="vote-option">
                <input
                  type="radio"
                  id="no"
                  name="vote"
                  value="No"
                  checked={voteValue === 'No'}
                  onChange={() => setVoteValue('No')}
                  disabled={isSubmitting}
                />
                <label htmlFor="no">Não</label>
              </div>
              
              <div className="vote-option">
                <input
                  type="radio"
                  id="abstain"
                  name="vote"
                  value="Abstain"
                  checked={voteValue === 'Abstain'}
                  onChange={() => setVoteValue('Abstain')}
                  disabled={isSubmitting}
                />
                <label htmlFor="abstain">Abster-se</label>
              </div>
            </div>
            
            <div className="info-box merkle-info">
              <h3>Votação Anônima com Merkle Tree</h3>
              <p>Seu voto será registrado de forma anônima utilizando tecnologia de árvore Merkle.</p>
              <p>Você receberá uma prova criptográfica que confirma seu voto sem revelar sua identidade.</p>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleBackToProposal} 
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar Voto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Vote;