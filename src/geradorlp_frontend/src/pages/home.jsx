import { useState, useEffect } from 'react';
import { geradorlp_backend } from 'declarations/geradorlp_backend';
import { Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import Spinner from "../components/spinner";

// Esta página será o painel do administrador onde serão criadas e controladas as Landing Pages
function Home() {
  
    const [pages, setPages] = useState([]);
    const [showCadastro, setShowCadastro] = useState(false);
    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState("");
    const [template, setTemplate] = useState("Template 1");
    const [descricao, setDescricao] = useState("");

    useEffect( async () => {            
        await configBackEnd();
        await consultarLandingPagePorPrincipal();        
    }, []);

    // Função utilizada para criar a Page
    async function criarLandingPage(){        
        setLoading(true);        
        try{        
            await geradorlp_backend.criarPage(nome,descricao,template);
            window.location.href = "/t1pageconfig/"+nome;  
        } catch (e) {                      
            alert(e.message);            
            setLoading(false);        
        }
        setLoading(false);        
    }

    // Função utilizada para publicar a Page
    async function publicar(nomePag, descricaoPag, templatePag, ativo){        
        setLoading(true);        
        await geradorlp_backend.alterarPage(nomePag, descricaoPag, templatePag, ativo);
        setLoading(false);        
        consultarLandingPagePorPrincipal();
    }    

    // Função utilizada para pesquisar e listar todas as Pages criadas
    async function consultarLandingPagePorPrincipal(){        
        setLoading(true);        
        setPages(await geradorlp_backend.consultarLandingPagePorPrincipal());
        setLoading(false);        
    }

    // Função utilizada irá direcionar para a edição/configuração de Page
    function editar(nomePage){
        setLoading(true);        
        window.location.href = "/t1pageconfig/"+nomePage;
    }

    // função utilizada para configurar o Canister de backend com a identidade do usuário logado
    async function configBackEnd(){        
        setLoading(true);        
        let authC = await AuthClient.create();    
        //verifica se o usuário foi autenticado
        const authenticated = await authC.isAuthenticated();
        
        if (authenticated) {              
          Actor.agentOf(geradorlp_backend).replaceIdentity(
            authC.getIdentity()
          );          
        } else {
            // se o usuário não estiver autenticado ele será redirecionado para a pagina inicial
            window.location.href = "/";
        }       
        setLoading(false);        
    }

    // função utilizada para realizar o logout do usuário.
    async function logout(){        
        const authClient = await AuthClient.create();        
        await authClient.logout();     
        window.location.href = "/";
    }

  return (
    
        <body>            
            
            {loading && ( <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-[9999]"> <Spinner /> </div>)  }              
        
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg ml-[15px] mt-[15px] mr-[15px] ">
                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row ml-[25px] mt-[10px] space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
                    <div>
                        <button 
                        onClick={() => setShowCadastro(true)} 
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Criar Page                           
                        </button>                        
                    </div>
                    <div className="ml-auto">
                        <button 
                        onClick={() => logout()} 
                        className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800 mr-[20px]">
                        Sair
                        </button>
                    </div>
                </div>

                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>                            
                            <th scope="col" class="px-6 py-3" width="35%" >
                                Nome/Descrição
                            </th>
                            <th scope="col" class="px-6 py-3" width="10%">
                                Template
                            </th>
                            <th scope="col" class="px-6 py-3" width="40%">
                                URL
                            </th>
                            <th scope="col" class="px-6 py-3" width="15%">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {pages.map((p) => ( <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">                            
                            <th scope="row" class="w-[35%] px-6 py-4 text-gray-900 dark:text-white">
                                <div class="flex items-start">
                                    <div class="ps-3 break-words w-full max-w-[98%]">
                                        <div class="text-base font-semibold">{p.nomePage}</div>
                                        <div class="font-normal text-gray-500">{p.descricao}</div>
                                    </div>  
                                </div>
                            </th>
                            <td class="px-6 py-4" width="10%">
                                <div>{p.template}</div>                                                                                                
                            </td>
                            <td class="px-6 py-4" width="40%">
                                {p.ativo===true?<a href={ (window.location.href).replace("home", "page/")+p.nomePage} target="_blank" class="font-medium text-blue-600 dark:text-blue-500 hover:underline ml-[5px] cursor-pointer" >{ (window.location.href).replace("home", "page/")+p.nomePage}</a>:"Não Publicado" }
                            </td>
                            <td class="px-6 py-4" width="15%">
                                <div>
                                    <a onClick={() => { editar(p.nomePage) } } class="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">Editar</a> |
                                    <a onClick={() => { publicar(p.nomePage, p.descricao, p.template, !p.ativo) } } class="font-medium text-blue-600 dark:text-blue-500 hover:underline ml-[5px] cursor-pointer"> {p.ativo===true?"Desativar":"Publicar" }</a>
                                </div>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>                      

            {showCadastro && (<div id="cad-land" tabindex="-1" class="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50">                                                               
                <div class="relative p-4 w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-700">

                    <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">

                        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                Criar Nova Landing Page
                            </h3>
                            <button type="button" onClick={ () => { setShowCadastro(false) } } class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span class="sr-only">Fechar</span>
                            </button>
                        </div>

                        <form class="p-4 md:p-5">
                            <div class="grid gap-4 mb-4 grid-cols-2">
                                <div class="col-span-2">
                                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome</label>
                                    <input type="text" value={nome} onChange={ (e) => { setNome(e.target.value.replace(/\s/g, "")) } } onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); } }}name="nome" id="nome" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="" required="" />
                                </div>                                
                                <div class="col-span-2 sm:col-span-1">
                                    <label for="template" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Template</label>
                                    <select id="template" value={template} onChange={ (e) => setTemplate(e.target.value) } class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                        <option value="Template 1">Template 1</option>                                        
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label for="descricao" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                    <textarea id="descricao" value={descricao} onChange={ (e) => { setDescricao(e.target.value) } } rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder=""></textarea>                    
                                </div>
                            </div>
                            <button type="button" onClick={criarLandingPage} class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                                Criar
                            </button>
                        </form>
                    </div>
                </div>
            </div>) }


        </body>
    
  );
}

export default Home;
