// Importando seus blocos/componentes autônomos da pasta UI
import { menuUI } from './UI/menuUI.js';
import { DinamicaUI } from './UI/dinamicaUI.js';
import { CoreUI } from './UI.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. MAPEAMENTO DE DOM
    const DOM = {
        screen: document.getElementById('screen'),
        listaDinamica: document.getElementById('lista-dinamica'),
        sidebar: document.getElementById('sidebar'),
        toggleBtn: document.getElementById('toggleBtn'),
        btnBuscarFormula: document.getElementById('btn-buscar-formula')
    };

    // 2. INJEÇÃO DE DEPENDÊNCIAS
    const componentes = { 
        'dinamica': new DinamicaUI(),
        // 'estatica': new EstaticaUI(),
        // 'materiais': new MateriaisUI()
    };
    
    // 3. ESTADO GLOBAL
    let calculadorasAtivas = [''];

    // 4. BARRAMENTO GLOBAL (API DO SISTEMA)
    window.EngenhApp = {
        adicionarModulo: (chave) => {
            if (componentes[chave] && !calculadorasAtivas.includes(chave)) {
                calculadorasAtivas.push(chave);
                atualizarInterface();
            }
        },
        removerModulo: (chave) => {
            calculadorasAtivas = calculadorasAtivas.filter(item => item !== chave);
            atualizarInterface();
        },
        obterModulosAtivos: () => calculadorasAtivas
    };

    // 5. FUNÇÃO DE ORQUESTRAÇÃO
    function atualizarInterface() {
        CoreUI.renderizarListaDinamica(DOM.listaDinamica, DOM.screen, calculadorasAtivas, componentes);
    }

    // 6. INICIALIZAÇÃO DE EVENTOS E LISTENERS
    // Delega a montagem do toggle para a UI
    CoreUI.setupSidebarToggle(DOM.sidebar, DOM.toggleBtn);

    // Evento do botão de Busca (Modal)
    if (DOM.btnBuscarFormula) {
        DOM.btnBuscarFormula.addEventListener('click', () => {
            menuUI.abrirModal(componentes);
        });
    }

    // Evento dos botões fixos da sidebar
    document.querySelectorAll('#itens-fixos .screen-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.screen;
            CoreUI.renderScreenFixo(DOM.screen, target);
        });
    });

    // 7. START DO APP
    atualizarInterface(); 
});