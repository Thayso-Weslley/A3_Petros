// Importando seus blocos/componentes autônomos da pasta UI
import { DinamicaUI } from './UI/dinamicaUI.js';
// import { EstaticaUI } from './UI/estaticaUI.js';
// import { menuUI } from './UI/menuUI.js';
// import { MateriaisUI } from './UI/materiaisUI.js';

document.addEventListener('DOMContentLoaded', () => {
    const screen = document.getElementById('screen');
    const listaDinamica = document.getElementById('lista-dinamica');

    // Mapeamento das instâncias das classes (Sua ideia de blocos autônomos)
    const componentes = {
        'dinamica': new DinamicaUI(),
        // 'menu': new menuUI(),
        // 'estatica': new EstaticaUI(),
        // 'materiais': new MateriaisUI()
    };

    // Array de estado: controla quais calculadoras aparecem na sidebar
    let calculadorasAtivas = ['dinamica'];

    // Função para atualizar a sidebar dinamicamente com base no estado
    function setCollapsed(collapsed) {
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

    toggleBtn.addEventListener('click', () => {
        collapsed = !collapsed;
        setCollapsed(collapsed);
    });

    // 1. FUNÇÃO: Renderiza apenas a parte mutável da sidebar
    function renderizarModulosDinamicos() {
        if (!listaDinamica) return;
        listaDinamica.innerHTML = ''; // Limpa APENAS a lista dinâmica, os fixos continuam lá

        calculadorasAtivas.forEach(chave => {
            const comp = componentes[chave];
            if (!comp) return;

            const li = document.createElement('li');
            const btn = document.createElement('button');
            
            btn.className = 'screen-link';
            btn.dataset.screen = chave;
            btn.innerText = comp.nomeMenu; // Ex: "🧮 Dinâmica"

            // Evento de clique direto no botão gerado
            btn.addEventListener('click', () => {
                comp.render(screen);
            });

            li.appendChild(btn);
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

    // Inicialização do App
    renderizarModulosDinamicos(); // Monta a gaveta de módulos
});