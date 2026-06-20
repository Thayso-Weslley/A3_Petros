// app/static/js/UI/itensFixos/listasUsuarioUI.js
import { API } from '../../api.js'; 

export class ListasUsuarioUI {
    constructor() {
        this.nomeMenu = "📁 Minhas Listas";
        this.materiaisCache = []; 
        this.pastaAtual = "";
    }

    async render(containerPrincipal) {
        this.container = containerPrincipal;
        
        this.container.innerHTML = `
            <div class="catalogo-header">
                <h2>📁 Meu Inventário de Materiais</h2>
                <p>Selecione uma de suas listas personalizadas para visualizar os materiais.</p>
            </div>
            <div id="pastas-container" class="catalogo-grid" style="display: flex; gap: 15px; flex-wrap: wrap; padding: 20px;">
                <p class="loading-text">Buscando suas listas...</p>
            </div>
        `;

        await this.carregarPastas();
    }

    async carregarPastas() {
        const pastasContainer = this.container.querySelector('#pastas-container');
        if (!pastasContainer) return; // Trava de segurança para renderização assíncrona

        try {
            const listas = await API.materiais.usuario.obterListas();

            if (!listas?.length) {
                pastasContainer.innerHTML = `<p style="color: #aaa;">Você ainda não possui listas criadas.</p>`;
                return;
            }

            pastasContainer.innerHTML = '';
            
            listas.forEach(nomePasta => {
                const btnPasta = document.createElement('div');
                btnPasta.className = 'material-card';
                btnPasta.style.cssText = 'cursor: pointer; min-width: 200px; text-align: center;';
                
                btnPasta.innerHTML = `
                    <h3 style="margin: 0; font-size: 1.3rem; color: #0275d8;">📂 ${nomePasta}</h3>
                    <p style="margin-top: 8px; font-size: 0.9rem; color: #ccc;">Clique para abrir</p>
                `;

                btnPasta.addEventListener('click', () => this.abrirListaEInjetarSidebar(nomePasta));
                pastasContainer.appendChild(btnPasta);
            });

        } catch (error) {
            console.error("Erro ao carregar pastas:", error);
            if (pastasContainer) {
                pastasContainer.innerHTML = `<p style="color: #ff4d4d;">Erro ao carregar o inventário.</p>`;
            }
        }
    }

    abrirListaEInjetarSidebar(nomeLista) {
        const chaveModulo = `lista-user-${nomeLista.replace(/\s+/g, '-')}`;

        if (!window.EngenhApp._componentes[chaveModulo]) {
            window.EngenhApp._componentes[chaveModulo] = {
                nomeMenu: `📂 ${nomeLista}`,
                render: (container) => {
                    this.container = container;
                    this.renderizarConteudoDaPasta(nomeLista);
                }
            };
        }

        window.EngenhApp.adicionarModulo(chaveModulo);
        this.renderizarConteudoDaPasta(nomeLista);
    }

    async renderizarConteudoDaPasta(nomeLista) {
        this.pastaAtual = nomeLista;

        this.container.innerHTML = `
            <div class="catalogo-header">
                <button id="btn-voltar-pastas" class="btn-voltar" style="margin-bottom: 15px;">← Voltar às Pastas</button>
                <h2>📂 Lista: ${nomeLista}</h2>
                <p>Materiais salvos no seu inventário personalizado.</p>
                
                <div class="catalogo-search-box">
                    <span class="search-icon">🔎</span>
                    <input type="text" id="input-busca-usuario" placeholder="Filtrar nesta lista..." autocomplete="off">
                </div>
            </div>
            <div id="catalogo-lista-container" class="catalogo-grid">
                <p class="loading-text">Carregando materiais...</p>
            </div>
        `;

        this.container.querySelector('#btn-voltar-pastas').addEventListener('click', () => this.render(this.container));
        
        this.container.querySelector('#input-busca-usuario')
            .addEventListener('input', (e) => this.filtrarLista(e.target.value));

        const listaContainer = this.container.querySelector('#catalogo-lista-container');

        try {
            const todosMateriais = await API.materiais.usuario.obterTodos();
            this.materiaisCache = todosMateriais.filter(mat => mat.lista_origem === nomeLista);
            this.exibirLista(this.materiaisCache);
        } catch (error) {
            console.error("Erro ao carregar materiais da pasta:", error);
            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Erro ao buscar materiais desta lista.</p>`;
        }
    }

    exibirLista(lista) {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        
        if (!lista.length) {
            listaContainer.innerHTML = `<p class="loading-text">Nenhum material encontrado com esses critérios.</p>`;
            return;
        }

        listaContainer.innerHTML = ''; 

        lista.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';
            
            const tagsBadges = material.metadados?.tags?.map(tag => `<span class="tag-badge">${tag}</span>`).join('') || '';

            card.innerHTML = `
                <div class="material-card-info">
                    <h3>${material.nome}</h3>
                    <span class="material-categoria">${material.categoria}</span>
                    <div class="material-tags">${tagsBadges}</div>
                </div>
                <button class="btn-ver-ficha">Visualizar Ficha Técnica →</button>
            `;

            card.addEventListener('click', () => this.renderFichaTecnica(material));
            listaContainer.appendChild(card);
        });
    }

    filtrarLista(termo) {
        const query = termo.toLowerCase().trim();
        if (!query) return this.exibirLista(this.materiaisCache);

        const filtrados = this.materiaisCache.filter(mat => {
            return mat.nome?.toLowerCase().includes(query) ||
                   mat.categoria?.toLowerCase().includes(query) ||
                   mat.metadados?.tags?.some(tag => tag.toLowerCase().includes(query));
        });

        this.exibirLista(filtrados);
    }

    renderFichaTecnica(material) {
        this.container.innerHTML = `
            <div class="ficha-wrapper" style="position: relative;">
                <button id="btn-voltar-lista" class="btn-voltar">← Voltar à Lista</button>
                
                <div class="ficha-header">
                    <div class="ficha-titulo-bloco">
                        <h2>${material.nome}</h2>
                        <span class="material-categoria grande">${material.categoria}</span>
                    </div>
                    <div class="ficha-meta">
                        <small><strong>Fonte:</strong> ${material.metadados?.fonte_referencia || 'Inventário Pessoal'}</small><br>
                        <small><strong>Adicionado em:</strong> ${material.metadados?.data_adicao || 'N/A'}</small>
                    </div>
                </div>

                <div class="ficha-propriedades-grid">
                    <div class="propriedade-secao">
                        <h3>🔩 Propriedades Mecânicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material.propriedades_mecanicas)}
                        </table>
                    </div>
                    <div class="propriedade-secao">
                        <h3>🔥 Propriedades Térmicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material.propriedades_termicas)}
                        </table>
                    </div>
                    <div class="propriedade-secao">
                        <h3>⚡ Propriedades Elétricas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material.propriedades_eletricas)}
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.container.querySelector('#btn-voltar-lista').addEventListener('click', () => {
            this.renderizarConteudoDaPasta(this.pastaAtual);
        });
    }

    gerarLinhasTabela(subObjeto) {
        if (!subObjeto || Object.keys(subObjeto).length === 0) {
            return '<tr><td colspan="2" style="color: #666; font-style: italic; padding: 8px;">Nenhum dado disponível.</td></tr>';
        }
        
        return Object.entries(subObjeto).map(([chave, dados]) => {
            if (dados?.valor == null) return ''; // Nullish check mais seguro
            
            const nomeFormatado = chave.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
            const exibeUnidade = dados.unidade !== "adimensional" ? dados.unidade : "";
            
            return `
                <tr>
                    <td class="prop-nome" style="padding: 8px; color: #aaa;">${nomeFormatado}</td>
                    <td class="prop-valor" style="padding: 8px; color: #fff; font-weight: bold; text-align: right;">
                        ${dados.valor} <span class="prop-unidade" style="color: #0275d8; font-size: 0.85rem; margin-left: 4px;">${exibeUnidade}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}