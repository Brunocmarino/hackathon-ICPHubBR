import React from 'react';

function Login({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Votação Anônima com Merkle Tree</h1>
        
        <div className="login-description">
          <p>
            Bem-vindo ao sistema de votação descentralizado que utiliza 
            árvores Merkle para garantir o anonimato dos votos.
          </p>
          <p>
            Faça login com sua Internet Identity para começar a votar 
            ou criar suas próprias propostas de votação.
          </p>
        </div>
        
        <div className="features">
          <div className="feature">
            <h3>Votação Anônima</h3>
            <p>Ninguém saberá como você votou, mas você pode verificar que seu voto foi contabilizado.</p>
          </div>
          
          <div className="feature">
            <h3>Transparente</h3>
            <p>Todas as propostas e resultados são públicos e verificáveis na blockchain.</p>
          </div>
          
          <div className="feature">
            <h3>Descentralizado</h3>
            <p>Sistema construído no Internet Computer, sem servidores centralizados.</p>
          </div>
        </div>
        
        <button onClick={onLogin} className="login-button">
          Entrar com Internet Identity
        </button>
      </div>
    </div>
  );
}

export default Login;