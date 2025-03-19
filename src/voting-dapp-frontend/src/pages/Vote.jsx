import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import authService from '../services/auth';

function VotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState(null);
  const [voteValue, setVoteValue] = useState('Yes');
  const [weight] = useState(1); // Sempre fixo em 1
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  
  useEffect(() => {
    const checkProposal = async () => {
      try {
        setIsLoading(true);
        
        // Carregar dados da proposta
        const proposals = await apiService.getProposals();
        const foundProposal = proposals.find(p => p.id.toString() === id);
        
        if (!foundProposal) {
          setError('Proposta não encontrada');
          return;
        }
        
        // Verificar se a proposta ainda está ativa
        const isActive = Number(foundProposal.deadline) > Date.now() * 1000000;
        if (!isActive) {
          setError('Esta votação já foi encerrada');
          return;
        }
        
        // Verificar se o usuário já votou
        const voted = await apiService.didIVote(foundProposal.id);
        if (voted) {
          setAlreadyVoted(true);
          return;
        }
        
        setProposal(foundProposal);
      } catch (error) {
        console.error('Erro ao carregar proposta:', error);
        setError('Falha ao carregar dados da proposta');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProposal();
  }, [id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proposal) return;
    
    try {
      setSubmitting(true);
      
      // Gerar salt para o voto
      const salt = await apiService.generateSalt();
      
      // Enviar voto
      console.log("Enviando voto:", {
        proposalId: proposal.id,
        value: voteValue,
        weight,
        salt
      });
      
      const result = await apiService.vote(proposal.id, voteValue, weight, salt);
      
      console.log("Resultado do voto:", result);
      
      if (result.success) {
        // Forçar uma atualização das estatísticas após o voto
        await apiService.getVotingStats(proposal.id);
        
        // Redirecionar para a página da proposta
        navigate(`/proposal/${id}`, { state: { message: 'Voto registrado com sucesso!' } });
      } else {
        setError(result.message || 'Falha ao registrar o voto');
      }
    } catch (error) {
      console.error('Erro ao enviar voto:', error);
      setError('Ocorreu um erro ao processar o voto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }
  
  if (alreadyVoted) {
    return (
      <div className="vote-page">
        <div className="already-voted-container">
          <h1>Você já votou!</h1>
          <p>Você já registrou seu voto para esta proposta.</p>
          <div className="actions">
            <Link to={`/proposal/${id}`} className="btn-primary">
              Ver resultados
            </Link>
            <Link to="/" className="btn-secondary">
              Voltar à lista de propostas
            </Link>
          </div>
        </div>
      </div>
    );
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
    <div className="vote-page">
      <div className="vote-container">
        <h1>Votar na Proposta</h1>
        
        <div className="proposal-info">
          <h2>{proposal.title}</h2>
          <p className="description">{proposal.description}</p>
          <div className="meta-info">
            <span>Encerra em: {apiService.formatDate(proposal.deadline)}</span>
            <span>Tempo restante: {apiService.getRemainingTime(proposal.deadline)}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="vote-form">
          <div className="form-group">
            <label>Seu Voto:</label>
            <div className="vote-options">
              <div className="vote-option">
                <input
                  type="radio"
                  id="vote-yes"
                  name="vote"
                  value="Yes"
                  checked={voteValue === 'Yes'}
                  onChange={(e) => setVoteValue(e.target.value)}
                />
                <label htmlFor="vote-yes">Sim</label>
              </div>
              
              <div className="vote-option">
                <input
                  type="radio"
                  id="vote-no"
                  name="vote"
                  value="No"
                  checked={voteValue === 'No'}
                  onChange={(e) => setVoteValue(e.target.value)}
                />
                <label htmlFor="vote-no">Não</label>
              </div>
              
              <div className="vote-option">
                <input
                  type="radio"
                  id="vote-abstain"
                  name="vote"
                  value="Abstain"
                  checked={voteValue === 'Abstain'}
                  onChange={(e) => setVoteValue(e.target.value)}
                />
                <label htmlFor="vote-abstain">Abster-se</label>
              </div>
            </div>
          </div>
          
          
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary vote-submit-btn" 
              disabled={submitting}
            >
              {submitting ? 'Processando...' : 'Confirmar Voto'}
            </button>
            
            <Link to={`/proposal/${id}`} className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
        
        <div className="vote-privacy-info">
          <h3>Privacidade do Voto</h3>
          <p>Seu voto será registrado de forma anônima usando tecnologia de árvore Merkle.</p>
          <p>Ninguém poderá ver em que opção você votou, mas você poderá verificar que seu voto foi contado corretamente.</p>
        </div>
      </div>
    </div>
  );
}

export default VotePage;