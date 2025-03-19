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
    // Garantir que o peso é sempre 1
    const fixedWeight = 1;
    return await actor.vote(proposalId, voteValue, fixedWeight, salt);
  }
  
  async didIVote(proposalId) {
    const actor = await this.getActor();
    return await actor.didIVote(proposalId);
  }
  
  async getVotingStats(proposalId) {
    const actor = await this.getActor();
    try {
      console.log("Solicitando estatísticas para proposta:", proposalId);
      const result = await actor.getVotingStats(proposalId);
      console.log("Estatísticas recebidas do backend:", result);
      
      // Processar resultado para lidar com diferentes formatos de retorno
      if (result === null || result === undefined) {
        console.log("Nenhuma estatística recebida, retornando valores zerados");
        return {
          totalVotes: 0,
          yesVotes: 0,
          noVotes: 0,
          abstainVotes: 0,
          totalWeight: 0,
          yesWeight: 0,
          noWeight: 0,
          abstainWeight: 0
        };
      }
      
      // Se for um array com um item [stats], extrair o primeiro item
      if (Array.isArray(result) && result.length > 0) {
        console.log("Resultado é um array, retornando primeiro elemento");
        return result[0];
      }
      
      // Para o caso de vir como um objeto Candid com opt
      if (result[0] !== undefined) {
        console.log("Resultado é um objeto com índices, retornando result[0]");
        return result[0];
      }
      
      // Retornar como está se for um objeto regular
      return result;
    } catch (error) {
      console.error("Erro ao obter estatísticas de votação:", error);
      // Retornar estatísticas vazias em caso de erro
      return {
        totalVotes: 0,
        yesVotes: 0,
        noVotes: 0,
        abstainVotes: 0,
        totalWeight: 0,
        yesWeight: 0,
        noWeight: 0,
        abstainWeight: 0
      };
    }
  }
  
  async verifyVote(proposalId, proof) {
    const actor = await this.getActor();
    return await actor.verifyVote(proposalId, proof);
  }
  
  // Função para obter informações de debug
  async getDebugInfo() {
    const actor = await this.getActor();
    try {
      const debugInfo = await actor.getDebugInfo();
      console.log("Informações de Debug:", debugInfo);
      return debugInfo;
    } catch (error) {
      console.error("Erro ao obter informações de debug:", error);
      return null;
    }
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