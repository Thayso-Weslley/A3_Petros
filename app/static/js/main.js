// Importando seus blocos/componentes autônomos da pasta UI
import { DinamicaUI } from './UI/dinamicaUI.js';
// import { EstaticaUI } from './UI/estaticaUI.js';
// import { menuUI } from './UI/menuUI.js';
// import { MateriaisUI } from './UI/materiaisUI.js';

document.addEventListener('DOMContentLoaded', () => {
    const screen = document.getElementById('screen');
    const listaDinamica = document.getElementById('lista-dinamica');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');

    // Mapeamento das instâncias das classes (Sua ideia de blocos autônomos)
    const componentes = {
        // 'menu': new menuUI(),
        'dinamica': new DinamicaUI(),
        // 'estatica': new EstaticaUI(),
        // 'materiais': new MateriaisUI()
    };

    // Array de estado: controla quais calculadoras aparecem na sidebar
    let calculadorasAtivas = ['dinamica'];

    // FUNÇÕES DE GERENCIAMENTO DE ESTADO (DESIGN PATTERN: STATE MANAGEMENT)
    // Tornamos essas funções acessíveis para as classes de UI dispararem
    window.EngenhApp = {
        adicionarModulo: (chave) => {
            if (componentes[chave] && !calculadorasAtivas.includes(chave)) {
                calculadorasAtivas.push(chave);
                renderizarModulosDinamicos();
            }
        },
        removerModulo: (chave) => {
            calculadorasAtivas = calculadorasAtivas.filter(item => item !== chave);
            renderizarModulosDinamicos();
        },
        obterModulosAtivos: () => calculadorasAtivas
    };

    // Função para atualizar a sidebar dinamicamente com base no estado
    function setCollapsed(collapsed) {
        if (!sidebar || !toggleBtn) return;
        if (collapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            sidebar.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    }

    // Inicialmente não colapsado
    let collapsed = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            collapsed = !collapsed;
            setCollapsed(collapsed);
        });
    }

    // 1. FUNÇÃO: Renderiza apenas a parte mutável da sidebar
    function renderizarModulosDinamicos() {
        if (!listaDinamica) return;
        listaDinamica.innerHTML = ''; // Limpa APENAS a lista dinâmica, os fixos continuam lá

        calculadorasAtivas.forEach(chave => {
            const comp = componentes[chave];
            if (!comp) return;

            const li = document.createElement('li');
            li.className = 'sidebar-item-container'; // Classe para estilizar o Flexbox

            // Botão Principal (Acessa a tela do cálculo)
            const btnLink = document.createElement('button');
            btnLink.className = 'screen-link';
            btnLink.dataset.screen = chave;
            btnLink.innerText = comp.nomeMenu; 
            btnLink.addEventListener('click', () => {
                comp.render(screen);
            });

            // Botão de Excluir (Remove da lista)
            const btnDelete = document.createElement('button');
            btnDelete.className = 'sidebar-btn-delete';
            btnDelete.innerHTML = '&times;'; // Renderiza o caractere de multiplicação "×" (X elegante)
            btnDelete.title = `Remover ${comp.nomeMenu}`;

            // O Evento de clique aciona o gerenciador e dá o refresh automático
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que o clique dispare o btnLink por acidente
                window.EngenhApp.removerModulo(chave);
            });

            // Monta a estrutura injetando os dois botões no mesmo item de lista
            li.appendChild(btnLink);
            li.appendChild(btnDelete);
            listaDinamica.appendChild(li);
 
        });
    }

    // 2. EVENTO: Escuta os cliques dos botões FIXOS que já vieram do HTML
    document.querySelectorAll('#itens-fixos .screen-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.screen;
            renderScreenFixo(target);
        });
    });

    // 3. ROTEADOR: Controla o comportamento das telas estáticas/fixas
    function renderScreenFixo(name) {
        if (!screen) return;
        
        switch (name) {
            case 'buscar-formula':
                console.log("Botão de Buscar Fórmula clicado! Renderizando tela...");
                screen.innerHTML = `<h2>Buscar Fórmula</h2><p>Painel de busca global.</p>`;
                break;
            case 'lista-online':
                console.log("Botão de Lista On-line clicado! Renderizando tela...");
                screen.innerHTML = `<h2>Lista On-line</h2><p>Catálogo centralizado de materiais do sistema.</p>`;
                break;
            case 'minhas-listas':
                console.log("Botão de Minhas Listas clicado! Renderizando tela...");
                screen.innerHTML = `<h2>Minhas Listas</h2><p>Seus materiais salvos localmente.</p>`;
                break;
            default:
                alert("Tela não implementada ainda!");
                screen.innerHTML = `<h2>Home</h2><p>Selecione uma opção.</p>`;
                break;
        }
    }

    // Função auxiliar para simular a tela de busca interagindo com o barramento global
    function renderizarTelaBuscaFormulas() {
        const ativos = window.EngenhApp.obterModulosAtivos();
        
        screen.innerHTML = `
            <h2>🔍 Painel de Controle de Módulos</h2>
            <p>Ative ou desative as calculadoras na sua barra lateral.</p>
            <br>
            <div style="display: flex; gap: 20px;">
                <div class="card-modulo" style="border: 1px solid #333; padding: 15px; border-radius: 8px;">
                    <h3>Módulo de Estática</h3>
                    <button id="btn-toggle-estatica" class="table-button-submit">
                        ${ativos.includes('estatica') ? 'Remover da Sidebar' : 'Adicionar à Sidebar'}
                    </button>
                </div>
            </div>
        `;

        // Vincula o evento do botão ao barramento global window.EngenhApp
        document.getElementById('btn-toggle-estatica').addEventListener('click', (e) => {
            const jaAtivo = window.EngenhApp.obterModulosAtivos().includes('estatica');
            if (jaAtivo) {
                window.EngenhApp.removerModulo('estatica');
                e.target.innerText = "Adicionar à Sidebar";
            } else {
                window.EngenhApp.adicionarModulo('estatica');
                e.target.innerText = "Remover da Sidebar";
            }
        });
    }

    // Inicialização do App
    renderizarModulosDinamicos(); // Monta a gaveta de módulos
});