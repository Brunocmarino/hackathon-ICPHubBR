import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/voting-dapp-backend/voting-dapp-backend.did.js";

// Singleton para gerenciar o estado de autenticação
class AuthService {
  constructor() {
    this.authClient = null;
    this.identity = null;
    this.agent = null;
    this.actor = null;
    this.isReady = false;
    this.initPromise = this.init();
  }

  async init() {
    this.authClient = await AuthClient.create();
    this.isReady = true;
    
    // Verificar se o usuário já está autenticado
    if (await this.authClient.isAuthenticated()) {
      await this.setupActor();
    }
  }

  async setupActor() {
    this.identity = await this.authClient.getIdentity();
    this.agent = new HttpAgent({ identity: this.identity });
    
    // Quando em desenvolvimento local, precisamos fazer fetch da raiz de chaves
    if (process.env.NODE_ENV !== "production") {
      await this.agent.fetchRootKey();
    }
    
    const canisterId = process.env.REACT_APP_CANISTER_ID || process.env.CANISTER_ID_VOTING_DAPP_BACKEND;
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: canisterId,
    });
    
    return this.actor;
  }

  async login() {
    await this.initPromise;
    
    return new Promise((resolve) => {
      this.authClient.login({
        identityProvider: process.env.REACT_APP_II_URL || "https://identity.ic0.app",
        onSuccess: async () => {
          await this.setupActor();
          resolve(true);
        },
        onError: (error) => {
          console.error("Login error:", error);
          resolve(false);
        },
      });
    });
  }

  async logout() {
    await this.initPromise;
    
    await this.authClient.logout();
    this.identity = null;
    this.actor = null;
  }

  async getActor() {
    await this.initPromise;
    
    if (!this.actor) {
      throw new Error("Not authenticated");
    }
    
    return this.actor;
  }

  async getIdentity() {
    await this.initPromise;
    
    return this.identity;
  }

  async isAuthenticated() {
    await this.initPromise;
    
    return this.authClient.isAuthenticated();
  }

  async getPrincipal() {
    await this.initPromise;
    
    if (!this.identity) return null;
    
    return this.identity.getPrincipal();
  }
}

// Exportar uma única instância do serviço
export default new AuthService();