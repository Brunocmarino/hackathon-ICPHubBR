import { useState, useEffect } from 'react';
import { geradorlp_backend } from 'declarations/geradorlp_backend';
import { Helmet } from "react-helmet";
import { useParams } from 'react-router-dom';
import Spinner from "../components/spinner";
import Template1 from "../components/template1";

// Página publica que será utilizada para exibir as páginas publicadas. 
function Page() {
  
    const [loading, setLoading] = useState(false);
    const [pagePublicada, setPagePublicada] = useState(true);

    useEffect( async () => {  
        setLoading(true);          
        await editarPage(nome);
        setLoading(false);          
    }, []);    

    async function editarPage(){                
        
        let ativo = Boolean(await geradorlp_backend.verificaPageAtivo(nome));
        setPagePublicada(ativo);
        if(ativo===true){
            let res2 = await geradorlp_backend.getSectionConfig(nome);                
            for (let item of res2) {
                alterarPageSection(item.identificador, Boolean(item.exibir));
            }        
            
            let res3 = await geradorlp_backend.getPropsConfig(nome);  
            
            for (let item of res3) {
                if(item.tipo==="text"){
                    alterarPageProps(item.identificador, item.text);
                } else {
                    alterarPageImg(item.identificador, item.text, "", ""); 
                }            
            }            
        }        
    }

    const { nome } = useParams(); 

    const [pagesSections, setPagesSections] = useState(new Map());
    const [pagesProps, setPagesProps] = useState(new Map());
    const [pagesImg, setPagesImg] = useState(new Map());

    function alterarPageProps(chave, valor) { 
        setPagesProps(prev => {
            const newMap = new Map(prev); // Criando um novo Map baseado no anterior
            newMap.set(chave, valor); // Atualizando a chave com o novo valor
            return newMap; // Retornando um novo objeto para que o React re-renderize
        });
    }
         
    function alterarPageSection(chave, valor) { 
        setPagesSections(prev => {
            const newMap = new Map(prev); // Criando um novo Map baseado no anterior
            newMap.set(chave, valor); // Atualizando a chave com o novo valor
            return newMap; // Retornando um novo objeto para que o React re-renderize
        });
    }    

    function alterarPageImg(chave, url, filename, file) { 
        setPagesImg(prev => {
            const newMap = new Map(prev); // Criando um novo Map baseado no anterior
            newMap.set(chave, {url: url, filename: filename, file: file}); // Atualizando a chave com o novo valor
            return newMap; // Retornando um novo objeto para que o React re-renderize
        });
    }
    
    const [exibirModalCust, setExibirModalCust] = useState(false);
    const [campoAlteracao, setCampoAlteracao] = useState("");
    const [novoTexto, setNovoTexto] = useState("");
  
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

  return (
    <>

    <Helmet>
        
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title></title>
                
        <meta name="theme-color" content="#ffffff" />
        <link href="./output.css" rel="stylesheet" />
                
    </Helmet>

        <body>              

            <div>
                {loading && <Spinner />}
            </div>
            
            {pagePublicada === true ? <Template1 pagesSections={pagesSections}
                                         pagesProps={pagesProps}            
                                         pagesImg={pagesImg}  /> : <div class="mt-[50px] flex flex-col items-center justify-center text-center">
                                         <h3 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Ops! Parece que esta página não foi encontrada.</h3>
                                         <p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">A página que você está tentando acessar não existe ou não está mais disponível.</p>
                                     </div>
            }
            

            <script src="https://unpkg.com/flowbite@1.4.1/dist/flowbite.js"></script>

        </body>
    </>            
  );
}

export default Page;
