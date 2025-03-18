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
        };

        private func getProof(voter : Principal, proposalId : Nat64) : ?MerkleProof {
            for ((key, proof) in proofs.vals()) {
                if (Principal.equal(key.0, voter) and key.1 == proposalId) {
                    return ?proof;
                };
            };
            null
        };

        private func putProof(voter : Principal, proposalId : Nat64, proof : MerkleProof) {
            proofs := Array.append(proofs, [((voter, proposalId), proof)]);
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
            merkleRoots := Array.append(merkleRoots, [(proposalId, root)]);
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
            // Primeiro remover estatísticas existentes para esta proposta
            var newStats : [(Nat64, MerkleVotingStats)] = [];
            for ((id, s) in votingStats.vals()) {
                if (id != proposalId) {
                    newStats := Array.append(newStats, [(id, s)]);
                };
            };
            votingStats := Array.append(newStats, [(proposalId, stats)]);
        };

        // Função para registrar um voto anônimo
        public func castVote(
            proposalId : Nat64,
            voter : Principal,
            value : VoteValue,
            weight : Nat,
            salt : Blob
        ) : ?MerkleProof {
            let timestamp = Time.now();
            let voteHash = createVoteHash(proposalId, voter, value, salt, timestamp);
            
            // Verifica se este voter já votou nesta proposta
            switch (getProof(voter, proposalId)) {
                case (?_) { return null }; // Já votou
                case (null) {
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
                    updateStats(proposalId, value, weight);
                    
                    // Gerar Merkle Proof
                    let proof = generateMerkleProof(proposalId, voteHash);
                    putProof(voter, proposalId, proof);
                    
                    return ?proof;
                };
            };
        };

        // Função para atualizar as estatísticas de votação
        private func updateStats(proposalId : Nat64, value : VoteValue, weight : Nat) {
            var stats = switch (getStats(proposalId)) {
                case (?s) { s };
                case (null) { 
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
            
            stats := {
                totalVotes = stats.totalVotes + 1;
                yesVotes = stats.yesVotes + (if (value == #Yes) 1 else 0);
                noVotes = stats.noVotes + (if (value == #No) 1 else 0);
                abstainVotes = stats.abstainVotes + (if (value == #Abstain) 1 else 0);
                totalWeight = stats.totalWeight + weight;
                yesWeight = stats.yesWeight + (if (value == #Yes) weight else 0);
                noWeight = stats.noWeight + (if (value == #No) weight else 0);
                abstainWeight = stats.abstainWeight + (if (value == #Abstain) weight else 0);
            };
            
            putStats(proposalId, stats);
        };

        // Gera uma prova de Merkle para um voto
        private func generateMerkleProof(proposalId : Nat64, voteHash : Blob) : MerkleProof {
            // Obter todos os hashes de votos para esta proposta
            let voteHashes = Buffer.Buffer<Blob>(10);
            for ((hash, vote) in votes.vals()) {
                if (vote.proposalId == proposalId) {
                    voteHashes.add(hash);
                };
            };
            
            // Garantir que temos pelo menos um voto
            if (voteHashes.size() == 0) {
                return {
                    voteHash;
                    siblings = [];
                    path = [];
                };
            };
            
            // Encontrar o índice do voto atual
            var index = 0;
            label l for (i in Iter.range(0, voteHashes.size() - 1)) {
                if (Blob.equal(voteHashes.get(i), voteHash)) {
                    index := i;
                    break l;
                };
            };
            
            // Construir a árvore de Merkle
            let tree = buildMerkleTree(Buffer.toArray(voteHashes));
            
            // Calcular a prova
            let proof = calculateProof(tree, index);
            
            // Atualizar a raiz da Merkle tree para esta proposta
            if (tree.size() > 0) {
                putRoot(proposalId, tree.get(tree.size() - 1));
            };
            
            return proof;
        };

        // Constrói uma árvore de Merkle a partir de um array de hashes
        private func buildMerkleTree(leaves : [Blob]) : Buffer.Buffer<Blob> {
            let tree = Buffer.Buffer<Blob>(leaves.size() * 2);
            
            // Adicionar as folhas
            for (leaf in leaves.vals()) {
                tree.add(leaf);
            };
            
            // Construir os níveis acima
            var levelSize = leaves.size();
            while (levelSize > 1) {
                var i = 0;
                while (i < levelSize / 2) {
                    let left = tree.get(i * 2);
                    let right = tree.get(i * 2 + 1);
                    tree.add(simpleHash(concatBlobs(left, right)));
                    i += 1;
                };
                
                // Se o número de nós é ímpar, o último nó não tem par
                if (levelSize % 2 == 1) {
                    let last = tree.get(levelSize - 1);
                    tree.add(last);
                    levelSize := levelSize / 2 + 1;
                } else {
                    levelSize := levelSize / 2;
                };
            };
            
            return tree;
        };

       // Calcula a prova de Merkle para um índice específico
        private func calculateProof(tree : Buffer.Buffer<Blob>, index : Nat) : MerkleProof {
            let siblings = Buffer.Buffer<Blob>(10);
            let path = Buffer.Buffer<Bool>(10);
            
            var currentIndex = index;
            var levelStart = 0;
            var levelSize = tree.size() / 2;
            var continueProcessing = true;
            
            while (levelSize > 1 and continueProcessing) {
                let isRight = currentIndex % 2 == 1;
                var siblingIndex = 0;
                var validSibling = true;
                
                if (isRight) {
                    siblingIndex := currentIndex - 1;
                } else if (currentIndex + 1 < levelSize) {
                    siblingIndex := currentIndex + 1;
                } else {
                    // Nodo sem par no final de um nível
                    validSibling := false;
                    continueProcessing := false;
                };
                
                if (validSibling) {
                    siblings.add(tree.get(levelStart + siblingIndex));
                    path.add(isRight);
                    
                    currentIndex := currentIndex / 2;
                    levelStart := levelStart + levelSize;
                    levelSize := levelSize / 2;
                };
            };
            
            return {
                voteHash = tree.get(index);
                siblings = Buffer.toArray(siblings);
                path = Buffer.toArray(path);
            };
        };
            
         
        // Verifica uma prova de Merkle
        public func verifyProof(proof : MerkleProof, root : Blob) : Bool {
            var currentHash = proof.voteHash;
            
            for (i in Iter.range(0, proof.siblings.size() - 1)) {
                let sibling = proof.siblings[i];
                let isRight = proof.path[i];
                
                if (isRight) {
                    currentHash := simpleHash(concatBlobs(sibling, currentHash));
                } else {
                    currentHash := simpleHash(concatBlobs(currentHash, sibling));
                };
            };
            
            return Blob.equal(currentHash, root);
        };

        // Obtém a raiz da árvore de Merkle para uma proposta
        public func getMerkleRoot(proposalId : Nat64) : ?Blob {
            getRoot(proposalId)
        };

        // Obtém as estatísticas de votação para uma proposta
        public func getVotingStats(proposalId : Nat64) : ?MerkleVotingStats {
            getStats(proposalId)
        };

        // Obtém a prova de Merkle para um votante específico
        public func getVoterProof(voter : Principal, proposalId : Nat64) : ?MerkleProof {
            getProof(voter, proposalId)
        };

        // Verifica se um votante já votou em uma proposta
        public func hasVoted(voter : Principal, proposalId : Nat64) : Bool {
            Option.isSome(getProof(voter, proposalId))
        };
    };
}
