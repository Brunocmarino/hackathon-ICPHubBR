# Sistemas de Votação Web3 com Internet Computer Platform (ICP)

## Visão Geral

Este projeto implementa uma solução descentralizada de votação no Internet Computer, permitindo que organizações escolham entre diferentes métodos de votação, incluindo o sistema anônimo baseado em árvores Merkle. A plataforma permite que qualquer organização crie propostas, selecione o método de votação mais adequado às suas necessidades, e permita que seus membros votem de forma segura e transparente.

## Tecnologias Utilizadas

- **Backend**: Motoko (linguagem nativa do Internet Computer)
- **Frontend**: React com TypeScript e Vite
- **Autenticação**: Internet Identity
- **Armazenamento**: Canisters no Internet Computer
- **Criptografia**: Implementação personalizada de árvores Merkle

## Recursos Principais

### 1. Sistemas de Votação Flexíveis

A plataforma oferece três tipos de sistemas de votação:

- **Votação Padrão**: Sistema tradicional onde os votos são registrados publicamente.
- **Votação Anônima com Merkle Tree**: Método que garante o anonimato dos votantes enquanto permite verificação.
- **Votação Ponderada por Tokens**: Sistema onde o peso do voto é determinado pela quantidade de tokens que o votante possui.

### 2. Votação Anônima com Merkle Tree

A inovação principal deste projeto é o sistema de votação anônimo baseado em árvores Merkle:

- **Anonimato Garantido**: Os votos são armazenados de forma que não podem ser rastreados até o votante.
- **Verificabilidade Criptográfica**: Cada votante recebe uma prova Merkle que confirma que seu voto foi contabilizado.
- **Segurança Web3**: Utiliza criptografia avançada dentro do ambiente seguro do Internet Computer.

## Instruções de Instalação e Execução

### Pré-requisitos

1. **DFINITY Canister SDK (DFX)**
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Node.js (v16 ou superior)**
   - Download: [nodejs.org](https://nodejs.org/)
   - Verifique a instalação: `node --version`

3. **Git**
   - Download: [git-scm.com](https://git-scm.com/downloads)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/voting-dapp.git
   cd voting-dapp
   ```

2. **Instale as dependências do projeto**
   ```bash
   npm install
   ```

3. **Inicie a réplica local do Internet Computer**
   ```bash
   dfx start --background
   ```

4. **Implante os canisters**
   ```bash
   dfx deploy
   ```
   
   Este comando irá:
   - Criar os canisters necessários
   - Compilar os contratos Motoko
   - Gerar as interfaces de comunicação
   - Implantar o backend e o frontend



### Estrutura do Projeto

```
voting-dapp/
├── src/
│   ├── voting-dapp-backend/     # Código Motoko para o backend
│   │   ├── main.mo              # Canister principal
│   │   ├── MerkleVoting.mo      # Implementação do sistema Merkle
│   │   └── types.mo             # Definições de tipos
│   │
│   └── voting-dapp-frontend/    # Código do frontend React/TypeScript
│       ├── src/
│       │   ├── components/      # Componentes UI reutilizáveis
│       │   ├── pages/           # Páginas da aplicação
│       │   ├── services/        # Serviços de conexão com o backend
│       │   ├── styles/          # Arquivos de estilo
│       │   ├── App.tsx          # Componente raiz
│       │   └── main.tsx         # Ponto de entrada
│       │
│       ├── package.json         # Dependências do frontend
│       └── vite.config.ts       # Configuração do Vite
│
├── dfx.json                     # Configuração dos canisters
└── package.json                 # Scripts e dependências do projeto
```

## Como Usar

### Para Organizações

1. **Acesse a plataforma** e faça login usando Internet Identity
2. **Registre-se como organização** na página "Registrar Organização"
3. **Crie uma nova proposta** através da interface "Criar Proposta"
4. **Selecione o método de votação** desejado (Padrão, Merkle Tree ou Ponderado por Tokens)
5. **Defina o período de votação** (duração em horas)
6. **Acompanhe os resultados** em tempo real na página da proposta

### Para Votantes

1. **Acesse a plataforma** e faça login usando Internet Identity
2. **Navegue pela lista de propostas** na página inicial
3. **Selecione uma proposta ativa** para participar
4. **Vote** escolhendo entre as opções disponíveis (Sim, Não, Abster-se)
5. **Receba uma prova criptográfica** se a votação for do tipo Merkle Tree
6. **Verifique seu voto** na seção "Meus Votos"

## Solução de Problemas

### Problemas Comuns

1. **Erro ao iniciar DFX**
   - Verifique se não há outra instância rodando: `dfx stop`
   - Tente novamente com: `dfx start --clean`

2. **Erro ao compilar contratos Motoko**
   - Verifique a sintaxe e versão do compilador
   - Execute `dfx cache delete` e tente implantar novamente

3. **Frontend não consegue conectar ao backend**
   - Verifique se os canisters estão em execução
   - Confirme se as declarações foram geradas: `dfx generate`

4. **Erro de autenticação**
   - Limpe os cookies do navegador
   - Tente usar outro navegador ou modo anônimo

### Suporte

Se precisar de ajuda adicional:
- Verifique a [documentação do Internet Computer](https://internetcomputer.org/docs/)
- Acesse [forum.dfinity.org](https://forum.dfinity.org/) para suporte da comunidade

## Conclusão

Este projeto representa uma solução inovadora para votações descentralizadas no ecossistema Web3, combinando a segurança e confiabilidade do Internet Computer com métodos avançados de votação que garantem privacidade, verificabilidade e transparência. A implementação de árvores Merkle para votação anônima representa um avanço significativo para sistemas de governança em DAOs e outras organizações descentralizadas.

A flexibilidade para escolher entre diferentes métodos de votação permite que as organizações adaptem o sistema às suas necessidades específicas, tornando esta solução versátil e aplicável a uma ampla gama de casos de uso no mundo descentralizado.