import { useState, useEffect } from 'react';
import { geradorlp_backend } from 'declarations/geradorlp_backend';
import { Helmet } from "react-helmet";
import { useParams } from 'react-router-dom';
import {Ed25519KeyIdentity} from '@dfinity/identity';
import {HttpAgent} from '@dfinity/agent';
import {AssetManager} from '@dfinity/assets';
import Spinner from "../components/spinner";
import { Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";


//identidade utilizada para enviar os Assets para o Canister de frontend.
const identity = Ed25519KeyIdentity.generate(new Uint8Array(Array.from({length: 32}).fill(0)));

//verificar se o Dapp está rodando localmente
const isLocal = !window.location.host.endsWith('icp0.io');
const agent = new HttpAgent({
    host: isLocal ? `http://127.0.0.1:${window.location.port}` : 'https://icp0.io', identity,
});
if (isLocal) {
    agent.fetchRootKey();
}


// O ID do canister pode ser obtido a partir da URL, já que o frontend, neste exemplo, está hospedado no mesmo canister que o upload de arquivos
const canisterId = new URLSearchParams(window.location.search).get('canisterId') ?? /(.*?)(?:\.raw)?\.icp0.io/.exec(window.location.host)?.[1] ?? /(.*)\.localhost/.exec(window.location.host)?.[1];

// Criando uma instância do gerenciador de assets para o Canister de frontend mencionado acima.
const assetManager = new AssetManager({canisterId, agent});

function t1pageconfig() {
      
    const { nome } = useParams(); 
    const [pagesSections, setPagesSections] = useState(new Map());
    const [pagesProps, setPagesProps] = useState(new Map());
    const [pagesImg, setPagesImg] = useState(new Map());
    const [loading, setLoading] = useState(false);
    
    const [exibirModalCust, setExibirModalCust] = useState(false);
    const [campoAlteracao, setCampoAlteracao] = useState("");
    const [novoTexto, setNovoTexto] = useState("");

    const [footer, setFooter] = useState(false);    

    useEffect( async () => {         
        await configBackEnd();   
        defineValoresIniciais();
        await editarPage(nome);
    }, []);

    // Abaixo são definidos os textos dos campos que ainda não foram customizados
    function defineValoresIniciais(){
        setLoading(true);          
        pagesProps.set("secao1_prop1","Nome Site");
        pagesProps.set("secao1_prop2","Botão");
        pagesProps.set("secao1_prop3","Menu 1");
        pagesProps.set("secao1_prop4","Menu 2");
        pagesProps.set("secao1_prop5","Menu 3");
        pagesProps.set("secao1_prop6","Menu 4");
        pagesProps.set("secao1_prop7","Menu 5");
        pagesProps.set("secao1_prop8","Menu 6");
        pagesProps.set("secao1_prop9","Menu 7");

        pagesProps.set("secao2_prop1","TITULO. Recomendado no máximo 2 linhas.");
        pagesProps.set("secao2_prop2","Texto. Recomendado até 5 linhas de texto.");
        pagesProps.set("secao2_prop3","Botão");
        pagesProps.set("secao2_prop4","Botão"); 
        
        pagesProps.set("secao4_prop1","TITULO. Recomendado no máximo 2 linhas.");
        pagesProps.set("secao4_prop2","Texto. Recomendado até 5 linhas de texto");
        pagesProps.set("secao4_prop3","Descrição do item 1");
        pagesProps.set("secao4_prop4","Descrição do item 2");
        pagesProps.set("secao4_prop5","Descrição do item 3");
        pagesProps.set("secao4_prop6","Texto. Recomendado até 2 linhas de texto");
        pagesProps.set("secao4_prop9","TITULO. Recomendado no máximo 2 linhas.");
        pagesProps.set("secao4_prop10","Texto. Recomendado até 5 linhas de texto");
        pagesProps.set("secao4_prop11","Descrição do item 1");
        pagesProps.set("secao4_prop12","Descrição do item 2");
        pagesProps.set("secao4_prop13","Descrição do item 3");
        pagesProps.set("secao4_prop14","Descrição do item 4");
        pagesProps.set("secao4_prop15","Descrição do item 5");
        pagesProps.set("secao4_prop16","Texto. Recomendado até 2 linhas de texto");

        pagesProps.set("secao5_prop1","Subtitulo. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop2","TITULO. Recomendado no máximo 2 linhas.");
        pagesProps.set("secao5_prop3","Texto. Recomendado até 3 linhas de texto");
        pagesProps.set("secao5_prop4","Texto de Link. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop5","Texto de Link. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop6","TITULO. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop7","Texto. Recomendado até 2 linhas de texto");
        pagesProps.set("secao5_prop8","TITULO. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop9","Texto. Recomendado até 2 linhas de texto");
        pagesProps.set("secao5_prop10","TITULO. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop11","Texto. Recomendado até 2 linhas de texto");
        pagesProps.set("secao5_prop12","TITULO. Recomendado no máximo 1 linha.");
        pagesProps.set("secao5_prop13","Texto. Recomendado até 2 linhas de texto");

        pagesProps.set("secao6_prop1","Citação. Recomendado no máximo 5 linhas.");
        pagesProps.set("secao6_prop2","Nome Pessoa.");
        pagesProps.set("secao6_prop3","Cargo Pessoa.");

        pagesProps.set("secao7_prop1","TITULO DA TABELA. Recomendado no máximo 1 linha.");
        pagesProps.set("secao7_prop2","Texto. Recomendado até 2 linhas de texto.");
        pagesProps.set("secao7_prop3","Perfil 1");
        pagesProps.set("secao7_prop4","Texto. Recomendado no máximo 2 linha.");
        pagesProps.set("secao7_prop5","Valor.");
        pagesProps.set("secao7_prop6","mês.");
        pagesProps.set("secao7_prop7","Característica 1");
        pagesProps.set("secao7_prop8","Característica 2");
        pagesProps.set("secao7_prop9","Característica 3");
        pagesProps.set("secao7_prop10","Característica 4");
        pagesProps.set("secao7_prop11","Característica 5");
        pagesProps.set("secao7_prop12","Botão");        
        pagesProps.set("secao7_prop13","Perfil 2");
        pagesProps.set("secao7_prop14","Texto. Recomendado no máximo 2 linha.");
        pagesProps.set("secao7_prop15","Valor.");
        pagesProps.set("secao7_prop16","mês.");
        pagesProps.set("secao7_prop17","Característica 1");
        pagesProps.set("secao7_prop18","Característica 2");
        pagesProps.set("secao7_prop19","Característica 3");
        pagesProps.set("secao7_prop20","Característica 4");
        pagesProps.set("secao7_prop21","Característica 5");
        pagesProps.set("secao7_prop22","Botão");
        pagesProps.set("secao7_prop23","Perfil 3");
        pagesProps.set("secao7_prop24","Texto. Recomendado no máximo 2 linha.");
        pagesProps.set("secao7_prop25","Valor.");
        pagesProps.set("secao7_prop26","mês.");
        pagesProps.set("secao7_prop27","Característica 1");
        pagesProps.set("secao7_prop28","Característica 2");
        pagesProps.set("secao7_prop29","Característica 3");
        pagesProps.set("secao7_prop30","Característica 4");
        pagesProps.set("secao7_prop31","Característica 5");
        pagesProps.set("secao7_prop32","Botão");

        pagesProps.set("secao8_prop1","TITULO. Recomendado no máximo 1 linha.");
        pagesProps.set("secao8_prop2","Pergunta 1. Recomendado 1 linha de texto.");
        pagesProps.set("secao8_prop3","Resposta 1. Recomendado no máximo 4 linha.");
        pagesProps.set("secao8_prop4","Pergunta 2. Recomendado 1 linha de texto.");
        pagesProps.set("secao8_prop5","Pergunta 3. Recomendado 1 linha de texto.");
        pagesProps.set("secao8_prop6","Pergunta 4. Recomendado 1 linha de texto.");

        pagesProps.set("secao9_prop1","TITULO. Recomendado no máximo 1 linha.");
        pagesProps.set("secao9_prop2","Texto. Recomendado no máximo 5 linhas.");
        pagesProps.set("secao9_prop3","Botão.");

        setLoading(false);          

    }

    // esta função irá recuperar os estados das sections e props que foram gravadas, caso contrario serão utilizados os props padrões (pré-definidos).
    async function editarPage(){        
        setLoading(true);                

        let sConfig = await geradorlp_backend.getSectionConfig(nome);                
        for (let item of sConfig) {
            alterarPageSection(item.identificador, Boolean(item.exibir));
        }        
        
        let propConfig = await geradorlp_backend.getPropsConfig(nome);  
        
        for (let item of propConfig) {
            if(item.tipo==="text"){
                alterarPageProps(item.identificador, item.text);
            } else {
                alterarPageImg(item.identificador, item.text, "", ""); 
            }            
        }        
        
        setLoading(false);        
    }

    // Esta função irá salvar as sections e props customizadas
    async function salvarPage(){        
        
        setLoading(true);                
        
        try{
            let sections = [];
            pagesSections.forEach((value, key) => {
                const section = {nomePage : nome, 
                                identificador: key,
                                exibir : value, };        

                sections.push(section);

            });               

            let props = [];        
            pagesProps.forEach((value, key) => {
                const prop = { nomePage : nome, 
                            identificador: key,
                            tipo: "text",
                            text: value,};

                props.push(prop);

            });                
                    
            // Este bloco de códigos é utilizado para tratar as imagens que precisam ser gravadas no Canister de Assets das que já foram gravadas.     
            if( pagesImg.size > 0 ){
                const imageProps = await Promise.all(
                    [...pagesImg].map(async ([key, value]) => {                    
                        if (value.filename !== undefined && value.filename !== null && value.filename !== "") {                        
                            let url = await sendAsset(value.file, value.filename);
                            return { 
                                nomePage: nome, 
                                identificador: key,
                                tipo: "img",
                                text: url, 
                            };
                        } else {                        
                            return { 
                                nomePage: nome, 
                                identificador: key,
                                tipo: "img",
                                text: value.url, 
                            };
                        }
                        
                    })
                );
        
                // Adicionando os resultados ao array de props            
                props = [...props, ...imageProps]; 
            }
                    
            await geradorlp_backend.configPage(nome, sections, props);
            
            setLoading(false);    
            
            window.location.href = "/home";
        } catch (e) {                      
            alert(e.message);            
        }
    }        

    /* adiciona/altera Props no Array pagesProps */
    function alterarPageProps(chave, valor) { 
        setPagesProps(prev => {
            const newMap = new Map(prev); // Criando um novo Map baseado no anterior
            newMap.set(chave, valor); // Atualizando a chave com o novo valor
            return newMap; // Retornando um novo objeto para que o React re-renderize
        });
    }

    /* adiciona/altera Imagens no Array pagesImg */
    function alterarPageImg(chave, url, filename, file) { 
        setPagesImg(prev => {
            const newMap = new Map(prev); // Criando um novo Map baseado no anterior
            newMap.set(chave, {url: url, filename: filename, file: file}); // Atualizando a chave com o novo valor
            return newMap; // Retornando um novo objeto para que o React re-renderize
        });
    }
         
    /* adiciona/altera Sections no Array pagesSections */
    function alterarPageSection(chave, valor) { 
        setPagesSections(prev => {
            const newMap = new Map(prev); // Criando um novo Map baseado no anterior
            newMap.set(chave, valor); // Atualizando a chave com o novo valor
            return newMap; // Retornando um novo objeto para que o React re-renderize
        });
    }    

    // função utilizada para tratar e adicionar ao Array as imagens selecionadas
    function selectImg(event, prop){
        const file = event.target.files[0];

        if (file) {                     
            const imageUrl = URL.createObjectURL(file); 
            alterarPageImg(prop, imageUrl, file.name, file);            
        }
    }

    //configura o Canister de backend com a identidade do usuário atenticado
    async function configBackEnd(){        
        setLoading(true);          
        let authC = await AuthClient.create();    
        const authenticated = await authC.isAuthenticated();
        
        if (authenticated) {    
          Actor.agentOf(geradorlp_backend).replaceIdentity(
            authC.getIdentity()
          );          
        } else {
            window.location.href = "/";
        }       
        setLoading(false);          
    }

    function voltar(){
        window.location.href = "/home";
    }       
  
    function exibirModalCustomizacao(c){
        setCampoAlteracao(c);
        setExibirModalCust(true);
    }

    function hideModalCust(){    
        setExibirModalCust(false);
        setNovoTexto("");
    }  

    function alterarTexto(){
        alterarPageProps(campoAlteracao, novoTexto);
        hideModalCust();
    }  

    const [progress, setProgress] = useState(null);

    //função responsavel por gravar as imagens no Canister de Assets
    async function sendAsset(file, fileName){
        try {
            const batch = assetManager.batch();      
            let keyImg = await batch.store(file, {path: '/uploads', fileName});

            //grava a imagem em um Canister de Assets      
            await batch.commit({onProgress: ({current, total}) => setProgress(current / total)});

            return keyImg;
        
        } catch (e) {          
            if (e.message.includes('Caller is not authorized')) {
                alert("Caller não autorizado");
            } else {
                throw e;
            }
        }
    }

  return (
    <>

    <Helmet>
        
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        { /* <!-- Favicon --> */ }        
        <meta name="theme-color" content="#ffffff" />
        <link href="./output.css" rel="stylesheet" />        
        
    </Helmet>    

<nav class="bg-white border-gray-200 dark:bg-gray-900">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <a class="flex items-center space-x-3 rtl:space-x-reverse">      
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">{nome}</span>
      </a>
      <div class="flex md:order-2 gap-[6px] md:space-x-0 rtl:space-x-reverse">
        <button type="button" onClick={voltar} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" >
            Voltar
        </button>
        <button type="button" onClick={salvarPage} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" >
            Salvar
        </button>
     </div>  
  </div>
</nav>

<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

    <body>    

            <div>
                {loading && <Spinner />}
            </div>
            
            <div class="flex items-start mb-6">
                <div class="flex items-center h-5 ml-[20px]">
                    <input checked={Boolean(pagesSections.get("secao1"))} onChange={() => alterarPageSection("secao1", !Boolean(pagesSections.get("secao1")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                </div>
                <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 1</label>
            </div>
            { (pagesSections.get("secao1") == true) && (<header>
            <nav className="bg-white border-gray-200 py-2.5 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
                    <a className="flex items-center">
                      { ( !pagesImg.has("secao1_prop0") || pagesImg.get("secao1_prop0")?.url === "" || pagesImg.get("secao1_prop0")?.url === null) && (
                      <div class="w-[30px] h-[33px] mr-3 sm:h-9">
                          <label for="dropzone-file11" class="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                              <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                  <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                  </svg>
                                  <p class="mb-1 text-[8px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload</span></p>
                              </div>
                              <input id="dropzone-file11" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao1_prop0") } } />
                          </label>
                      </div>
                      )}  
                    
                      { (pagesImg.get("secao1_prop0")?.url != "" && pagesImg.get("secao1_prop0")?.url != null) && (
                          <img src={pagesImg.get("secao1_prop0")?.url}  className="h-6 mr-3 sm:h-9" /> 
                      )}

                      <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                          {pagesProps.get("secao1_prop1")}
                      </span>                      
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop1") }  }  > 
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                          <path d="M13.5 6.5l4 4" />
                        </svg>
                    </button>
                    </a>
                    
                    <div className="flex items-center lg:order-2">                    
                    <a className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800" >
                        {pagesProps.get("secao1_prop2") || ""} 
                    </a>
                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop2") }  } >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                          <path d="M13.5 6.5l4 4" />
                        </svg>
                    </button>
                    <button data-collapse-toggle="mobile-menu-2" type="button" className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" >
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" ></path>
                        </svg>
                    </button>
                    </div>                
                    <div class="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                            <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                                <li>
                                    <a class="block py-2 pl-3 pr-4 text-white bg-purple-700 rounded lg:bg-transparent lg:text-purple-700 lg:p-0 dark:text-white" aria-current="page">{pagesProps.get("secao1_prop3")}</a>
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop3") } }  >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                                </li>
                                <li>   
                                    <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">{pagesProps.get("secao1_prop4")}</a> 
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop4") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                                </li>
                                <li>
                                    <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">{pagesProps.get("secao1_prop5")}</a>
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop5") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                                </li>
                                <li>
                                    <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">{pagesProps.get("secao1_prop6")}</a>
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop6") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>

                                </li>
                                <li>
                                    <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">{pagesProps.get("secao1_prop7")}</a>
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop7") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                                </li>
                                <li>
                                    <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">{pagesProps.get("secao1_prop8")}</a>
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao1_prop8") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>                
                </nav>
            </header>
          )}        

          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao2"))} onChange={() => alterarPageSection("secao2", !Boolean(pagesSections.get("secao2")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 2</label>
          </div>
          
          { (pagesSections.get("secao2") == true) && (
          <section class="bg-white dark:bg-gray-900">
              <div class="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28">
                  <div class="mr-auto place-self-center lg:col-span-7">
                      <h1 class="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white" > { pagesProps.get("secao2_prop1") } </h1>
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao2_prop1") }  }  >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                          <path d="M13.5 6.5l4 4" />
                        </svg>
                    </button>
                      <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400"> { pagesProps.get("secao2_prop2") } 
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao2_prop2") }  }  >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M13.5 6.5l4 4" />
                              </svg>                        
                          </button>
                      </p>
                      <div class="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                          <a class="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-center text-gray-900 border border-gray-200 rounded-lg sm:w-auto hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">                              
                                {pagesProps.get("secao2_prop3")} 
                          </a> 
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao2_prop3") }  }  > 
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                              </svg>
                          </button>
                          <a class="inline-flex items-center justify-center w-full px-5 py-3 mb-2 mr-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:w-auto focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                              {pagesProps.get("secao2_prop4")}
                          </a>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao2_prop4") }  }  >   
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                              </svg>
                          </button>
                      </div>
                  </div>                 

                 { ( !pagesImg.has("secao2_prop5") || pagesImg.get("secao2_prop5")?.url === "" || pagesImg.get("secao2_prop5")?.url === null) && (
                  <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
                        
                        <label for="dropzone-file1" class=" flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload a Image</span></p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">PNG or JPG (MAX. 1064x832px)</p>
                            </div>
                            <input id="dropzone-file1" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao2_prop5") } } />
                        </label>
                        
                    </div>
                   )}  
                    
                    { (pagesImg.get("secao2_prop5")?.url != "" && pagesImg.get("secao2_prop5")?.url != null) && (                    
                        <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
                            <figure class="max-w-lg">
                                <img src={pagesImg.get("secao2_prop5")?.url} loading={'lazy'} class="h-auto max-w-full rounded-lg" alt="" />                
                            </figure>                                                
                        </div>
                    )}     

                </div>                
              
          </section>
          )}

          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />                    

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao3"))} onChange={() => alterarPageSection("secao3", !Boolean(pagesSections.get("secao3")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 3</label>
          </div>
          
          { (pagesSections.get("secao3") == true) && (
          <section class="bg-white dark:bg-gray-900">
              <div class="max-w-screen-xl px-4 pb-8 mx-auto lg:pb-16">
                  <div class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 sm:grid-cols-3 lg:grid-cols-6 dark:text-gray-400">
                      <a className="flex items-center">
                        { ( !pagesImg.has("secao3_prop1") || pagesImg.get("secao3_prop1")?.url === "" || pagesImg.get("secao3_prop1")?.url === null) && (
                            <div class="w-[500px] h-[500px] mr-3 sm:h-9">
                                <label for="dropzone-file2" class="flex flex-col items-center justify-center w-full h-[80px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-[30px] h-[30px] mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[14px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload Image</span></p>
                                    </div>
                                    <input id="dropzone-file2" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao3_prop1") } } />
                                </label>
                            </div>
                        )}  
                        
                        { (pagesImg.get("secao3_prop1")?.url != "" && pagesImg.get("secao3_prop1")?.url != null) && (
                            <img src={pagesImg.get("secao3_prop1")?.url}  className="h-[80px] w-auto mr-3" /> 
                        )}

                      </a>

                      <a class="flex items-center lg:justify-center">                      
                        { ( !pagesImg.has("secao3_prop2") || pagesImg.get("secao3_prop2")?.url === "" || pagesImg.get("secao3_prop2")?.url === null) && (
                            <div class="w-[500px] h-[500px] mr-3 sm:h-9">
                                <label for="dropzone-file3" class="flex flex-col items-center justify-center w-full h-[80px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-[30px] h-[30px] mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[14px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload Image</span></p>
                                    </div>
                                    <input id="dropzone-file3" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao3_prop2") } } />
                                </label>
                            </div>
                        )}  
                        
                        { (pagesImg.get("secao3_prop2")?.url != "" && pagesImg.get("secao3_prop2")?.url != null) && (
                            <img src={pagesImg.get("secao3_prop2")?.url}  className="h-[80px] w-auto mr-3" /> 
                        )}

                      </a>

                      <a class="flex items-center lg:justify-center">                      
                        { ( !pagesImg.has("secao3_prop3") || pagesImg.get("secao3_prop3")?.url === "" || pagesImg.get("secao3_prop3")?.url === null) && (
                            <div class="w-[500px] h-[500px] mr-3 sm:h-9">
                                <label for="dropzone-file4" class="flex flex-col items-center justify-center w-full h-[80px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-[30px] h-[30px] mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[14px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload Image</span></p>
                                    </div>
                                    <input id="dropzone-file4" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao3_prop3") } } />
                                </label>
                            </div>
                        )}  
                        
                        { (pagesImg.get("secao3_prop3")?.url != "" && pagesImg.get("secao3_prop3")?.url != null) && (
                            <img src={pagesImg.get("secao3_prop3")?.url}  className="h-[80px] w-auto mr-3" /> 
                        )}

                      </a>
          
                      <a class="flex items-center lg:justify-center">                      
                        { ( !pagesImg.has("secao3_prop4") || pagesImg.get("secao3_prop4")?.url === "" || pagesImg.get("secao3_prop4")?.url === null) && (
                            <div class="w-[500px] h-[500px] mr-3 sm:h-9">
                                <label for="dropzone-file5" class="flex flex-col items-center justify-center w-full h-[80px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-[30px] h-[30px] mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[14px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload Image</span></p>
                                    </div>
                                    <input id="dropzone-file5" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao3_prop4") } } />
                                </label>
                            </div>
                        )}  
                        
                        { (pagesImg.get("secao3_prop4")?.url != "" && pagesImg.get("secao3_prop4")?.url != null) && (
                            <img src={pagesImg.get("secao3_prop4")?.url}  className="h-[80px] w-auto mr-3" /> 
                        )}

                      </a>

                      <a class="flex items-center lg:justify-center">                      
                        { ( !pagesImg.has("secao3_prop5") || pagesImg.get("secao3_prop5")?.url === "" || pagesImg.get("secao3_prop5")?.url === null) && (
                            <div class="w-[500px] h-[500px] mr-3 sm:h-9">
                                <label for="dropzone-file6" class="flex flex-col items-center justify-center w-full h-[80px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-[30px] h-[30px] mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[14px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload Image</span></p>
                                    </div>
                                    <input id="dropzone-file6" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao3_prop5") } } />
                                </label>
                            </div>
                        )}  
                        
                        { (pagesImg.get("secao3_prop5")?.url != "" && pagesImg.get("secao3_prop5")?.url != null) && (
                            <img src={pagesImg.get("secao3_prop5")?.url}  className="h-[80px] w-auto mr-3" /> 
                        )}

                      </a>

                      <a class="flex items-center lg:justify-center">                      
                        { ( !pagesImg.has("secao3_prop6") || pagesImg.get("secao3_prop6")?.url === "" || pagesImg.get("secao3_prop6")?.url === null) && (
                            <div class="w-[500px] h-[500px] mr-3 sm:h-9">
                                <label for="dropzone-file7" class="flex flex-col items-center justify-center w-full h-[80px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-[30px] h-[30px] mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[14px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload Image</span></p>
                                    </div>
                                    <input id="dropzone-file7" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao3_prop6") } } />
                                </label>
                            </div>
                        )}  
                        
                        { (pagesImg.get("secao3_prop6")?.url != "" && pagesImg.get("secao3_prop6")?.url != null) && (
                            <img src={pagesImg.get("secao3_prop6")?.url}  className="h-[80px] w-auto mr-3" /> 
                        )}

                      </a>

                  </div>
              </div>
          </section>
          )}

          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao4"))} onChange={() => alterarPageSection("secao4", !Boolean(pagesSections.get("secao4")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 4</label>
          </div>
          
          { (pagesSections.get("secao4") == true) && (
          <section class="bg-gray-50 dark:bg-gray-800">
              <div class="max-w-screen-xl px-4 py-8 mx-auto space-y-12 lg:space-y-20 lg:py-24 lg:px-6">              
                  <div class="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">
                      <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                          <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{pagesProps.get("secao4_prop1")}</h2>   
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop1") } } >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                              </svg>
                          </button>
                          <p class="mb-8 font-light lg:text-xl">{pagesProps.get("secao4_prop2")}
                               <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop2") } } >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                      <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                      <path d="M13.5 6.5l4 4" />
                                  </svg>
                              </button>
                          </p>                          
                          
                          <ul role="list" class="pt-8 space-y-5 border-t border-gray-200 my-7 dark:border-gray-700">
                              <li class="flex space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">{pagesProps.get("secao4_prop3")}</span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop3") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">{pagesProps.get("secao4_prop4")}</span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop4") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">{pagesProps.get("secao4_prop5")}</span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop5") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                          </ul>
                          <p class="mb-8 font-light lg:text-xl">{pagesProps.get("secao4_prop6")}
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop6") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </p>                          
                      </div>                     
                    
                      { ( !pagesImg.has("secao4_prop7") || pagesImg.get("secao4_prop7")?.url === "" || pagesImg.get("secao4_prop7")?.url === null) && (
                      <div class="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex">
                        
                            <label for="dropzone-file8" class=" flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload a Image</span></p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">PNG or JPG (MAX. 2200x1600px)</p>
                                </div>
                                <input id="dropzone-file8" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao4_prop7") } } />
                            </label>
                            
                        </div>
                      )}  
                    
                      { (pagesImg.get("secao4_prop7")?.url != "" && pagesImg.get("secao4_prop7")?.url != null) && (                                
                          <img class="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex" src={pagesImg.get("secao4_prop7")?.url} />
                      )}

                  </div>             

                  <div class="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">                      

                      { ( !pagesImg.has("secao4_prop8") || pagesImg.get("secao4_prop8")?.url === "" || pagesImg.get("secao4_prop8")?.url === null) && (
                      <div class="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex">
                        
                            <label for="dropzone-file9" class=" flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload a Image</span></p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">PNG or JPG (MAX. 2200x1600px)</p>
                                </div>
                                <input id="dropzone-file9" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao4_prop8") } } />
                            </label>
                            
                        </div>
                      )}  
                    
                      { (pagesImg.get("secao4_prop8")?.url != "" && pagesImg.get("secao4_prop8")?.url != null) && (                                                          
                          <img class="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex" src={pagesImg.get("secao4_prop8")?.url} alt="" />
                      )}

                      <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                          <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"> {pagesProps.get("secao4_prop9")} </h2>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop9") } } >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                              </svg>
                          </button>
                          <p class="mb-8 font-light lg:text-xl"> {pagesProps.get("secao4_prop10")} 
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop10") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </p>                          
                          <ul role="list" class="pt-8 space-y-5 border-t border-gray-200 my-7 dark:border-gray-700">
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white"> {pagesProps.get("secao4_prop11")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop11") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white"> {pagesProps.get("secao4_prop12")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop12") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white"> {pagesProps.get("secao4_prop13")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop13") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white"> {pagesProps.get("secao4_prop14")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop14") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white"> {pagesProps.get("secao4_prop15")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop15") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                          </ul>
                          <p class="font-light lg:text-xl"> {pagesProps.get("secao4_prop15")} 
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao4_prop15") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </p>                          
                      </div>
                  </div>
              </div>
            </section>
          )}
          
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao5"))} onChange={() => alterarPageSection("secao5", !Boolean(pagesSections.get("secao5")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 5</label>
          </div>          

          { (pagesSections.get("secao5") == true) && (
          <section class="bg-white dark:bg-gray-900">
              <div class="items-center max-w-screen-xl px-4 py-8 mx-auto lg:grid lg:grid-cols-4 lg:gap-16 xl:gap-24 lg:py-24 lg:px-6">
                  <div class="col-span-2 mb-8">
                      <p class="text-lg font-medium text-purple-600 dark:text-purple-500"> {pagesProps.get("secao5_prop1")} 
                        <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop1") } } >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                        </button>
                      </p>                      
                      <h2 class="mt-3 mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-3xl dark:text-white"> {pagesProps.get("secao5_prop2")} </h2>
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop2") } } >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                            <path d="M13.5 6.5l4 4" />
                          </svg>
                      </button>
                      <p class="font-light text-gray-500 sm:text-xl dark:text-gray-400"> {pagesProps.get("secao5_prop3")} 
                        <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop3") } } >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                        </button>
                      </p>                      
                      <div class="pt-6 mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <a href="#" class="inline-flex items-center text-base font-medium text-purple-600 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-700">
                              {pagesProps.get("secao5_prop4")} 
                              <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </a>
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop4") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </div>
                          <div>
                            <a href="#" class="inline-flex items-center text-base font-medium text-purple-600 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-700">
                                {pagesProps.get("secao5_prop5")} 
                                <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </a>
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop5") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                            </div>
                      </div>
                  </div>
                  <div class="col-span-2 space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0">
                      <div>
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white"> {pagesProps.get("secao5_prop6")} </h3>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop6") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          <p class="font-light text-gray-500 dark:text-gray-400"> {pagesProps.get("secao5_prop7")} </p>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop7") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                      </div>
                      <div> 
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white"> {pagesProps.get("secao5_prop8")} </h3>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop8") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          <p class="font-light text-gray-500 dark:text-gray-400"> {pagesProps.get("secao5_prop9")} </p>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop9") } } >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                  <path d="M13.5 6.5l4 4" />
                              </svg>
                          </button>
                      </div>
                      <div> 
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white"> {pagesProps.get("secao5_prop10")} </h3>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop10") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          <p class="font-light text-gray-500 dark:text-gray-400"> {pagesProps.get("secao5_prop11")} </p>      

                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop11") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                      </div>
                      <div>
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white"> {pagesProps.get("secao5_prop12")} </h3>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop12") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                          </button>
                          <p class="font-light text-gray-500 dark:text-gray-400"> {pagesProps.get("secao5_prop13")} </p>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao5_prop13") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                      </div>
                  </div>
              </div>
            </section>
          )}
          
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao6"))} onChange={() => alterarPageSection("secao6", !Boolean(pagesSections.get("secao6")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 6</label>
          </div>
          
          { (pagesSections.get("secao6") == true) && (
          <section class="bg-gray-50 dark:bg-gray-800">
              <div class="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-24 lg:px-6">
                  <figure class="max-w-screen-md mx-auto">
                      <svg class="h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor"/>
                      </svg> 
                      <blockquote>
                          <p class="text-xl font-medium text-gray-900 md:text-2xl dark:text-white"> {pagesProps.get("secao6_prop1")} </p>
                      </blockquote>
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao6_prop1") } } >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M13.5 6.5l4 4" />
                          </svg>
                      </button>
                      <figcaption class="flex items-center justify-center mt-6 space-x-3">
                          
                            { ( !pagesImg.has("secao6_prop4") || pagesImg.get("secao6_prop4")?.url === "" || pagesImg.get("secao6_prop4")?.url === null) && (
                            <div class="w-[30px] h-[33px] mr-3 sm:h-9">
                                <label for="dropzone-file10" class="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div class="flex flex-col items-center justify-center pt-1 pb-1">
                                        <svg class="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-1 text-[8px] text-gray-500 dark:text-gray-400"><span class="font-semibold">Upload</span></p>
                                    </div>
                                    <input id="dropzone-file10" type="file" class="hidden" onChange={ (e) => { selectImg(e, "secao6_prop4") } } />
                                </label>
                            </div>
                            )}  
                            
                            { (pagesImg.get("secao6_prop4")?.url != "" && pagesImg.get("secao6_prop4")?.url != null) && (
                                <img src={pagesImg.get("secao6_prop4")?.url}  className="h-6 mr-3 sm:h-9" /> 
                            )}

                          <div class="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                              <div class="pr-3 font-medium text-gray-900 dark:text-white"> {pagesProps.get("secao6_prop2")} </div>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao6_prop2") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                  <path d="M13.5 6.5l4 4" />
                                </svg>
                              </button>
                              <div class="pl-3 text-sm font-light text-gray-500 dark:text-gray-400"> {pagesProps.get("secao6_prop3")} </div>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao6_prop3") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                  <path d="M13.5 6.5l4 4" />
                                </svg>
                              </button>
                          </div>
                      </figcaption>
                  </figure>
              </div>
            </section>
          )}

          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao7"))} onChange={() => alterarPageSection("secao7", !Boolean(pagesSections.get("secao7")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 7</label>
          </div> 

          { (pagesSections.get("secao7") == true) && (
          <section class="bg-white dark:bg-gray-900">
              <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-24 lg:px-6">
                  <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
                      <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"> {pagesProps.get("secao7_prop1")} </h2>
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop1") } } >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M13.5 6.5l4 4" />
                          </svg>
                      </button>
                      <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400"> {pagesProps.get("secao7_prop2")} </p>
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop2") } } >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M13.5 6.5l4 4" />
                          </svg>
                      </button>
                  </div>
                  <div class="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">                   
                      <div class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                          <h3 class="mb-4 text-2xl font-semibold"> {pagesProps.get("secao7_prop3")} 
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop3") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </h3>                             
                          <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400"> {pagesProps.get("secao7_prop4")} </p>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop4") } } >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                  <path d="M13.5 6.5l4 4" />
                              </svg>
                          </button>   
                          <div class="flex items-baseline justify-center my-8">
                              <span class="mr-2 text-5xl font-extrabold"> {pagesProps.get("secao7_prop5")} </span>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop5") } } >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                      <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                      <path d="M13.5 6.5l4 4" />
                                  </svg>
                              </button>  
                              <span class="text-gray-500 dark:text-gray-400"> {pagesProps.get("secao7_prop6")} </span>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop6") } } >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                      <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                      <path d="M13.5 6.5l4 4" />
                                  </svg>
                              </button>
                          </div>
                          <ul role="list" class="mb-8 space-y-4 text-left">
                              <li class="flex items-center space-x-3">              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop7")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop7") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                   </button>
                              </li>                              
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop8")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop8") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>
                              </li>
                              <li class="flex items-center space-x-3">           
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop9")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop9") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop10")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop10") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop11")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop11") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                          </ul> 
                          <a href="#" class="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-purple-900">{pagesProps.get("secao7_prop12")} </a>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop12") } } >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                        </button>
                      </div>                      

                      <div class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                          <h3 class="mb-4 text-2xl font-semibold"> {pagesProps.get("secao7_prop13")} 
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop13") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </h3>                            
                            <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400"> {pagesProps.get("secao7_prop14")} </p>
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop14") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>  
                          <div class="flex items-baseline justify-center my-8">
                              <span class="mr-2 text-5xl font-extrabold"> {pagesProps.get("secao7_prop15")} </span>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop15") } } >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                    </svg>
                                </button>  
                              <span class="text-gray-500 dark:text-gray-400" dark:text-gray-400> {pagesProps.get("secao7_prop16")} </span>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop16") } } >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                    </svg>
                                </button>
                          </div>                          

                          <ul role="list" class="mb-8 space-y-4 text-left">  
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop17")} </span>
                                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop17") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>  
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop18")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop18") } } >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                          <path d="M13.5 6.5l4 4" />
                                      </svg>
                                  </button>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop19")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop19") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop20")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop20") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>                      

                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop21")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop21") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                          </ul>
                          <a href="#" class="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-purple-900"> {pagesProps.get("secao7_prop22")} </a>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop22") } } > 
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                      </div>
                      
                      <div class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                          <h3 class="mb-4 text-2xl font-semibold"> {pagesProps.get("secao7_prop23")} 
                            <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop23") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                          </h3>                          
                          <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400"> {pagesProps.get("secao7_prop24")} </p>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop24") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                          </button>                            

                          <div class="flex items-baseline justify-center my-8">
                              <span class="mr-2 text-5xl font-extrabold"> {pagesProps.get("secao7_prop25")} </span>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop25") } } >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                    </svg>
                                </button>
                              <span class="text-gray-500 dark:text-gray-400"> {pagesProps.get("secao7_prop26")} </span>
                              <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop26") } } >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                    </svg>
                                </button>
                          </div>                          
                          <ul role="list" class="mb-8 space-y-4 text-left">
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop27")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop27") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>                               
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop28")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop28") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop29")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop29") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>   
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop30")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop30") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>      
                              <li class="flex items-center space-x-3">          
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span> {pagesProps.get("secao7_prop31")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop31") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                    </button>
                              </li>
                          </ul>  
                          <a href="#" class="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-purple-900"> {pagesProps.get("secao7_prop32")} </a>
                          <button type="button" onClick={ () => { exibirModalCustomizacao("secao7_prop32") } } >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                </svg>
                            </button>
                      </div>
                  </div>
              </div>
            </section>
          )}
          
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao8"))} onChange={() => alterarPageSection("secao8", !Boolean(pagesSections.get("secao8")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 8</label>
          </div>
          { (pagesSections.get("secao8") == true) && (
          <section class="bg-white dark:bg-gray-900">
              <div class="max-w-screen-xl px-4 pb-8 mx-auto lg:pb-24 lg:px-6 ">
                  <h2 class="mb-6 text-3xl font-extrabold tracking-tight text-center text-gray-900 lg:mb-8 lg:text-3xl dark:text-white"> {pagesProps.get("secao8_prop1")} 
                    <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop1") } } >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                    </button>
                  </h2>                   
                  <div class="max-w-screen-md mx-auto">
                      <div id="accordion-flush" data-accordion="collapse" data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">
                          <h3 id="accordion-flush-heading-1">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-900 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white" data-accordion-target="#accordion-flush-body-1" aria-expanded="true" aria-controls="accordion-flush-body-1">
                                  <span> {pagesProps.get("secao8_prop2")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop2") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>
                                  <svg data-accordion-icon="" class="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>                          
                          <div id="accordion-flush-body-1" class="" aria-labelledby="accordion-flush-heading-1">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400"> {pagesProps.get("secao8_prop3")} </p>
                                  
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop3") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>

                              </div>
                          </div>
                          <h3 id="accordion-flush-heading-2">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target="#accordion-flush-body-2" aria-expanded="false" aria-controls="accordion-flush-body-2">
                                  <span> {pagesProps.get("secao8_prop4")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop4") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>
                                  <svg data-accordion-icon="" class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>                          
                          <div id="accordion-flush-body-2" class="hidden" aria-labelledby="accordion-flush-heading-2">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400"> {pagesProps.get("secao8_prop5")} </p>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop5") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>                                  
                              </div>
                          </div>
                          <h3 id="accordion-flush-heading-3">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target="#accordion-flush-body-3" aria-expanded="false" aria-controls="accordion-flush-body-3">
                                  <span>{pagesProps.get("secao8_prop6")}</span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop6") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>
                                  <svg data-accordion-icon="" class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>
                          <div id="accordion-flush-body-3" class="hidden" aria-labelledby="accordion-flush-heading-3">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400">{pagesProps.get("secao8_prop7")}</p>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop7") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>                                  
                              </div>
                          </div>                         

                          <h3 id="accordion-flush-heading-4">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target="#accordion-flush-body-4" aria-expanded="false" aria-controls="accordion-flush-body-4">
                                  <span> {pagesProps.get("secao8_prop8")} </span>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop8") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>
                                  <svg data-accordion-icon="" class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>
                          <div id="accordion-flush-body-4" class="hidden" aria-labelledby="accordion-flush-heading-4">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400"> {pagesProps.get("secao8_prop9")} </p>
                                  <button type="button" onClick={ () => { exibirModalCustomizacao("secao8_prop9") } } >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                            <path d="M13.5 6.5l4 4" />
                                        </svg>
                                  </button>                                  
                              </div>
                          </div>
                      </div> 
                  </div>               
              </div>
          </section>
          )}
          
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6">
              <div class="flex items-center h-5 ml-[20px]">
              <input checked={Boolean(pagesSections.get("secao9"))} onChange={() => alterarPageSection("secao9", !Boolean(pagesSections.get("secao9")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 9</label>
          </div>
                    
          { (pagesSections.get("secao9") == true) && (
          <section class="bg-gray-50 dark:bg-gray-800">
              <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6">
                  <div class="max-w-screen-sm mx-auto text-center">
                      <h2 class="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white"> {pagesProps.get("secao9_prop1")} 
                        <button type="button" onClick={ () => { exibirModalCustomizacao("secao9_prop1") } } >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                        </button>                                                        
                      </h2>
                      
                      <p class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg"> {pagesProps.get("secao9_prop2")} 
                        <button type="button" onClick={ () => { exibirModalCustomizacao("secao9_prop2") } } >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                        </button>                                  
                      </p>
                      
                      <a href="#" class="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800"> {pagesProps.get("secao9_prop3")} </a>
                      <button type="button" onClick={ () => { exibirModalCustomizacao("secao9_prop3") } } >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil" >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M13.5 6.5l4 4" />
                          </svg>
                      </button>                                  
                  </div>
              </div>
          </section>
          )}
          
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="flex items-start mb-6 ml-[20px]">
              <div class="flex items-center h-5">
              <input checked={Boolean(pagesSections.get("secao10"))} onChange={() => alterarPageSection("secao10", !Boolean(pagesSections.get("secao10")))} id="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
              </div>
              <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Seção 10</label>
          </div>
            
          { (pagesSections.get("secao10") == true) && (
          <footer class="bg-white dark:bg-gray-800">
              <div class="max-w-screen-xl p-4 py-6 mx-auto lg:py-16 md:p-8 lg:p-10">                  
                  <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                  <div class="text-center">                      
                      
                      <ul class="flex justify-center mt-5 space-x-5">
                          <li>
                              <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-gray-400">
                                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
                              </a>
                          </li>
                          <li>
                              <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-gray-400">
                                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" /></svg>
                              </a>
                          </li>
                          <li>
                              <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-gray-400">
                                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                              </a>
                          </li>
                          <li>
                              <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-gray-400">
                                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                              </a>
                          </li>
                      </ul>
                  </div>
              </div>
          </footer>          
          )} 

        {exibirModalCust && (<div id="alter-modal" tabIndex="-1" className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">            
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Customizar Texto
                        </h3>
                        <button type="button"  onClick={() => hideModalCust()}  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Fechar</span>
                        </button>
                    </div>

                    <form className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                            <div className="col-span-2">
                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Novo Texto</label>
                                <textarea value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} id="description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
                            </div>
                        </div>  

                        <button type="button" onClick={() => alterarTexto()}  className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                        </svg>
                        Concluir
                        </button>
                    </form>

                </div>
            </div>
        </div>

        )}

          <script src="https://unpkg.com/flowbite@1.4.1/dist/flowbite.js"></script>

      </body>
    </>            
  );
}

export default t1pageconfig;
