import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import D "mo:base/Debug";
import Buffer "mo:base/Buffer";

actor {

    /*
    Este é o backend do gerador de landing pages. 

    As landing pages são amplamente utilizadas para:

      - Divulgar promoções de produtos (E-commerce no geral);
      - Divulgar serviços;
      - Divulgação e inscrição em eventos e webinars;
      - Divulgação e inscrição em cursos on-line;
      - Várias outras finalidades

    Este DApp permitirá que os usuários criem uma ou várias landing pages com base em templates pré-definidos. Após a criação, a landing 
    page poderá ser publicada, ficando acessível para qualquer pessoa que desejar visualizá-la.

    */

    // Type utilizado para definir as principais informações que serão armazenadas da Page 
    type Page = { principal : Text;
                  nomePage : Text;
                  descricao: Text;
                  template: Text;                    
                  ativo: Bool;                
    };

    // Type utilizado para definir as informações que serão armazenadas das sections. Cada section será uma parte unica da Page. 
    type Section = { nomePage : Text; 
                    identificador: Text;
                    exibir : Bool;
    };

    // Type utilizado para definir as informações que serão armazenadas das props. As props serão os textos e URL de imagens da Page. 
    type Props = { nomePage : Text; 
                  identificador: Text;
                  tipo: Text;
                  text: Text;
    };
    
    var pagesBuffer = Buffer.Buffer<Page>(0);       //Este buffer é utilizado para aramazenar as pages criadas
    var sectionBuffer = Buffer.Buffer<Section>(0);  //Este buffer é utilizado para aramazenar as sections das pages criadas
    var propsBuffer = Buffer.Buffer<Props>(0);      //Este buffer é utilizado para aramazenar as props das pages criadas

    // Esta função será responsável por criar os registros de Page e adicioná-los ao buffer pagesBuffer.
    public shared(msg) func criarPage( nome: Text,
                                      descricao: Text,  
                                      template: Text) : async () {        

        // Somente usuários logados poderão criar Pages. O código abaixo irá testar se o usuário foi autenticado ou não.
        if (Principal.isAnonymous(msg.caller)) {
            // O chamador é anônimo
            D.trap("Usuário não identificado");
        };

        //Não poderá ser criadas duas Pages com mesmo nome (independende do usuário que criou). O nome será o identificado para carregar e apresentar um Page
        if(validarSePageExiste(nome)){
            D.trap("Já existe uma Page com este nome");
        };

        //Cria o record do Page
        var page : Page = { principal = Principal.toText(msg.caller);
                            nomePage = nome;
                            descricao = descricao;
                            template = template;                                
                            ativo = false;
                          };                                                 
              
        //Adiciona o record no Buffer.          
        pagesBuffer.add(page);

    };

    // Esta função irá retornar TRUE caso já exista uma página criada com o nome informado, ou FALSE se não existir
    private func validarSePageExiste(nomePage: Text) : Bool{
        let filteredPages = Buffer.mapFilter<Page, Page>(pagesBuffer, func (page) {
                                                                                      if (page.nomePage == nomePage) {
                                                                                          ?page
                                                                                      } else {
                                                                                          null
                                                                                      }
                                                                                  });        

        if( filteredPages.size() > 0 ) {
            return true;
        } else {
          return false;
        }
    };

    /* Esta função irá retornar todas as Pages do usuário que estiver logado. O usuário é identificado pelo 
       Principal utilizado no momento da identificação 
    */
    public shared(msg) func consultarLandingPagePorPrincipal() : async [Page] {

        // Somente usuários logados poderão pesquisar as Pages criadas. O código abaixo irá testar se o usuário foi autenticado ou não.
        if (Principal.isAnonymous(msg.caller)) {
            // O chamador é anônimo
            D.trap("Usuário não identificado");
        };

        let principal = Principal.toText(msg.caller);

        // É aplicado um filtro no pagesBuffer para retornar apenas os Pages referentes ao principal que realizou a chamada da função
        let filteredPages = Buffer.mapFilter<Page, Page>(pagesBuffer, func (page) {if (page.principal == principal) {
                                                                                        ?page
                                                                                   } else {
                                                                                        null
                                                                                   }});        

        return Buffer.toArray(filteredPages);
    };

    // Esta função será utilizada para alterar os dados de uma Page. 
    public shared(msg) func alterarPage( nome: Text,
                                         descricao: Text,  
                                         template: Text, 
                                         ativo: Bool) : async () {        

        // Somente usuários logados poderão alterar Pages. O código abaixo irá testar se o usuário foi autenticado ou não.
        if (Principal.isAnonymous(msg.caller)) {
            // O chamador é anônimo
            D.trap("Usuário não identificado");
        };
        
        let principal = Principal.toText(msg.caller);

        //localiza o index da Page no pagesBuffer. Isso é necessário para sobreescrever os dados já gravados
        let index = getIndexBufferPage(principal, nome);

        switch(index) {
            case(null) { /* se não localizar um index significa que a page não existe, neste caso não é realizada nenhuma ação */  };
            case(?i) {      
                // Um novo record é criado com base no dados recebidos.        
                let pag = { principal = principal;
                            nomePage = nome;
                            descricao = descricao;
                            template = template;                              
                            ativo = ativo;
                          };              
                // O record criado é utilizado para sobreescrever o Page correspondente ao indice localizado anteriormente.
                pagesBuffer.put(i,pag);            
            };
        };
    };

    // Esta função é utilizada para configurar as Sections e Props de um Page
    public shared(msg) func configPage( nome: Text,                                        
                                        sections: [Section], 
                                        props: [Props]) : async () {        

        // Somente usuários logados poderão configurar Pages. O código abaixo irá testar se o usuário foi autenticado ou não.
        if (Principal.isAnonymous(msg.caller)) {
            // O chamador é anônimo
            D.trap("Usuário não identificado");
        };

        let principal = Principal.toText(msg.caller);
        let filteredPages = Buffer.mapFilter<Page, Page>(pagesBuffer, func (page) { if (page.nomePage == nome and page.principal == principal ) {
                                                                                        ?page
                                                                                    } else {
                                                                                        null
                                                                                    } });        

        if( filteredPages.size() == 0 ) {
            D.trap("Usuário não é o dono desta page");
        };         

        func localizarSections(sec : Section) : ?Section {
            if (Text.equal(sec.nomePage, nome)) {
              null // Retorna null para excluir este item
            } else {
              ?sec // Retorna o item envolvido em um opcional para mantê-lo
            }
        };

        /// exclui todas as props da página
        sectionBuffer := Buffer.mapFilter<Section, Section>(sectionBuffer,localizarSections);

        for (sec in sections.vals()) {
            sectionBuffer.add(sec);
        };

        func localizar(prop : Props) : ?Props {
            if (Text.equal(prop.nomePage, nome)) {
              null // Retorna null para excluir este item
            } else {
              ?prop // Retorna o item envolvido em um opcional para mantê-lo
            }
        };

        /// exclui todas as props da página
        propsBuffer := Buffer.mapFilter<Props, Props>(propsBuffer,localizar);

        for (prop in props.vals()) {
          propsBuffer.add(prop);
        };

    };    

    /*
      Esta função é publica e poderá ser acessada por qualquer usuário (não será validado o principal do chamador), 
      ela será utilizada para verificar se o site foi publicado ou não.
    */
    public func verificaPageAtivo(nome: Text) : async Bool {
      
        var pTemp : Page = {  principal = "";
                              nomePage = nome;
                              descricao = "";
                              template = "";                                  
                              ativo = false;
                            };    

        func procurar(p1: Page, p2: Page): Bool {
            p1.nomePage == p2.nomePage;
        };      

        let index : ?Nat = Buffer.indexOf<Page>(pTemp, pagesBuffer, procurar); 
        
        switch(index){
            case(null){
                //se entrou nesta condição significa que não existe uma page com o nome informado
                return false};
            case(?i){              
                let pg :?Page = ?pagesBuffer.get(i);
                switch(pg) {
                    case(null) { 
                        //se entrou nesta condição significa que não existe um item no Buffer com o indice informado
                        return false; 
                    };
                    case(?p) { 
                        // irá retornar se a Page foi publicada ou não
                        return p.ativo;
                    };
                };
            };
        };  

    };

    // Esta função irá retornar os dados da Page
    public shared(msg) func getPageConfig(nome: Text) : async ?Page {

        // Somente usuários logados poderão obter as informação da Page. O código abaixo irá testar se o usuário foi autenticado ou não.
        if (Principal.isAnonymous(msg.caller)) {
            // O chamador é anônimo
            D.trap("Usuário não identificado");
        };

        //os dados da Page serão retornados apenas se o chamador for o dono dela.
        let page : ?Page = getPage(Principal.toText(msg.caller), nome);

        return page;
    };

    // Esta função irá retornar os dados da Page pesquisando pelo nome e principal (dono da Page)
    private func getPage(principal: Text, nome: Text) : ?Page {
      
        let index = getIndexBufferPage(principal, nome);

        switch(index){
            case(null){ return null};
            case(?i){              
                return ?pagesBuffer.get(i);                          
            };
        };  

    };

    // Esta função irá retornar o index de um Page no pagesBuffer filtrando pelo principal e nome da Page
    private func getIndexBufferPage(principal: Text, nome: Text) : ?Nat{

        var pTemp : Page = {  principal = principal;
                              nomePage = nome;
                              descricao = "";
                              template = "";                                  
                              ativo = false;
                            };    

        func procurar(p1: Page, p2: Page): Bool {
            p1.nomePage == p2.nomePage and p1.principal == p2.principal;
        };      

        let index : ?Nat = Buffer.indexOf<Page>(pTemp, pagesBuffer, procurar); 
        return index; 

    };

    // Esta função irá retornar as Sections de acordo com o nomePage passado como parametro
    public shared(msg) func getSectionConfig(nomePage: Text) : async [Section] {                

        let filteredSections = Buffer.mapFilter<Section, Section>(sectionBuffer, func (section) {if (section.nomePage == nomePage) {
                                                                                                     ?section
                                                                                                 } else {
                                                                                                     null
                                                                                                 }});        

        Buffer.toArray(filteredSections);
    };    

    // Esta função irá retornar as Props de acordo com o nomePage passado como parametro
    public shared(msg) func getPropsConfig(nomePage: Text) : async [Props] {      

        let filteredProps = Buffer.mapFilter<Props, Props>(propsBuffer, func (prop) { if (prop.nomePage == nomePage) {
                                                                                          ?prop
                                                                                      } else {
                                                                                          null
                                                                                      } });        

        Buffer.toArray(filteredProps);
    };        

};