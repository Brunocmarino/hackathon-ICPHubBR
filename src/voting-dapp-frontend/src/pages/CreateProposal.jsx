import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function CreateProposal() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(24); // Default: 24 horas
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !duration) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Chamar o backend para criar a proposta
      const proposalId = await apiService.createProposal(title, description, Number(duration));
      
      // Redirecionar para a página da proposta
      navigate(`/proposal/${proposalId}`);
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      setError('Falha ao criar proposta. Verifique se você tem permissão de organização.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="create-proposal">
      <h1>Criar Nova Proposta</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="Título da proposta"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Descreva sua proposta em detalhes"
            rows={5}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duração (horas)</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={isSubmitting}
            min={1}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Método de Votação</label>
          <div className="info-box">
            <p><strong>Merkle Tree (Anônimo)</strong></p>
            <p>Este método proporciona votação anônima usando árvores Merkle.</p>
            <ul>
              <li>Os votos são armazenados de forma anônima</li>
              <li>Cada votante recebe uma prova criptográfica de seu voto</li>
              <li>A prova pode ser usada para verificar se o voto foi contabilizado</li>
              <li>A privacidade do votante é preservada</li>
            </ul>
          </div>
        </div>
        
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Criando...' : 'Criar Proposta'}
        </button>
      </form>
    </div>
  );
}

export default CreateProposal;