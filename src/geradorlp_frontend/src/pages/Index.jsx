import { geradorlp_backend } from 'declarations/geradorlp_backend';
import { Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

/* Esta é a pagina inicial do Dapp */
function Index() {    

    const navigate = useNavigate();

    /* Função utilizada para autenticar o usuário utilizando a Internet Indetity */
    async function login() {
    
        const authClient = await AuthClient.create();      

        if (!authClient) throw new Error("AuthClient not initialized");

        // Inicia o processo de login e aguarda até que ele termine
        await authClient.login({
            /* Redireciona para o provedor de identidade da ICP (Internet Identity). 
               Neste caso a autenticação será realizada em ambiente Local.
            */
            identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`,
            
            //identityProvider: "https://identity.ic0.app/#authorize", // Este código deverá ser utilizado apenas em caso de deploy em mainnet ou playgroud
            onSuccess: async () => {   
            // Caso entrar neste bloco significa que a autenticação ocorreu com sucesso!  
            
            //registra a identidade do usuário no Canister de backend
            Actor.agentOf(geradorlp_backend).replaceIdentity(
                authClient.getIdentity()
            );

            navigate("/home/"); // Redireciona para a página Home        
            //window.location.href = "/home";       

            },
            
            windowOpenerFeatures: `
                                    left=${window.screen.width / 2 - 525 / 2},
                                    top=${window.screen.height / 2 - 705 / 2},
                                    toolbar=0,location=0,menubar=0,width=525,height=705
                                `,
        });
    }
  
  return (
    <>

    <Helmet>
        
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ICP BR</title>               

        { /* <!-- Favicon --> */ }                
        <meta name="theme-color" content="#ffffff" />
        <link href="./output.css" rel="stylesheet" />
        
        
    </Helmet>
    <body>
          <header class="fixed w-full">
              <nav class="bg-white border-gray-200 py-2.5 dark:bg-gray-900">
                  <div class="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
                      <a href="#" class="flex items-center">
                          <img src="./images/logo.png" class="h-6 mr-3 sm:h-9" alt="" />
                          <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">ICP Hub BR</span>
                      </a>
                      <div class="flex items-center lg:order-2">                                                    
                          <a onClick={login} class="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800 cursor-pointer ">Login</a>
                          <button data-collapse-toggle="mobile-menu-2" type="button" class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">                              
                              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                              <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                          </button>
                      </div>
                      <div class="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                              <li>
                                  <a href="#" class="block py-2 pl-3 pr-4 text-white bg-purple-700 rounded lg:bg-transparent lg:text-purple-700 lg:p-0 dark:text-white" aria-current="page">Home</a>
                              </li>
                              <li>
                                  <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Sobre</a>
                              </li>
                              <li>
                                  <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Preços</a>
                              </li>
                              <li>
                                  <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Perguntas Frequentes</a>
                              </li>
                              <li>
                                  <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Time</a>
                              </li>
                              <li>
                                  <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Contato</a>
                              </li>
                          </ul>
                      </div>
                  </div>
              </nav>
          </header>
          
          <section class="bg-white dark:bg-gray-900">
              <div class="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28">
                  <div class="mr-auto place-self-center lg:col-span-7">
                      <h1 class="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white" >Crie Sua Landing Page <br/>em Minutos</h1>
                      <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">Crie landing pages incríveis em poucos cliques com nosso gerador intuitivo! Escolha entre templates pré-definidos, personalize conforme sua necessidade e publique em segundos. Tudo isso na Blockchain da ICP!</p>
                      <div class="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                          <a href="#" class="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-center text-gray-900 border border-gray-200 rounded-lg sm:w-auto hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                              Criar Landing Page
                          </a> 
                          <a href="#" class="inline-flex items-center justify-center w-full px-5 py-3 mb-2 mr-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:w-auto focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                          <svg class="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">                              
                          <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg> Github
                          </a>
                      </div>
                  </div>
                  <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
                      <img src="./images/img1.jpg" alt="" />
                  </div>                
              </div>
          </section>
          
          <section class="bg-white dark:bg-gray-900">
              <div class="max-w-screen-xl px-4 pb-8 mx-auto lg:pb-16">
                  <div class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 sm:grid-cols-3 lg:grid-cols-6 dark:text-gray-400">
                      <a href="#" class="flex items-center lg:justify-center">
                          <img src="./images/img2.jpg" class="h-[70px] hover:text-gray-900 dark:hover:text-white"   />                          
                      </a>
                      <a href="#" class="flex items-center lg:justify-center">
                          <img src="./images/img3.png" class="h-[70px] hover:text-gray-900 dark:hover:text-white" viewBox="0 0 125 35" fill="currentColor" />                          
                      </a>
                      <a href="#" class="flex items-center lg:justify-center">
                          <img src="./images/img4.png" class="h-[70px] hover:text-gray-900 dark:hover:text-white" viewBox="0 0 125 35" fill="currentColor" />                          
                      </a>          
                      <a href="#" class="flex items-center lg:justify-center">
                          <img src="./images/img5.jpg" class="h-[70px] hover:text-gray-900 dark:hover:text-white" viewBox="0 0 125 35" fill="currentColor" />                          
                      </a>
                      <a href="#" class="flex items-center lg:justify-center">
                          <img src="./images/img6.png" class="h-[70px] hover:text-gray-900 dark:hover:text-white" viewBox="0 0 125 35" fill="currentColor" />                          
                      </a>
                      <a href="#" class="flex items-center lg:justify-center">
                          <img src="./images/img7.png" class="h-[70px] hover:text-gray-900 dark:hover:text-white" viewBox="0 0 125 35" fill="currentColor" />                          
                      </a>
                  </div>
              </div>
          </section>
          
          <section class="bg-gray-50 dark:bg-gray-800">
              <div class="max-w-screen-xl px-4 py-8 mx-auto space-y-12 lg:space-y-20 lg:py-24 lg:px-6">
              
                  <div class="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">
                      <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                          <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Crie Landing Page de forma intuitiva</h2>
                          <p class="mb-8 font-light lg:text-xl">Crie landing pages de forma simples e intuitiva, sem precisar de conhecimentos técnicos, em apenas 3 passos!</p>
                          
                          <ul role="list" class="pt-8 space-y-5 border-t border-gray-200 my-7 dark:border-gray-700">
                              <li class="flex space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Selecione um Template</span>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Defina seus textos</span>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Inclua imagens</span>
                              </li>
                          </ul>
                          <p class="mb-8 font-light lg:text-xl">Simples assim, depois disso basta publicar!</p>
                      </div>
                      <img class="hidden w-[80%] mb-4 rounded-lg lg:mb-0 lg:flex" src="./images/img11.jpg" alt=""/>
                  </div>                  
                  <div class="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">                      
                      <img class="hidden w-[80%] mb-4 rounded-lg lg:mb-0 lg:flex" src="./images/img12.jpg" alt=""/>
                      <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                          <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">O que são landing pages?</h2>
                          <p class="mb-8 font-light lg:text-xl">Landing pages são páginas web criadas com um objetivo específico, geralmente relacionado a marketing. Elas pode ser utilizadas para as seguintes finalidades:</p>                          
                          <ul role="list" class="pt-8 space-y-5 border-t border-gray-200 my-7 dark:border-gray-700">
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Divulgar promoções de produtos (E-commerce no geral)</span>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Divulgar serviços</span>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Divulgar eventos e webinars</span>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Divulgar cursos</span>
                              </li>
                              <li class="flex space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                  <span class="text-base font-medium leading-tight text-gray-900 dark:text-white">Divulgar festas</span>
                              </li>
                          </ul>
                          <p class="font-light lg:text-xl">Elas podem ser utilizadas também para várias outras finalidades.</p>
                      </div>
                  </div>
              </div>
          </section>
            
          <section class="bg-white dark:bg-gray-900">
              <div class="items-center max-w-screen-xl px-4 py-8 mx-auto lg:grid lg:grid-cols-4 lg:gap-16 xl:gap-24 lg:py-24 lg:px-6">
                  <div class="col-span-2 mb-8">
                      <p class="text-lg font-medium text-purple-600 dark:text-purple-500">Utilizado no mundo inteiro</p>
                      <h2 class="mt-3 mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-3xl dark:text-white">Mais de 3000 landing pages geradas ao redor do mundo!</h2>
                      <p class="font-light text-gray-500 sm:text-xl dark:text-gray-400">A facilidade de criar landing pages transformou este projeto em um sucesso no mundo inteiro!</p>
                      <div class="pt-6 mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <a href="#" class="inline-flex items-center text-base font-medium text-purple-600 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-700">
                              Explore exemplos de landing pages
                              <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </a>
                          </div>
                          <div>
                            <a href="#" class="inline-flex items-center text-base font-medium text-purple-600 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-700">
                                Veja os depoimentos dos usuários
                                <svg class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </a>
                            </div>
                      </div>
                  </div>
                  <div class="col-span-2 space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0">
                      <div>
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white">100% no ar</h3>
                          <p class="font-light text-gray-500 dark:text-gray-400">Não se preocupe com infraestrutura</p>
                      </div>
                      <div>
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white">600+ Usuários</h3>
                          <p class="font-light text-gray-500 dark:text-gray-400">Mais de 600 usuários ao redor do mundo</p>
                      </div>
                      <div>
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white">10+ Paises</h3>
                          <p class="font-light text-gray-500 dark:text-gray-400">Utilizado em mais de 10 paises</p>
                      </div>
                      <div>
                          <svg class="w-10 h-10 mb-2 text-purple-600 md:w-12 md:h-12 dark:text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
                          <h3 class="mb-2 text-2xl font-bold dark:text-white">5+ Milhões</h3>
                          <p class="font-light text-gray-500 dark:text-gray-400">Mais de 5 milhões de acessos!</p>
                      </div>
                  </div>
              </div>
          </section>
            
          <section class="bg-gray-50 dark:bg-gray-800">
              <div class="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-24 lg:px-6">
                  <figure class="max-w-screen-md mx-auto">
                      <svg class="h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor"/>
                      </svg> 
                      <blockquote>
                          <p class="text-xl font-medium text-gray-900 md:text-2xl dark:text-white">"Antes de usar o gerador de landing pages, eu dependia de outras pessoas para divulgar meus eventos, o que era caro e demorado. Agora, consigo criar uma página profissional em apenas 5 minutos! Isso mudou completamente a forma como trabalho e trouxe mais agilidade para o meu dia a dia."</p>
                      </blockquote>
                      <figcaption class="flex items-center justify-center mt-6 space-x-3">
                          <img class="w-6 h-6 rounded-full" src="./images/img8.jpg" alt="" />
                          <div class="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                              <div class="pr-3 font-medium text-gray-900 dark:text-white">Tiago Manesco</div>
                              <div class="pl-3 text-sm font-light text-gray-500 dark:text-gray-400">BizDev ICP HUB BR</div>
                          </div>
                      </figcaption>
                  </figure>
              </div>
          </section>
            
          <section class="bg-white dark:bg-gray-900">
              <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-24 lg:px-6">
                  <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
                      <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Valores acessíveis para todos</h2>
                      <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Temos planos que se adaptam às suas necessidades e ao seu orçamento, para todos os perfils de usuários. 
                        Explore nossas opções e escolha o plano ideal para começar a criar landing pages personalizadas, seguras e 
                        totalmente on-chain. Sem taxas ocultas!</p>
                  </div>
                  <div class="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0"> 
                  
                      <div class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                          <h3 class="mb-4 text-2xl font-semibold">Iniciante</h3>
                          <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Melhor opção para quem está iniciando no mundo de landing page.</p>
                          <div class="flex items-baseline justify-center my-8">
                              <span class="mr-2 text-5xl font-extrabold">Grátis</span>
                              <span class="text-gray-500 dark:text-gray-400"></span>
                          </div>
                  
                          <ul role="list" class="mb-8 space-y-4 text-left">
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Apenas um usúario</span>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Apenas 1 landing page</span>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>No máximo: <span class="font-semibold">100 mb de armazenamento</span></span>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Disponível: <span class="font-semibold">24 horas por dia</span> e <span class="font-semibold">7 dias por semana</span></span>
                              </li>                              
                          </ul>
                          <a href="#" class="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-purple-900">Selecionar</a>
                      </div>
                      
                      <div class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                          <h3 class="mb-4 text-2xl font-semibold">Intermediário</h3>
                          <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Melhor opção para quem cria landing page recorrentemente.</p>
                          <div class="flex items-baseline justify-center my-8">
                              <span class="mr-2 text-5xl font-extrabold">$10</span>
                              <span class="text-gray-500 dark:text-gray-400" dark:text-gray-400>/mês</span>
                          </div>                          
                          <ul role="list" class="mb-8 space-y-4 text-left">
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Apenas um usúario</span>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Até 5 landing pages</span>
                              </li>
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>No máximo: <span class="font-semibold">100 mb de armazenamento</span></span>
                              </li>
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Disponível: <span class="font-semibold">24 horas por dia</span> e <span class="font-semibold">7 dias por semana</span></span>
                              </li>
                          </ul>
                          <a href="#" class="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-purple-900">Selecionar</a>
                      </div>
                      
                      <div class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                          <h3 class="mb-4 text-2xl font-semibold">Avançado</h3>
                          <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Melhor opção para quem cria landing page em larga escala.</p>
                          <div class="flex items-baseline justify-center my-8">
                              <span class="mr-2 text-5xl font-extrabold">$100</span>
                              <span class="text-gray-500 dark:text-gray-400">/mês</span>
                          </div>                          
                          <ul role="list" class="mb-8 space-y-4 text-left">
                              <li class="flex items-center space-x-3">                              
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Usuários ilimitados</span>
                              </li>
                              <li class="flex items-center space-x-3">                           
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Landing pages ilimitadas</span>
                              </li>
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Armazenamento ilimitado (não possui limite máximo)</span>
                              </li>
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                  <span>Disponível: <span class="font-semibold">24 horas por dia</span> e <span class="font-semibold">7 dias por semana</span></span>
                              </li>
                          </ul>
                          <a href="#" class="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-purple-900">Selecionar</a>
                      </div>
                  </div>
              </div>
            </section>
          <section class="bg-white dark:bg-gray-900">
              <div class="max-w-screen-xl px-4 pb-8 mx-auto lg:pb-24 lg:px-6 ">
                  <h2 class="mb-6 text-3xl font-extrabold tracking-tight text-center text-gray-900 lg:mb-8 lg:text-3xl dark:text-white">Perguntas frequentes</h2>
                  <div class="max-w-screen-md mx-auto">
                      <div id="accordion-flush" data-accordion="collapse" data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">
                          <h3 id="accordion-flush-heading-1">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-900 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white" data-accordion-target="#accordion-flush-body-1" aria-expanded="true" aria-controls="accordion-flush-body-1">
                                  <span>Eu preciso ser um Web Design para criar as Landing Pages?</span>
                                  <svg data-accordion-icon="" class="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>
                          <div id="accordion-flush-body-1" class="" aria-labelledby="accordion-flush-heading-1">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400">Você não precisa de conhecimentos técnicos para criar suas páginas web. Basta selecionar o template de sua preferência, adicionar seus textos e imagens, e pronto! Simples, rápido e intuitivo..</p>                                  
                              </div>
                          </div>
                          <h3 id="accordion-flush-heading-2">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target="#accordion-flush-body-2" aria-expanded="false" aria-controls="accordion-flush-body-2">
                                  <span>Eu preciso ter uma carteira web3 para iniciar?</span>
                                  <svg data-accordion-icon="" class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>
                          <div id="accordion-flush-body-2" class="hidden" aria-labelledby="accordion-flush-heading-2">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400">resposta.</p>                                  
                              </div>
                          </div>
                          <h3 id="accordion-flush-heading-3">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target="#accordion-flush-body-3" aria-expanded="false" aria-controls="accordion-flush-body-3">
                                  <span>O governo poderá tirar minha landing page do ar?</span>
                                  <svg data-accordion-icon="" class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>
                          <div id="accordion-flush-body-3" class="hidden" aria-labelledby="accordion-flush-heading-3">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400">resposta.</p>
                              </div>
                          </div>
                          <h3 id="accordion-flush-heading-4">
                              <button type="button" class="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target="#accordion-flush-body-4" aria-expanded="false" aria-controls="accordion-flush-body-4">
                                  <span>A landing page funciona no smartfone?</span>
                                  <svg data-accordion-icon="" class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>
                          </h3>
                          <div id="accordion-flush-body-4" class="hidden" aria-labelledby="accordion-flush-heading-4">
                              <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                                  <p class="mb-2 text-gray-500 dark:text-gray-400">Resposta.</p>                                  
                              </div>
                          </div>
                      </div> 
                  </div>               
              </div>
          </section>
          
          <section class="bg-gray-50 dark:bg-gray-800">
              <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6">
                  <div class="max-w-screen-sm mx-auto text-center">
                      <h2 class="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">Inicie gratuitamente</h2>
                      <p class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">Crie a sua primeira landing page sem custos.</p>
                      <a href="#" class="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800">Criar Landing Page</a>
                  </div>
              </div>
          </section>
          
          <footer class="bg-white dark:bg-gray-800 mb-[20px] ">              
                  <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                  <div class="text-center">
                      <a href="#" class="flex items-center justify-center mb-5 text-2xl font-semibold text-gray-900 dark:text-white">
                          <img src="./images/logo.png" class="h-6 mr-3 sm:h-9" alt="" />
                          Gerador de Landing Page    
                      </a>
                      <span class="block text-sm text-center text-gray-500 dark:text-gray-400">© 2025 ICP Hub BR</span>
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
          </footer>
          <script src="https://unpkg.com/flowbite@1.4.1/dist/flowbite.js"></script>
      </body>
    </>         
  );
}

export default Index;
