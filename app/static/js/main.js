// main.js

import { API } from './api.js';
import { CoreUI } from './UI.js';

// Importando todos os itens fixos em uma única linha
import { menuUI, MateriaisUI, ListasUsuarioUI } from './UI/itensFixos/index.js';

// Importando todas as calculadoras físicas em uma única linha (e de fácil expansão!)
import { 
    lei_de_NewtonUI, energia_cineticaUI, pesoUI, momentoUI, potenciaUI, 
    quantidade_de_movimentoUI, trabalhoUI, atritoUI, formula_de_NavierUI, equacao_de_EulerUI 
} from './UI/componentes/index.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. MAPEAMENTO DE DOM
    const DOM = {
        screen: document.getElementById('screen'),
        listaDinamica: document.getElementById('lista-dinamica'),
        sidebar: document.getElementById('sidebar'),
        toggleBtn: document.getElementById('toggleBtn'),
        btnBuscarFormula: document.getElementById('btn-buscar-formula'),
        btnListaOnline: document.getElementById('btn-lista-online'),
        btnMinhasListas: document.getElementById('btn-minhas-listas')
    };

    // 2. INJEÇÃO DE DEPENDÊNCIAS
    const componentes = { 
        '2° lei de Newton': new lei_de_NewtonUI(API.dinamica.calcularSegundaLei),
        'Energia Cinética': new energia_cineticaUI(API.dinamica.calcularEnergiaCinetica),
        'Força Peso': new pesoUI(API.dinamica.calcularPeso),
        'Potência': new potenciaUI(API.dinamica.calcularPotencia),
        'Quantidade de Movimento': new quantidade_de_movimentoUI(API.dinamica.calcularQuantidadeMovimento),
        'Trabalho Mecânico': new trabalhoUI(API.dinamica.calcularTrabalho),
        'Momento de uma Força': new momentoUI(API.estatica.calcularMomento),
        'Força de Atrito': new atritoUI(API.estatica.calcularAtrito),
        'Fórmula de Navier (Vigas)': new formula_de_NavierUI(API.engenharia.calcularNavier),
        'Equação de Euler (Flambagem)': new equacao_de_EulerUI(API.engenharia.calcularEuler)
    };

    // 3. COMPONENTES FIXOS (Instanciado aqui apenas para gerenciar as telas fixas)
    const telaListaOnline = new MateriaisUI(API.materiais);
    const telaMinhasListas = new ListasUsuarioUI(API.materiais.usuario);
    
    // 4. ESTADO GLOBAL
    let calculadorasAtivas = [''];

    // BARRAMENTO GLOBAL (API DO SISTEMA)
    window.EngenhApp = {
        // Expondo as referências para os módulos dinâmicos poderem se injetar
        _componentes: componentes, 
        _screen: DOM.screen,

        adicionarModulo: (chave) => {
            if (componentes[chave] && !calculadorasAtivas.includes(chave)) {
                calculadorasAtivas.push(chave);
                atualizarInterface();
            }
        },
        removerModulo: (chave) => {
            calculadorasAtivas = calculadorasAtivas.filter(item => item !== chave);

            // Se for uma lista customizada, removemos o registro do dicionário para liberar memória
            if (chave.startsWith('lista-user-') && componentes[chave]) {
                delete componentes[chave];
            }

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

    if (DOM.btnMinhasListas) {
        DOM.btnMinhasListas.addEventListener('click', () => {
            telaMinhasListas.render(DOM.screen);
        });
    }

    // Evento dos botões fixos da sidebar
    document.querySelectorAll('#itens-fixos .screen-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.screen;
            // Ignora o 'lista-online' aqui, pois ele já tem o listener dedicado acima
            if (target !== 'lista-online' && target !== 'minhas-listas') {
                CoreUI.renderScreenFixo(DOM.screen, target);
            }
        });
    });

    // 7. START DO APP
    atualizarInterface(); 
});