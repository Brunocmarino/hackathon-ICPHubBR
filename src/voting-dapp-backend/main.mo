import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
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
import Types "types";
import MerkleVoting "./MerkleVoting";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Error "mo:base/Error";

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
        Debug.print("Proposta criada: " # title);
        
        return id;
    };
    
    // Função para listar todas as propostas
    public query func getProposals() : async [Proposal] {
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
        // Verificar se a proposta existe
        var proposalExists = false;
        for (proposal in proposals.vals()) {
            if (proposal.id == proposalId) {
                proposalExists := true;
                
                // Verificar se a votação ainda está aberta
                if (Time.now() > proposal.deadline) {
                    return {
                        success = false;
                        message = "A votação para esta proposta já encerrou";
                        proof = null;
                    };
                };
            };
        };
        
        if (not proposalExists) {
            return {
                success = false;
                message = "Proposta não encontrada";
                proof = null;
            };
        };
        
        // Verificar se o usuário já votou
        if (votingSystem.hasVoted(msg.caller, proposalId)) {
            return {
                success = false;
                message = "Você já votou nesta proposta";
                proof = null;
            };
        };
        
        // Registrar o voto
        let proof = votingSystem.castVote(proposalId, msg.caller, value, weight, salt);
        
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
                    message = "Voto registrado com sucesso";
                    proof = ?p;
                };
            };
        };
    };
    
    // Função para verificar um voto
    public query func verifyVote(proposalId: Nat64, proof: MerkleVoting.MerkleProof) : async Bool {
        switch (votingSystem.getMerkleRoot(proposalId)) {
            case (null) { false };
            case (?root) { votingSystem.verifyProof(proof, root) };
        };
    };
    
    // Função para obter estatísticas de votação
    public query func getVotingStats(proposalId: Nat64) : async ?MerkleVoting.MerkleVotingStats {
        votingSystem.getVotingStats(proposalId)
    };
    
    // Função para verificar se um usuário votou
    public query(msg) func didIVote(proposalId: Nat64) : async Bool {
        votingSystem.hasVoted(msg.caller, proposalId)
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
}