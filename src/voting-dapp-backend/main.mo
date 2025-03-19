import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Error "mo:base/Error";
import Types "types";
import MerkleVoting "./MerkleVoting";

actor {
    // Tipos básicos
    type Member = Types.Member;
    type Result<Ok, Err> = Types.Result<Ok, Err>;
    type Vote = Types.Vote;
    type VoteValue = MerkleVoting.VoteValue;

    // Inicializa o sistema de votação Merkle
    private let votingSystem = MerkleVoting.MerkleVoting();
    
    // Definição de proposta
    public type Proposal = {
        id: Nat64;
        title: Text;
        description: Text;
        created: Time.Time;
        deadline: Time.Time;
    };
    
    // Armazenamento de propostas
    private var nextProposalId : Nat64 = 1;
    private var proposals = Buffer.Buffer<Proposal>(10);
    
    // Função para criar uma nova proposta
    public shared(msg) func createProposal(title: Text, description: Text, durationHours: Nat) : async Nat64 {
        Debug.print("Criando proposta: " # title);
        
        let id = nextProposalId;
        nextProposalId += 1;
        
        let now = Time.now();
        let deadline = now + (durationHours * 3600 * 1000000000);
        
        let newProposal : Proposal = {
            id;
            title;
            description;
            created = now;
            deadline;
        };
        
        proposals.add(newProposal);
        Debug.print("Proposta criada com ID: " # debug_show(id));
        
        // Inicializar estatísticas zeradas para a nova proposta
        initializeEmptyStats(id);
        
        return id;
    };
    
    // Função para inicializar estatísticas zeradas para uma proposta
    private func initializeEmptyStats(proposalId: Nat64) {
        Debug.print("Inicializando estatísticas zeradas para proposta: " # debug_show(proposalId));
        
        let emptyStats : MerkleVoting.MerkleVotingStats = {
            totalVotes = 0;
            yesVotes = 0;
            noVotes = 0;
            abstainVotes = 0;
            totalWeight = 0;
            yesWeight = 0;
            noWeight = 0;
            abstainWeight = 0;
        };
        
        // Verificar se já existem estatísticas
        switch (votingSystem.getVotingStats(proposalId)) {
            case (null) {
                // Não existem estatísticas, usar um voto temporário para inicializar
                let dummyPrincipal = Principal.fromText("aaaaa-aa");
                let dummySalt = Blob.fromArray([0,0,0,0,0,0,0,0]);
                
                // Este voto temporário não será de fato registrado, apenas inicializa as estatísticas
                let _ = votingSystem.castVote(proposalId, dummyPrincipal, #Abstain, 0, dummySalt);
                
                // Verificar se as estatísticas foram inicializadas
                switch (votingSystem.getVotingStats(proposalId)) {
                    case (null) {
                        Debug.print("ERRO: Falha ao inicializar estatísticas!");
                    };
                    case (?stats) {
                        Debug.print("Estatísticas inicializadas com sucesso");
                    };
                };
            };
            case (?stats) {
                Debug.print("Estatísticas já existem para esta proposta");
            };
        };
    };
    
    // Função para listar todas as propostas
    public query func getProposals() : async [Proposal] {
        Debug.print("Listando todas as propostas: " # Nat.toText(proposals.size()));
        Buffer.toArray(proposals)
    };
    
    // Função para votar em uma proposta
    public shared(msg) func vote(
        proposalId: Nat64,
        value: VoteValue,
        weight: Nat,
        salt: Blob
    ) : async {
        success: Bool;
        message: Text;
        proof: ?MerkleVoting.MerkleProof;
    } {
        Debug.print("Tentativa de voto na proposta " # debug_show(proposalId) # 
                  " pelo usuário " # Principal.toText(msg.caller));
        
        // Verificar se a proposta existe
        var proposalExists = false;
        label proposalLoop for (proposal in proposals.vals()) {
            if (proposal.id == proposalId) {
                proposalExists := true;
                Debug.print("Proposta encontrada: " # proposal.title);
                
                // Verificar se a votação ainda está aberta
                if (Time.now() > proposal.deadline) {
                    Debug.print("Votação encerrada");
                    return {
                        success = false;
                        message = "A votação para esta proposta já encerrou";
                        proof = null;
                    };
                };
                
                break proposalLoop;
            };
        };
        
        if (not proposalExists) {
            Debug.print("Proposta não encontrada");
            return {
                success = false;
                message = "Proposta não encontrada";
                proof = null;
            };
        };
        
        // Verificar se o usuário já votou
        if (votingSystem.hasVoted(msg.caller, proposalId)) {
            Debug.print("Usuário já votou");
            return {
                success = false;
                message = "Você já votou nesta proposta";
                proof = null;
            };
        };
        
        // Registrar o voto
        Debug.print("Registrando voto...");
        let proof = votingSystem.castVote(proposalId, msg.caller, value, weight, salt);
        
        // Verificar resultado e estatísticas após o voto
        switch (proof) {
            case (null) {
                Debug.print("Falha ao registrar voto");
                return {
                    success = false;
                    message = "Falha ao registrar o voto";
                    proof = null;
                };
            };
            case (?p) {
                Debug.print("Voto registrado com sucesso");
                
                // Verificar estatísticas após o voto
                Debug.print("Verificando estatísticas após o voto:");
                switch (votingSystem.getVotingStats(proposalId)) {
                    case (?stats) {
                        Debug.print("Estatísticas: Total=" # Nat.toText(stats.totalVotes) # 
                                  ", Sim=" # Nat.toText(stats.yesVotes) # 
                                  ", Não=" # Nat.toText(stats.noVotes));
                    };
                    case (null) {
                        Debug.print("ERRO: Estatísticas não encontradas após o voto!");
                    };
                };
                
                return {
                    success = true;
                    message = "Voto registrado com sucesso";
                    proof = ?p;
                };
            };
        };
    };
    
    // Função para verificar um voto
    public query func verifyVote(proposalId: Nat64, proof: MerkleVoting.MerkleProof) : async Bool {
        Debug.print("Verificando voto para proposta: " # debug_show(proposalId));
        
        switch (votingSystem.getMerkleRoot(proposalId)) {
            case (null) { 
                Debug.print("Raiz Merkle não encontrada");
                false 
            };
            case (?root) { 
                Debug.print("Verificando prova com a raiz Merkle");
                votingSystem.verifyProof(proof, root) 
            };
        };
    };
    
    // Função para obter estatísticas de votação
    public query func getVotingStats(proposalId: Nat64) : async ?MerkleVoting.MerkleVotingStats {
        Debug.print("Obtendo estatísticas para proposta: " # debug_show(proposalId));
        
        let stats = votingSystem.getVotingStats(proposalId);
        
        switch (stats) {
            case (null) {
                // Se não existem estatísticas, inicializá-las e retornar estatísticas zeradas
                Debug.print("Estatísticas não encontradas, inicializando...");
                initializeEmptyStats(proposalId);
                
                // Tentar obter novamente
                let newStats = votingSystem.getVotingStats(proposalId);
                
                switch (newStats) {
                    case (null) {
                        // Se ainda for null, criar estatísticas zeradas
                        Debug.print("Criando estatísticas zeradas para retorno");
                        let emptyStats : MerkleVoting.MerkleVotingStats = {
                            totalVotes = 0;
                            yesVotes = 0;
                            noVotes = 0;
                            abstainVotes = 0;
                            totalWeight = 0;
                            yesWeight = 0;
                            noWeight = 0;
                            abstainWeight = 0;
                        };
                        return ?emptyStats;
                    };
                    case (?s) {
                        Debug.print("Estatísticas inicializadas e recuperadas");
                        return ?s;
                    };
                };
            };
            case (?existingStats) {
                Debug.print("Estatísticas encontradas: Total=" # Nat.toText(existingStats.totalVotes));
                return ?existingStats;
            };
        };
    };
    
    // Função para verificar se um usuário votou
    public query(msg) func didIVote(proposalId: Nat64) : async Bool {
        Debug.print("Verificando se " # Principal.toText(msg.caller) # 
                  " votou na proposta " # debug_show(proposalId));
        
        let voted = votingSystem.hasVoted(msg.caller, proposalId);
        Debug.print("Resultado: " # debug_show(voted));
        return voted;
    };
    
    // Função para gerar um salt para o cliente usar
    public func generateSalt() : async Blob {
        let now = Time.now();
        let nowNat = if (now < 0) { -now } else { now };
        let nowNat64 = Nat64.fromIntWrap(nowNat);
        let buffer = Buffer.Buffer<Nat8>(8);
        
        var tempVal = nowNat64;
        for (_ in Iter.range(0, 7)) {
            buffer.add(Nat8.fromNat(Nat64.toNat(tempVal % 256)));
            tempVal := tempVal / 256;
        };
        
        Blob.fromArray(Buffer.toArray(buffer))
    };
    
    // Função utilitária para debug
    public query func getDebugInfo() : async {
        proposalCount: Nat;
        voteCount: Nat;
        allStats: [(Nat64, MerkleVoting.MerkleVotingStats)];
    } {
        Debug.print("Obtendo informações de debug");
        {
            proposalCount = proposals.size();
            voteCount = votingSystem.getVoteCount();
            allStats = votingSystem.getAllStats();
        }
    };
}