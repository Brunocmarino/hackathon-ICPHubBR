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

module {
    // Definição de tipos para o sistema de votação baseado em Merkle Tree
    public type VoteValue = {
        #Yes;
        #No;
        #Abstain;
    };

    public type Vote = {
        proposalId: Nat64;
        voter: Blob;  // Hash da identidade do votante
        value: VoteValue;
        weight: Nat;  // Peso do voto baseado em tokens
        timestamp: Time.Time;
    };

    public type MerkleProof = {
        voteHash: Blob;       // Hash do voto
        siblings: [Blob];     // Nodos irmãos para verificação
        path: [Bool];         // Caminho na árvore (esquerda/direita)
    };

    public type MerkleVotingStats = {
        totalVotes: Nat;
        yesVotes: Nat;
        noVotes: Nat;
        abstainVotes: Nat;
        totalWeight: Nat;
        yesWeight: Nat;
        noWeight: Nat;
        abstainWeight: Nat;
    };

    public class MerkleVoting() {
        // Usamos arrays simples para armazenar os dados
        private var votes : [(Blob, Vote)] = [];
        private var proofs : [((Principal, Nat64), MerkleProof)] = [];
        private var merkleRoots : [(Nat64, Blob)] = [];
        private var votingStats : [(Nat64, MerkleVotingStats)] = [];

        private func simpleHash(data : Blob) : Blob {
            let bytes = Blob.toArray(data);
            let size = bytes.size();
            
            if (size == 0) {
                return Blob.fromArray([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            };
            
            // Cria um buffer de 16 bytes para o hash
            let hashBuffer = Array.init<Nat8>(16, 0);
            
            // Preenche o buffer com valores calculados a partir dos bytes de entrada
            for (i in Iter.range(0, size - 1)) {
                let pos = i % 16;
                let currentByte = bytes[i];
                let currentHashByte = hashBuffer[pos];
                
                // Função simples de mistura
                let newValue : Nat8 = (currentHashByte +% currentByte) ^ (currentHashByte *% 3 +% 7) ^ (currentByte *% 5 +% 11);
                hashBuffer[pos] := newValue;
            };
            
            // Mistura adicional entre os bytes para aumentar a difusão
            for (_ in Iter.range(0, 3)) {
                for (i in Iter.range(0, 14)) {
                    hashBuffer[i] := hashBuffer[i] ^ hashBuffer[i+1];
                };
                for (i in Iter.range(0, 14)) {
                    let j = 15 - i;
                    hashBuffer[j] := hashBuffer[j] ^ hashBuffer[j-1];
                };
            };
            
            return Blob.fromArray(Array.freeze(hashBuffer));
        };

        // Função para concatenar dois blobs
        private func concatBlobs(a : Blob, b : Blob) : Blob {
            let aArray = Blob.toArray(a);
            let bArray = Blob.toArray(b);
            let result = Array.append<Nat8>(aArray, bArray);
            Blob.fromArray(result)
        };

        // Função para criar um hash de voto
        public func createVoteHash(
            proposalId : Nat64,
            voter : Principal,
            value : VoteValue,
            salt : Blob,
            timestamp : Time.Time
        ) : Blob {
            let valueBlob = switch (value) {
                case (#Yes) Blob.fromArray([1]);
                case (#No) Blob.fromArray([0]);
                case (#Abstain) Blob.fromArray([2]);
            };
            
            // Usar Principal e outros valores diretamente
            let voterBlob = Principal.toBlob(voter);
            
            // Converter proposalId para um array de bytes
            var proposalBytes = Buffer.Buffer<Nat8>(8);
            var tempId = proposalId;
            for (_ in Iter.range(0, 7)) {
                proposalBytes.add(Nat8.fromNat(Nat64.toNat(tempId % 256)));
                tempId := tempId / 256;
            };
            let proposalBlob = Blob.fromArray(Buffer.toArray(proposalBytes));
            
            
            let dataToHash = concatBlobs(proposalBlob, 
                               concatBlobs(voterBlob, 
                                 concatBlobs(salt, valueBlob)));
            
            Debug.print("Criando hash para voto - ProposalID: " # debug_show(proposalId) # 
                       ", Valor: " # debug_show(value));
            
            simpleHash(dataToHash)
        };

        // Funções auxiliares para manipular os arrays
        private func getVote(hash : Blob) : ?Vote {
            for ((h, v) in votes.vals()) {
                if (Blob.equal(h, hash)) {
                    return ?v;
                };
            };
            null
        };

        private func putVote(hash : Blob, vote : Vote) {
            votes := Array.append(votes, [(hash, vote)]);
            Debug.print("Voto armazenado para proposta: " # debug_show(vote.proposalId));
        };

        private func getProof(voter : Principal, proposalId : Nat64) : ?MerkleProof {
            for (((p, id), proof) in proofs.vals()) {
                if (Principal.equal(p, voter) and id == proposalId) {
                    return ?proof;
                };
            };
            null
        };

        private func putProof(voter : Principal, proposalId : Nat64, proof : MerkleProof) {
            proofs := Array.append(proofs, [((voter, proposalId), proof)]);
            Debug.print("Prova armazenada para votante: " # Principal.toText(voter));
        };

        private func getRoot(proposalId : Nat64) : ?Blob {
            for ((id, root) in merkleRoots.vals()) {
                if (id == proposalId) {
                    return ?root;
                };
            };
            null
        };

        private func putRoot(proposalId : Nat64, root : Blob) {
            // Verificar se já existe uma raiz
            var exists = false;
            for ((id, _) in merkleRoots.vals()) {
                if (id == proposalId) {
                    exists := true;
                };
            };
            
            // Se existe, atualizar; senão, adicionar
            if (exists) {
                var newRoots : [(Nat64, Blob)] = [];
                for ((id, r) in merkleRoots.vals()) {
                    if (id != proposalId) {
                        newRoots := Array.append(newRoots, [(id, r)]);
                    };
                };
                merkleRoots := Array.append(newRoots, [(proposalId, root)]);
            } else {
                merkleRoots := Array.append(merkleRoots, [(proposalId, root)]);
            };
            
            Debug.print("Raiz Merkle atualizada para proposta: " # debug_show(proposalId));
        };

        private func getStats(proposalId : Nat64) : ?MerkleVotingStats {
            for ((id, stats) in votingStats.vals()) {
                if (id == proposalId) {
                    return ?stats;
                };
            };
            null
        };

        private func putStats(proposalId : Nat64, stats : MerkleVotingStats) {
            Debug.print("Atualizando estatísticas da proposta " # debug_show(proposalId) # 
                       ": Total=" # Nat.toText(stats.totalVotes) # 
                       ", Sim=" # Nat.toText(stats.yesVotes) # 
                       ", Não=" # Nat.toText(stats.noVotes) # 
                       ", Abst=" # Nat.toText(stats.abstainVotes));
            
            // Verificar se já existem estatísticas
            var exists = false;
            for ((id, _) in votingStats.vals()) {
                if (id == proposalId) {
                    exists := true;
                };
            };
            
            // Se existe, atualizar; senão, adicionar
            if (exists) {
                var newStats : [(Nat64, MerkleVotingStats)] = [];
                for ((id, s) in votingStats.vals()) {
                    if (id != proposalId) {
                        newStats := Array.append(newStats, [(id, s)]);
                    };
                };
                votingStats := Array.append(newStats, [(proposalId, stats)]);
            } else {
                votingStats := Array.append(votingStats, [(proposalId, stats)]);
            };
        };

        // Função para registrar um voto anônimo
        public func castVote(
            proposalId : Nat64,
            voter : Principal,
            value : VoteValue,
            weight : Nat,
            salt : Blob
        ) : ?MerkleProof {
            Debug.print("Registrando voto na proposta " # debug_show(proposalId) # 
                       " pelo usuário " # Principal.toText(voter) # 
                       " com valor " # debug_show(value));
            
            // Verifica se este voter já votou nesta proposta
            if (Option.isSome(getProof(voter, proposalId))) {
                Debug.print("Usuário já votou nesta proposta");
                return null;
            };
            
            let timestamp = Time.now();
            let voteHash = createVoteHash(proposalId, voter, value, salt, timestamp);
            
            // Criar o objeto de voto
            let vote : Vote = {
                proposalId;
                voter = simpleHash(Principal.toBlob(voter)); // Ocultar identidade
                value;
                weight;
                timestamp;
            };
            
            // Armazenar o voto
            putVote(voteHash, vote);
            
            // Atualizar as estatísticas
            Debug.print("Atualizando estatísticas para o voto");
            updateStats(proposalId, value, weight);
            
            // Verificar as estatísticas atualizadas
            switch (getStats(proposalId)) {
                case (?stats) {
                    Debug.print("Estatísticas após voto: Total=" # Nat.toText(stats.totalVotes) # 
                              ", Sim=" # Nat.toText(stats.yesVotes));
                };
                case (null) {
                    Debug.print("ERRO: Estatísticas não encontradas após atualização!");
                };
            };
            
            // Gerar Merkle Proof (simplificado)
            let proof = generateMerkleProof(proposalId, voteHash);
            putProof(voter, proposalId, proof);
            
            Debug.print("Voto registrado com sucesso");
            return ?proof;
        };
        
        // Versão simplificada para gerar uma prova de Merkle
        private func generateMerkleProof(proposalId : Nat64, voteHash : Blob) : MerkleProof {
            // Usar o hash do voto como raiz para simplicidade
            putRoot(proposalId, voteHash);
            
            // Retornar uma prova simples
            {
                voteHash = voteHash;
                siblings = [];
                path = [];
            }
        };

        // Função para atualizar as estatísticas de votação
        private func updateStats(proposalId : Nat64, value : VoteValue, weight : Nat) {
            Debug.print("Atualizando estatísticas para proposta: " # debug_show(proposalId));
            
            // Obter estatísticas atuais ou criar novas
            var stats = switch (getStats(proposalId)) {
                case (?s) { 
                    Debug.print("Estatísticas existentes encontradas: Total=" # Nat.toText(s.totalVotes));
                    s 
                };
                case (null) { 
                    Debug.print("Nenhuma estatística encontrada. Criando estatísticas iniciais.");
                    {
                        totalVotes = 0;
                        yesVotes = 0;
                        noVotes = 0;
                        abstainVotes = 0;
                        totalWeight = 0;
                        yesWeight = 0;
                        noWeight = 0;
                        abstainWeight = 0;
                    }
                };
            };
            
            // Atualizar contadores com base no tipo de voto
            let newStats : MerkleVotingStats = {
                totalVotes = stats.totalVotes + 1;
                yesVotes = stats.yesVotes + (switch (value) { case (#Yes) 1; case (_) 0 });
                noVotes = stats.noVotes + (switch (value) { case (#No) 1; case (_) 0 });
                abstainVotes = stats.abstainVotes + (switch (value) { case (#Abstain) 1; case (_) 0 });
                totalWeight = stats.totalWeight + weight;
                yesWeight = stats.yesWeight + (switch (value) { case (#Yes) weight; case (_) 0 });
                noWeight = stats.noWeight + (switch (value) { case (#No) weight; case (_) 0 });
                abstainWeight = stats.abstainWeight + (switch (value) { case (#Abstain) weight; case (_) 0 });
            };
            
            Debug.print("Estatísticas atualizadas: Total=" # Nat.toText(newStats.totalVotes) # 
                       ", Sim=" # Nat.toText(newStats.yesVotes) # 
                       ", Não=" # Nat.toText(newStats.noVotes));
            
            // Salvar as estatísticas atualizadas
            putStats(proposalId, newStats);
        };
            
        // Verifica uma prova de Merkle (simplificado)
        public func verifyProof(proof : MerkleProof, root : Blob) : Bool {
            Blob.equal(proof.voteHash, root)
        };

        // Obtém a raiz da árvore de Merkle para uma proposta
        public func getMerkleRoot(proposalId : Nat64) : ?Blob {
            getRoot(proposalId)
        };

        // Obtém as estatísticas de votação para uma proposta
        public func getVotingStats(proposalId : Nat64) : ?MerkleVotingStats {
            Debug.print("Obtendo estatísticas para proposta: " # debug_show(proposalId));
            let stats = getStats(proposalId);
            
            switch (stats) {
                case (?s) {
                    Debug.print("Estatísticas encontradas: Total=" # Nat.toText(s.totalVotes) # 
                              ", Sim=" # Nat.toText(s.yesVotes) # 
                              ", Não=" # Nat.toText(s.noVotes));
                };
                case (null) {
                    Debug.print("Nenhuma estatística encontrada para a proposta");
                };
            };
            
            stats
        };

        // Obtém a prova de Merkle para um votante específico
        public func getVoterProof(voter : Principal, proposalId : Nat64) : ?MerkleProof {
            getProof(voter, proposalId)
        };

        // Verifica se um votante já votou em uma proposta
        public func hasVoted(voter : Principal, proposalId : Nat64) : Bool {
            Option.isSome(getProof(voter, proposalId))
        };
        
        // Função para debug: Obtém a contagem total de votos armazenados
        public func getVoteCount() : Nat {
            votes.size()
        };
        
        // Função para debug: Lista todas as estatísticas
        public func getAllStats() : [(Nat64, MerkleVotingStats)] {
            votingStats
        };
    };
}
