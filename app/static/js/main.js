// Importando seus blocos/componentes autônomos da pasta UI
import { menuUI } from './UI/menuUI.js';
import { CoreUI } from './UI.js';
import { MateriaisUI } from './UI/materiaisUI.js';
import { lei_de_NewtonUI } from './UI/lei_de_NewtonUI.js';
import { energia_cineticaUI } from './UI/energia_cineticaUI.js';
import { pesoUI } from './UI/pesoUI.js';
import { momentoUI } from './UI/momentoUI.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. MAPEAMENTO DE DOM
    const DOM = {
        screen: document.getElementById('screen'),
        listaDinamica: document.getElementById('lista-dinamica'),
        sidebar: document.getElementById('sidebar'),
        toggleBtn: document.getElementById('toggleBtn'),
        btnBuscarFormula: document.getElementById('btn-buscar-formula'),
        btnListaOnline: document.getElementById('btn-lista-online')
    };

    // 2. INJEÇÃO DE DEPENDÊNCIAS
    const componentes = { 
        '2° lei de Newton': new lei_de_NewtonUI(),
        'Energia Cinética': new energia_cineticaUI(),
        'Força Peso': new pesoUI(),
        "Momento de uma Força": new momentoUI()
    };

    // 3. COMPONENTES FIXOS (Instanciado aqui apenas para gerenciar as telas fixas)
    const telaListaOnline = new MateriaisUI();
    
    // 4. ESTADO GLOBAL
    let calculadorasAtivas = [''];

    // BARRAMENTO GLOBAL (API DO SISTEMA)
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

    if (DOM.btnListaOnline) {
        DOM.btnListaOnline.addEventListener('click', () => {
            telaListaOnline.render(DOM.screen);
        });
    }

    // Evento dos botões fixos da sidebar
    document.querySelectorAll('#itens-fixos .screen-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.screen;
            // Ignora o 'lista-online' aqui, pois ele já tem o listener dedicado acima
            if (target !== 'lista-online') {
                CoreUI.renderScreenFixo(DOM.screen, target);
            }
        });
    });

    // 7. START DO APP
    atualizarInterface(); 
});