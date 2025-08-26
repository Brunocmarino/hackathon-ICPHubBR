import Time "mo:base/Time";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Float "mo:base/Float";

module {

    public type Result<Ok, Err> = Result.Result<Ok, Err>;
    public type HashMap<Ok, Err> = HashMap.HashMap<Ok, Err>;
    
    public type Member = {
        name : Text;
        age : Nat;
    };

    // Tipos para o sistema de votação
    public type VotingType = {
        #Merkle;
        #Quadratic;
        #Both;
    };

    // Tipos originais do DAO
    public type ProposalId = Nat64;
    public type ProposalContent = {
        #ChangeManifesto : Text; // Change the manifesto to the provided text
        #AddGoal : Text; // Add a new goal with the provided text
    };
    public type ProposalStatus = {
        #Open;
        #Accepted;
        #Rejected;
    };
    public type Vote = {
        member : Principal; // The member who voted
        votingPower : Nat;
        yesOrNo : Bool; // true = yes, false = no
    };
    public type Proposal = {
        id : Nat64; // The id of the proposal
        content : ProposalContent; // The content of the proposal
        creator : Principal; // The member who created the proposal
        created : Time.Time; // The time the proposal was created
        executed : ?Time.Time; // The time the proposal was executed or null if not executed
        votes : [Vote]; // The votes on the proposal so far
        voteScore : Int; // A score based on the votes
        status : ProposalStatus; // The current status of the proposal
    };

    // Tipos específicos para Merkle Voting
    public type MerkleVoteValue = {
        #Yes;
        #No;
        #Abstain;
    };

    public type MerkleVote = {
        proposalId: Nat64;
        voter: Blob;  // Hash da identidade do votante
        value: MerkleVoteValue;
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

    // Tipos específicos para Quadratic Voting
    public type QuadraticVoteValue = {
        #Yes;
        #No;
        #Abstain;
    };

    public type QuadraticVote = {
        proposalId: Nat64;
        voter: Principal;
        value: QuadraticVoteValue;
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

    public type QuadraticVotingResult = {
        #Success: QuadraticVote;
        #InsufficientCredits: Nat; // Créditos necessários
        #AlreadyVoted;
        #InvalidProposal;
        #VotingClosed;
    };

    // Tipos para resultados consolidados
    public type ConsolidatedVotingStats = {
        proposalId: Nat64;
        votingType: ?VotingType;
        merkleStats: ?MerkleVotingStats;
        quadraticStats: ?QuadraticVotingStats;
        isActive: Bool;
        timeRemaining: ?Int;
    };

    public type ProposalResult = {
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
    };

    // Tipos originais do DAO (mantidos para compatibilidade)
    public type DAOStats = {
        name : Text;
        manifesto : Text;
        goals : [Text];
        members : [Text];
        logo : Text;
        numberOfMembers : Nat;
    };
    
    public type HeaderField = (Text, Text);
    public type HttpRequest = {
        body : Blob;
        headers : [HeaderField];
        method : Text;
        url : Text;
    };
    public type HttpResponse = {
        body : Blob;
        headers : [HeaderField];
        status_code : Nat16;
        streaming_strategy : ?StreamingStrategy;
    };
    public type StreamingStrategy = {
        #Callback : {
            callback : StreamingCallback;
            token : StreamingCallbackToken;
        };
    };
    public type StreamingCallback = query (StreamingCallbackToken) -> async (StreamingCallbackResponse);
    public type StreamingCallbackToken = {
        content_encoding : Text;
        index : Nat;
        key : Text;
    };
    public type StreamingCallbackResponse = {
        body : Blob;
        token : ?StreamingCallbackToken;
    };
};