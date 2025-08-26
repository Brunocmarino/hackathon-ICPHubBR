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
import Float "mo:base/Float";
import Types "types";
import MerkleVoting "./MerkleVoting";
import QuadraticVoting "./QuadraticVoting";

actor {
    // Tipos básicos
    type Member = Types.Member;
    type Result<Ok, Err> = Types.Result<Ok, Err>;
    type Vote = Types.Vote;
    type MerkleVoteValue = MerkleVoting.VoteValue;
    type QuadraticVoteValue = QuadraticVoting.VoteValue;

    // Inicializa os sistemas de votação
    private let merkleVotingSystem = MerkleVoting.MerkleVoting();
    private let quadraticVotingSystem = QuadraticVoting.QuadraticVoting(100); // 100 créditos iniciais por votante
    
    // Definição de proposta
    public type Proposal = {
        id: Nat64;
        title: Text;
        description: Text;
        created: Time.Time;
        deadline: Time.Time;
        votingType: VotingType; // Novo campo para especificar o tipo de votação
    };

    // Tipo de votação
    public type VotingType = {
        #Merkle;
        #Quadratic;
        #Both; // Permite ambos os tipos na mesma proposta
    };
    
    // Armazenamento de propostas
    private var nextProposalId : Nat64 = 1;
    private var proposals = Buffer.Buffer<Proposal>(10);
    
    // Função para criar uma nova proposta
    public shared(msg) func createProposal(
        title: Text, 
        description: Text, 
        durationHours: Nat,
        votingType: VotingType
    ) : async Nat64 {
        Debug.print("Criando proposta: " # title # " com tipo de votação: " # debug_show(votingType));
        
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
            votingType;
        };
        
        proposals.add(newProposal);
        Debug.print("Proposta criada com ID: " # debug_show(id));
        
        // Inicializar estatísticas baseado no tipo de votação
        switch (votingType) {
            case (#Merkle) {
                initializeEmptyMerkleStats(id);
            };
            case (#Quadratic) {
                initializeEmptyQuadraticStats(id);
            };
            case (#Both) {
                initializeEmptyMerkleStats(id);
                initializeEmptyQuadraticStats(id);
            };
        };
        
        return id;
    };
    
    // Função para inicializar estatísticas Merkle zeradas
    private func initializeEmptyMerkleStats(proposalId: Nat64) {
        Debug.print("Inicializando estatísticas Merkle zeradas para proposta: " # debug_show(proposalId));
        
        switch (merkleVotingSystem.getVotingStats(proposalId)) {
            case (null) {
                let dummyPrincipal = Principal.fromText("aaaaa-aa");
                let dummySalt = Blob.fromArray([0,0,0,0,0,0,0,0]);
                let _ = merkleVotingSystem.castVote(proposalId, dummyPrincipal, #Abstain, 0, dummySalt);
            };
            case (?_) {};
        };
    };

    // Função para inicializar estatísticas Quadratic zeradas
    private func initializeEmptyQuadraticStats(proposalId: Nat64) {
        Debug.print("Inicializando estatísticas QV zeradas para proposta: " # debug_show(proposalId));
        let _ = quadraticVotingSystem.getVotingStats(proposalId);
    };
    
    // Função para listar todas as propostas
    public query func getProposals() : async [Proposal] {
        Debug.print("Listando todas as propostas: " # Nat.toText(proposals.size()));
        Buffer.toArray(proposals)
    };
    
    // Função para votar usando sistema Merkle
    public shared(msg) func voteMerkle(
        proposalId: Nat64,
        value: MerkleVoteValue,
        weight: Nat,
        salt: Blob
    ) : async {
        success: Bool;
        message: Text;
        proof: ?MerkleVoting.MerkleProof;
    } {
        Debug.print("Voto Merkle na proposta " # debug_show(proposalId));
        
        // Verificar se a proposta suporta votação Merkle
        let proposalOpt = Array.find<Proposal>(Buffer.toArray(proposals), func(p) = p.id == proposalId);
        
        switch (proposalOpt) {
            case (null) {
                return {
                    success = false;
                    message = "Proposta não encontrada";
                    proof = null;
                };
            };
            case (?proposal) {
                switch (proposal.votingType) {
                    case (#Quadratic) {
                        return {
                            success = false;
                            message = "Esta proposta só aceita votação quadrática";
                            proof = null;
                        };
                    };
                    case (#Merkle or #Both) {
                        // Verificar deadline
                        if (Time.now() > proposal.deadline) {
                            return {
                                success = false;
                                message = "Votação encerrada";
                                proof = null;
                            };
                        };
                        
                        // Verificar se já votou
                        if (merkleVotingSystem.hasVoted(msg.caller, proposalId)) {
                            return {
                                success = false;
                                message = "Você já votou nesta proposta usando o sistema Merkle";
                                proof = null;
                            };
                        };
                        
                        // Registrar voto
                        let proof = merkleVotingSystem.castVote(proposalId, msg.caller, value, weight, salt);
                        
                        switch (proof) {
                            case (null) {
                                return {
                                    success = false;
                                    message = "Falha ao registrar o voto";
                                    proof = null;
                                };
                            };
                            case (?p) {
                                return {
                                    success = true;
                                    message = "Voto Merkle registrado com sucesso";
                                    proof = ?p;
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    // Função para votar usando sistema Quadratic
    public shared(msg) func voteQuadratic(
        proposalId: Nat64,
        value: QuadraticVoteValue,
        desiredVotes: Nat
    ) : async {
        success: Bool;
        message: Text;
        vote: ?QuadraticVoting.QuadraticVote;
        creditsUsed: Nat;
        remainingCredits: Nat;
    } {
        Debug.print("Voto Quadrático na proposta " # debug_show(proposalId) # 
                   " com " # Nat.toText(desiredVotes) # " votos");
        
        // Verificar se a proposta suporta votação quadrática
        let proposalOpt = Array.find<Proposal>(Buffer.toArray(proposals), func(p) = p.id == proposalId);
        
        switch (proposalOpt) {
            case (null) {
                return {
                    success = false;
                    message = "Proposta não encontrada";
                    vote = null;
                    creditsUsed = 0;
                    remainingCredits = 0;
                };
            };
            case (?proposal) {
                switch (proposal.votingType) {
                    case (#Merkle) {
                        return {
                            success = false;
                            message = "Esta proposta só aceita votação Merkle";
                            vote = null;
                            creditsUsed = 0;
                            remainingCredits = 0;
                        };
                    };
                    case (#Quadratic or #Both) {
                        // Verificar deadline
                        if (Time.now() > proposal.deadline) {
                            return {
                                success = false;
                                message = "Votação encerrada";
                                vote = null;
                                creditsUsed = 0;
                                remainingCredits = 0;
                            };
                        };
                        
                        // Registrar votante se necessário
                        let _ = quadraticVotingSystem.registerVoter(msg.caller);
                        
                        // Tentar votar
                        switch (quadraticVotingSystem.castVote(proposalId, msg.caller, value, desiredVotes)) {
                            case (#Success(vote)) {
                                // Obter perfil atualizado para créditos restantes
                                let remainingCredits = switch (quadraticVotingSystem.getVoterProfile(msg.caller)) {
                                    case (?profile) { profile.availableCredits };
                                    case (null) { 0 };
                                };
                                
                                return {
                                    success = true;
                                    message = "Voto quadrático registrado com sucesso";
                                    vote = ?vote;
                                    creditsUsed = vote.credits;
                                    remainingCredits;
                                };
                            };
                            case (#InsufficientCredits(needed)) {
                                return {
                                    success = false;
                                    message = "Créditos insuficientes. Necessário: " # Nat.toText(needed);
                                    vote = null;
                                    creditsUsed = 0;
                                    remainingCredits = 0;
                                };
                            };
                            case (#AlreadyVoted) {
                                return {
                                    success = false;
                                    message = "Você já votou nesta proposta usando o sistema quadrático";
                                    vote = null;
                                    creditsUsed = 0;
                                    remainingCredits = 0;
                                };
                            };
                            case (#InvalidProposal) {
                                return {
                                    success = false;
                                    message = "Proposta inválida";
                                    vote = null;
                                    creditsUsed = 0;
                                    remainingCredits = 0;
                                };
                            };
                            case (#VotingClosed) {
                                return {
                                    success = false;
                                    message = "Votação encerrada";
                                    vote = null;
                                    creditsUsed = 0;
                                    remainingCredits = 0;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    
    // Função para verificar um voto Merkle
    public query func verifyMerkleVote(proposalId: Nat64, proof: MerkleVoting.MerkleProof) : async Bool {
        Debug.print("Verificando voto Merkle para proposta: " # debug_show(proposalId));
        
        switch (merkleVotingSystem.getMerkleRoot(proposalId)) {
            case (null) { false };
            case (?root) { merkleVotingSystem.verifyProof(proof, root) };
        };
    };
    
    // Função para obter estatísticas Merkle
    public query func getMerkleStats(proposalId: Nat64) : async ?MerkleVoting.MerkleVotingStats {
        Debug.print("Obtendo estatísticas Merkle para proposta: " # debug_show(proposalId));
        merkleVotingSystem.getVotingStats(proposalId)
    };

    // Função para obter estatísticas Quadratic
    public query func getQuadraticStats(proposalId: Nat64) : async ?QuadraticVoting.QuadraticVotingStats {
        Debug.print("Obtendo estatísticas QV para proposta: " # debug_show(proposalId));
        quadraticVotingSystem.getVotingStats(proposalId)
    };

    // Função para obter estatísticas consolidadas
    public query func getConsolidatedStats(proposalId: Nat64) : async {
        proposalId: Nat64;
        votingType: ?VotingType;
        merkleStats: ?MerkleVoting.MerkleVotingStats;
        quadraticStats: ?QuadraticVoting.QuadraticVotingStats;
        isActive: Bool;
        timeRemaining: ?Int;
    } {
        Debug.print("Obtendo estatísticas consolidadas para proposta: " # debug_show(proposalId));
        
        let proposalOpt = Array.find<Proposal>(Buffer.toArray(proposals), func(p) = p.id == proposalId);
        let now = Time.now();
        
        switch (proposalOpt) {
            case (?proposal) {
                let isActive = now <= proposal.deadline;
                let timeRemaining = if (isActive) { ?(proposal.deadline - now) } else { null };
                
                let merkleStats = switch (proposal.votingType) {
                    case (#Merkle or #Both) { merkleVotingSystem.getVotingStats(proposalId) };
                    case (#Quadratic) { null };
                };
                
                let quadraticStats = switch (proposal.votingType) {
                    case (#Quadratic or #Both) { quadraticVotingSystem.getVotingStats(proposalId) };
                    case (#Merkle) { null };
                };
                
                return {
                    proposalId;
                    votingType = ?proposal.votingType;
                    merkleStats;
                    quadraticStats;
                    isActive;
                    timeRemaining;
                };
            };
            case (null) {
                return {
                    proposalId;
                    votingType = null;
                    merkleStats = null;
                    quadraticStats = null;
                    isActive = false;
                    timeRemaining = null;
                };
            };
        };
    };
    
    // Função para verificar se um usuário votou (qualquer sistema)
    public query(msg) func didIVote(proposalId: Nat64) : async {
        merkleVote: Bool;
        quadraticVote: Bool;
        hasVoted: Bool;
    } {
        Debug.print("Verificando votos de " # Principal.toText(msg.caller) # 
                   " na proposta " # debug_show(proposalId));
        
        let merkleVote = merkleVotingSystem.hasVoted(msg.caller, proposalId);
        let quadraticVote = quadraticVotingSystem.hasVoted(msg.caller, proposalId);
        let hasVoted = merkleVote or quadraticVote;
        
        return { merkleVote; quadraticVote; hasVoted };
    };

    // Função para obter perfil do votante quadrático
    public query(msg) func getMyQuadraticProfile() : async ?QuadraticVoting.VoterProfile {
        Debug.print("Obtendo perfil QV de: " # Principal.toText(msg.caller));
        quadraticVotingSystem.getVoterProfile(msg.caller)
    };

    // Função para registrar votante no sistema quadrático
    public shared(msg) func registerForQuadraticVoting() : async {
        success: Bool;
        message: Text;
        initialCredits: Nat;
    } {
        Debug.print("Registrando " # Principal.toText(msg.caller) # " no sistema QV");
        
        let success = quadraticVotingSystem.registerVoter(msg.caller);
        
        if (success) {
            return {
                success = true;
                message = "Registrado com sucesso no sistema de votação quadrática";
                initialCredits = 100;
            };
        } else {
            return {
                success = false;
                message = "Você já está registrado no sistema de votação quadrática";
                initialCredits = 0;
            };
        };
    };

    // Funções utilitárias para QV
    public query func calculateQuadraticCost(votes: Nat) : async Nat {
        quadraticVotingSystem.creditsNeededForVotes(votes)
    };

    public query func calculateMaxVotes(credits: Nat) : async Nat {
        quadraticVotingSystem.maxVotesWithCredits(credits)
    };

    // Função para obter resultado final de uma proposta
    public query func getProposalResult(proposalId: Nat64) : async {
        proposalId: Nat64;
        votingType: ?VotingType;
        merkleResult: ?{
            totalVotes: Nat;
            yesVotes: Nat;
            noVotes: Nat;
            abstainVotes: Nat;
            winner: Text;
        };
        quadraticResult: ?{
            totalVotes: Nat;
            yesVotes: Nat;
            noVotes: Nat;
            abstainVotes: Nat;
            totalParticipants: Nat;
            winner: Text;
        };
        isActive: Bool;
    } {
        Debug.print("Obtendo resultado para proposta: " # debug_show(proposalId));
        
        let proposalOpt = Array.find<Proposal>(Buffer.toArray(proposals), func(p) = p.id == proposalId);
        let now = Time.now();
        
        switch (proposalOpt) {
            case (?proposal) {
                let isActive = now <= proposal.deadline;
                
                // Resultado Merkle
                let merkleResult = switch (proposal.votingType) {
                    case (#Merkle or #Both) {
                        switch (merkleVotingSystem.getVotingStats(proposalId)) {
                            case (?stats) {
                                let winner = if (stats.yesVotes > stats.noVotes and stats.yesVotes > stats.abstainVotes) {
                                    "Sim"
                                } else if (stats.noVotes > stats.abstainVotes) {
                                    "Não"
                                } else {
                                    "Abstenção"
                                };
                                
                                ?{
                                    totalVotes = stats.totalVotes;
                                    yesVotes = stats.yesVotes;
                                    noVotes = stats.noVotes;
                                    abstainVotes = stats.abstainVotes;
                                    winner;
                                }
                            };
                            case (null) { null };
                        };
                    };
                    case (#Quadratic) { null };
                };
                
                // Resultado Quadrático
                let quadraticResult = switch (proposal.votingType) {
                    case (#Quadratic or #Both) {
                        switch (quadraticVotingSystem.getProposalResult(proposalId)) {
                            case (?result) {
                                let winner = switch (result.winner) {
                                    case (#Yes) { "Sim" };
                                    case (#No) { "Não" };
                                    case (#Abstain) { "Abstenção" };
                                };
                                
                                ?{
                                    totalVotes = result.yesScore + result.noScore + result.abstainScore;
                                    yesVotes = result.yesScore;
                                    noVotes = result.noScore;
                                    abstainVotes = result.abstainScore;
                                    totalParticipants = result.totalParticipation;
                                    winner;
                                }
                            };
                            case (null) { null };
                        };
                    };
                    case (#Merkle) { null };
                };
                
                return {
                    proposalId;
                    votingType = ?proposal.votingType;
                    merkleResult;
                    quadraticResult;
                    isActive;
                };
            };
            case (null) {
                return {
                    proposalId;
                    votingType = null;
                    merkleResult = null;
                    quadraticResult = null;
                    isActive = false;
                };
            };
        };
    };
    
    // Função para gerar um salt para o cliente usar (Merkle)
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
        merkleVoteCount: Nat;
        quadraticVoterCount: Nat;
        merkleStats: [(Nat64, MerkleVoting.MerkleVotingStats)];
        quadraticStats: [(Nat64, QuadraticVoting.QuadraticVotingStats)];
    } {
        Debug.print("Obtendo informações de debug");
        {
            proposalCount = proposals.size();
            merkleVoteCount = merkleVotingSystem.getVoteCount();
            quadraticVoterCount = quadraticVotingSystem.getTotalRegisteredVoters();
            merkleStats = merkleVotingSystem.getAllStats();
            quadraticStats = quadraticVotingSystem.getAllProposalStats();
        }
    };

    // Função administrativa para adicionar créditos
    public shared(msg) func addCreditsToVoter(voter: Principal, credits: Nat) : async {
        success: Bool;
        message: Text;
    } {
        // Aqui você pode adicionar verificação de permissões de admin
        Debug.print("Adicionando " # Nat.toText(credits) # " créditos para " # Principal.toText(voter));
        
        let success = quadraticVotingSystem.addCreditsToVoter(voter, credits);
        
        if (success) {
            return {
                success = true;
                message = "Créditos adicionados com sucesso";
            };
        } else {
            return {
                success = false;
                message = "Falha ao adicionar créditos. Votante não encontrado.";
            };
        };
    };
}