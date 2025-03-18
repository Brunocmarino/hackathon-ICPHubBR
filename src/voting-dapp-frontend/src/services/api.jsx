import authService from './auth';

class ApiService {
  async getActor() {
    return await authService.getActor();
  }

  // Funções para propostas
  async createProposal(title, description, durationHours) {
    const actor = await this.getActor();
    return await actor.createProposal(title, description, durationHours);
  }

  async getProposals() {
    const actor = await this.getActor();
    return await actor.getProposals();
  }

  // Funções para votação
  async generateSalt() {
    const actor = await this.getActor();
    return await actor.generateSalt();
  }

  async vote(proposalId, value, weight, salt) {
    const actor = await this.getActor();
    // Transformar valor em variante
    const voteValue = { [value]: null };
    return await actor.vote(proposalId, voteValue, weight, salt);
  }

  async didIVote(proposalId) {
    const actor = await this.getActor();
    return await actor.didIVote(proposalId);
  }

  async getVotingStats(proposalId) {
    const actor = await this.getActor();
    return await actor.getVotingStats(proposalId);
  }

  async verifyVote(proposalId, proof) {
    const actor = await this.getActor();
    return await actor.verifyVote(proposalId, proof);
  }

  // Função para se registrar como organização
  async registerAsOrganization(principal) {
    const actor = await this.getActor();
    try {
      return await actor.registerOrganization(principal);
    } catch (error) {
      console.error("Error registering as organization:", error);
      return false;
    }
  }

  // Funções auxiliares para formatação de dados
  formatDate(timestamp) {
    if (!timestamp) return "N/A";
    
    // Timestamp está em nanossegundos, converter para milissegundos
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  }

  getRemainingTime(deadline) {
    if (!deadline) return "Encerrada";
    
    const now = Date.now() * 1000000; // Converter para nanossegundos
    const remaining = Number(deadline) - now;
    
    if (remaining <= 0) return "Encerrada";
    
    const seconds = Math.floor(remaining / 1000000000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dias`;
    if (hours > 0) return `${hours} horas`;
    if (minutes > 0) return `${minutes} minutos`;
    return `${seconds} segundos`;
  }
}

export default new ApiService();