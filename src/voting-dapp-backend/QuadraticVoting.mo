import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Result "mo:base/Result";

module {
    // Definição de tipos para o sistema de votação quadrática
    public type VoteValue = {
        #Yes;
        #No;
        #Abstain;
    };

    public type QuadraticVote = {
        proposalId: Nat64;
        voter: Principal;
        value: VoteValue;
        credits: Nat;           // Créditos gastos
        votes: Nat;             // Número de votos (raiz quadrada dos créditos)
        timestamp: Time.Time;
    };

    public type VoterProfile = {
        principal: Principal;
        totalCredits: Nat;      // Créditos totais disponíveis
        usedCredits: Nat;       // Créditos já usados
        availableCredits: Nat;  // Créditos disponíveis
        votingHistory: [QuadraticVote];
    };

    public type QuadraticVotingStats = {
        totalParticipants: Nat;
        totalCreditsUsed: Nat;
        totalVotes: Nat;
        yesVotes: Nat;
        noVotes: Nat;
        abstainVotes: Nat;
        yesCredits: Nat;
        noCredits: Nat;
        abstainCredits: Nat;
        participationRate: Float; // Porcentagem de participação
    };

    public type VotingResult = {
        #Success: QuadraticVote;
        #InsufficientCredits: Nat; // Créditos necessários
        #AlreadyVoted;
        #InvalidProposal;
        #VotingClosed;
    };

    public class QuadraticVoting(initialCredits: Nat) {
        // Armazenamento de dados
        private var voters : [(Principal, VoterProfile)] = [];
        private var votes : [(Nat64, [QuadraticVote])] = [];
        private var proposalStats : [(Nat64, QuadraticVotingStats)] = [];
        private var totalRegisteredVoters : Nat = 0;

        // Função para calcular o número de votos baseado nos créditos (raiz quadrada)
        private func calculateVotes(credits: Nat) : Nat {
            if (credits == 0) return 0;
            
            // Implementação simples de raiz quadrada usando aproximação
            var result : Nat = 0;
            var i : Nat = 1;
            while (i * i <= credits) {
                result := i;
                i += 1;
            };
            result
        };

        // Função para calcular créditos necessários para X votos
        private func calculateCreditsNeeded(votes: Nat) : Nat {
            votes * votes
        };

        // Funções auxiliares para manipular arrays
        private func getVoter(voter: Principal) : ?VoterProfile {
            for ((p, profile) in voters.vals()) {
                if (Principal.equal(p, voter)) {
                    return ?profile;
                };
            };
            null
        };

        private func putVoter(voter: Principal, profile: VoterProfile) {
            // Verificar se já existe
            var exists = false;
            for ((p, _) in voters.vals()) {
                if (Principal.equal(p, voter)) {
                    exists := true;
                };
            };
            
            if (exists) {
                // Atualizar existente
                var newVoters : [(Principal, VoterProfile)] = [];
                for ((p, prof) in voters.vals()) {
                    if (not Principal.equal(p, voter)) {
                        newVoters := Array.append(newVoters, [(p, prof)]);
                    };
                };
                voters := Array.append(newVoters, [(voter, profile)]);
            } else {
                // Adicionar novo
                voters := Array.append(voters, [(voter, profile)]);
                totalRegisteredVoters += 1;
            };
            
            Debug.print("Perfil do votante atualizado para: " # Principal.toText(voter));
        };

        private func getProposalVotes(proposalId: Nat64) : [QuadraticVote] {
            for ((id, voteList) in votes.vals()) {
                if (id == proposalId) {
                    return voteList;
                };
            };
            []
        };

        private func putProposalVote(proposalId: Nat64, vote: QuadraticVote) {
            let currentVotes = getProposalVotes(proposalId);
            let newVotes = Array.append(currentVotes, [vote]);
            
            // Verificar se já existe
            var exists = false;
            for ((id, _) in votes.vals()) {
                if (id == proposalId) {
                    exists := true;
                };
            };
            
            if (exists) {
                // Atualizar existente
                var newVotesList : [(Nat64, [QuadraticVote])] = [];
                for ((id, voteList) in votes.vals()) {
                    if (id != proposalId) {
                        newVotesList := Array.append(newVotesList, [(id, voteList)]);
                    };
                };
                votes := Array.append(newVotesList, [(proposalId, newVotes)]);
            } else {
                // Adicionar novo
                votes := Array.append(votes, [(proposalId, newVotes)]);
            };
        };

        private func getStats(proposalId: Nat64) : ?QuadraticVotingStats {
            for ((id, stats) in proposalStats.vals()) {
                if (id == proposalId) {
                    return ?stats;
                };
            };
            null
        };

        private func putStats(proposalId: Nat64, stats: QuadraticVotingStats) {
            // Verificar se já existe
            var exists = false;
            for ((id, _) in proposalStats.vals()) {
                if (id == proposalId) {
                    exists := true;
                };
            };
            
            if (exists) {
                // Atualizar existente
                var newStats : [(Nat64, QuadraticVotingStats)] = [];
                for ((id, s) in proposalStats.vals()) {
                    if (id != proposalId) {
                        newStats := Array.append(newStats, [(id, s)]);
                    };
                };
                proposalStats := Array.append(newStats, [(proposalId, stats)]);
            } else {
                // Adicionar novo
                proposalStats := Array.append(proposalStats, [(proposalId, stats)]);
            };

            Debug.print("Estatísticas QV atualizadas para proposta " # debug_show(proposalId) # 
                       ": Participantes=" # Nat.toText(stats.totalParticipants) # 
                       ", Créditos=" # Nat.toText(stats.totalCreditsUsed));
        };

        // Registrar um novo votante
        public func registerVoter(voter: Principal) : Bool {
            switch (getVoter(voter)) {
                case (?_) {
                    Debug.print("Votante já registrado: " # Principal.toText(voter));
                    false // Já registrado
                };
                case (null) {
                    let profile : VoterProfile = {
                        principal = voter;
                        totalCredits = initialCredits;
                        usedCredits = 0;
                        availableCredits = initialCredits;
                        votingHistory = [];
                    };
                    putVoter(voter, profile);
                    Debug.print("Novo votante registrado: " # Principal.toText(voter) # 
                               " com " # Nat.toText(initialCredits) # " créditos");
                    true
                };
            };
        };

        // Verificar se um votante já votou em uma proposta
        public func hasVoted(voter: Principal, proposalId: Nat64) : Bool {
            let proposalVotes = getProposalVotes(proposalId);
            for (vote in proposalVotes.vals()) {
                if (Principal.equal(vote.voter, voter)) {
                    return true;
                };
            };
            false
        };

        // Função principal para votar
        public func castVote(
            proposalId: Nat64,
            voter: Principal,
            value: VoteValue,
            desiredVotes: Nat
        ) : VotingResult {
            Debug.print("Tentativa de voto QV na proposta " # debug_show(proposalId) # 
                       " por " # Principal.toText(voter) # 
                       " com " # Nat.toText(desiredVotes) # " votos");

            // Verificar se o votante está registrado
            switch (getVoter(voter)) {
                case (null) {
                    // Auto-registrar se não estiver registrado
                    let registered = registerVoter(voter);
                    if (not registered) {
                        Debug.print("Falha ao registrar votante");
                        return #InvalidProposal;
                    };
                };
                case (?_) { /* Já registrado */ };
            };

            // Verificar se já votou nesta proposta
            if (hasVoted(voter, proposalId)) {
                Debug.print("Votante já votou nesta proposta");
                return #AlreadyVoted;
            };

            // Calcular créditos necessários
            let creditsNeeded = calculateCreditsNeeded(desiredVotes);
            
            // Verificar se tem créditos suficientes
            switch (getVoter(voter)) {
                case (null) {
                    return #InvalidProposal;
                };
                case (?profile) {
                    if (profile.availableCredits < creditsNeeded) {
                        Debug.print("Créditos insuficientes: necessário=" # Nat.toText(creditsNeeded) # 
                                   ", disponível=" # Nat.toText(profile.availableCredits));
                        return #InsufficientCredits(creditsNeeded);
                    };

                    // Criar o voto
                    let timestamp = Time.now();
                    let vote : QuadraticVote = {
                        proposalId;
                        voter;
                        value;
                        credits = creditsNeeded;
                        votes = desiredVotes;
                        timestamp;
                    };

                    // Atualizar o perfil do votante
                    let newHistory = Array.append(profile.votingHistory, [vote]);
                    let updatedProfile : VoterProfile = {
                        principal = profile.principal;
                        totalCredits = profile.totalCredits;
                        usedCredits = profile.usedCredits + creditsNeeded;
                        availableCredits = profile.availableCredits - creditsNeeded;
                        votingHistory = newHistory;
                    };
                    putVoter(voter, updatedProfile);

                    // Armazenar o voto
                    putProposalVote(proposalId, vote);

                    // Atualizar estatísticas
                    updateStats(proposalId);

                    Debug.print("Voto QV registrado com sucesso: " # Nat.toText(desiredVotes) # 
                               " votos por " # Nat.toText(creditsNeeded) # " créditos");

                    return #Success(vote);
                };
            };
        };

        // Atualizar estatísticas de uma proposta
        private func updateStats(proposalId: Nat64) {
            let proposalVotes = getProposalVotes(proposalId);
            
            var totalParticipants : Nat = 0;
            var totalCreditsUsed : Nat = 0;
            var totalVotes : Nat = 0;
            var yesVotes : Nat = 0;
            var noVotes : Nat = 0;
            var abstainVotes : Nat = 0;
            var yesCredits : Nat = 0;
            var noCredits : Nat = 0;
            var abstainCredits : Nat = 0;

            for (vote in proposalVotes.vals()) {
                totalParticipants += 1;
                totalCreditsUsed += vote.credits;
                totalVotes += vote.votes;

                switch (vote.value) {
                    case (#Yes) {
                        yesVotes += vote.votes;
                        yesCredits += vote.credits;
                    };
                    case (#No) {
                        noVotes += vote.votes;
                        noCredits += vote.credits;
                    };
                    case (#Abstain) {
                        abstainVotes += vote.votes;
                        abstainCredits += vote.credits;
                    };
                };
            };

            // Calcular taxa de participação
            let participationRate = if (totalRegisteredVoters > 0) {
                Float.fromInt(totalParticipants) / Float.fromInt(totalRegisteredVoters)
            } else {
                0.0
            };

            let stats : QuadraticVotingStats = {
                totalParticipants;
                totalCreditsUsed;
                totalVotes;
                yesVotes;
                noVotes;
                abstainVotes;
                yesCredits;
                noCredits;
                abstainCredits;
                participationRate;
            };

            putStats(proposalId, stats);
        };

        // Obter estatísticas de uma proposta
        public func getVotingStats(proposalId: Nat64) : ?QuadraticVotingStats {
            Debug.print("Obtendo estatísticas QV para proposta: " # debug_show(proposalId));
            
            switch (getStats(proposalId)) {
                case (?stats) {
                    Debug.print("Estatísticas QV encontradas: Participantes=" # Nat.toText(stats.totalParticipants) # 
                               ", Votos=" # Nat.toText(stats.totalVotes));
                    ?stats
                };
                case (null) {
                    Debug.print("Inicializando estatísticas QV zeradas");
                    let emptyStats : QuadraticVotingStats = {
                        totalParticipants = 0;
                        totalCreditsUsed = 0;
                        totalVotes = 0;
                        yesVotes = 0;
                        noVotes = 0;
                        abstainVotes = 0;
                        yesCredits = 0;
                        noCredits = 0;
                        abstainCredits = 0;
                        participationRate = 0.0;
                    };
                    putStats(proposalId, emptyStats);
                    ?emptyStats
                };
            };
        };

        // Obter perfil de um votante
        public func getVoterProfile(voter: Principal) : ?VoterProfile {
            getVoter(voter)
        };

        // Obter todos os votos de uma proposta
        public func getProposalAllVotes(proposalId: Nat64) : [QuadraticVote] {
            getProposalVotes(proposalId)
        };

        // Calcular o resultado final de uma proposta
        public func getProposalResult(proposalId: Nat64) : ?{
            winner: VoteValue;
            yesScore: Nat;
            noScore: Nat;
            abstainScore: Nat;
            totalParticipation: Nat;
            creditsAnalysis: {
                yesCredits: Nat;
                noCredits: Nat;
                abstainCredits: Nat;
                totalCredits: Nat;
            };
        } {
            switch (getStats(proposalId)) {
                case (?stats) {
                    let winner = if (stats.yesVotes > stats.noVotes and stats.yesVotes > stats.abstainVotes) {
                        #Yes
                    } else if (stats.noVotes > stats.abstainVotes) {
                        #No
                    } else {
                        #Abstain
                    };

                    ?{
                        winner;
                        yesScore = stats.yesVotes;
                        noScore = stats.noVotes;
                        abstainScore = stats.abstainVotes;
                        totalParticipation = stats.totalParticipants;
                        creditsAnalysis = {
                            yesCredits = stats.yesCredits;
                            noCredits = stats.noCredits;
                            abstainCredits = stats.abstainCredits;
                            totalCredits = stats.totalCreditsUsed;
                        };
                    }
                };
                case (null) { null };
            };
        };

        // Função utilitária para calcular quantos votos posso dar com X créditos
        public func maxVotesWithCredits(credits: Nat) : Nat {
            calculateVotes(credits)
        };

        // Função utilitária para calcular quantos créditos preciso para X votos
        public func creditsNeededForVotes(votes: Nat) : Nat {
            calculateCreditsNeeded(votes)
        };

        // Funções de debug
        public func getTotalRegisteredVoters() : Nat {
            totalRegisteredVoters
        };

        public func getAllVoters() : [(Principal, VoterProfile)] {
            voters
        };

        public func getAllProposalStats() : [(Nat64, QuadraticVotingStats)] {
            proposalStats
        };

        // Função para adicionar créditos a um votante (para admin)
        public func addCreditsToVoter(voter: Principal, additionalCredits: Nat) : Bool {
            switch (getVoter(voter)) {
                case (?profile) {
                    let updatedProfile : VoterProfile = {
                        principal = profile.principal;
                        totalCredits = profile.totalCredits + additionalCredits;
                        usedCredits = profile.usedCredits;
                        availableCredits = profile.availableCredits + additionalCredits;
                        votingHistory = profile.votingHistory;
                    };
                    putVoter(voter, updatedProfile);
                    Debug.print("Adicionados " # Nat.toText(additionalCredits) # 
                               " créditos para " # Principal.toText(voter));
                    true
                };
                case (null) {
                    Debug.print("Votante não encontrado para adicionar créditos");
                    false
                };
            };
        };
    };
}