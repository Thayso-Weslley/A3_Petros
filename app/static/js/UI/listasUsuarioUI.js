import { API } from '../api.js'; 

export class ListasUsuarioUI {
    constructor() {
        this.nomeMenu = "📁 Minhas Listas";
        this.materiaisCache = []; 
        this.pastaAtual = ""; // Guarda qual lista está aberta no momento
    }

    // ==========================================
    // 1. TELA INICIAL: EXIBE AS PASTAS CRIADAS
    // ==========================================
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
        try {
            // 1. Busque pelo ID diretamente no document para garantir que o DOM atualizado seja escaneado
            const pastasContainer = document.getElementById('pastas-container') || this.container.querySelector('#pastas-container');
            
            // 2. Trava de segurança: se mesmo assim o DOM não tiver renderizado a tempo, evita quebrar o código
            if (!pastasContainer) {
                console.warn("Aviso: #pastas-container ainda não está disponível no DOM. Tentando novamente...");
                return;
            }

            const listas = await API.materiais.usuario.obterListas();

            if (!listas || listas.length === 0) {
                pastasContainer.innerHTML = `<p style="color: #aaa;">Você ainda não possui listas criadas.</p>`;
                return;
            }

            pastasContainer.innerHTML = '';
            
            listas.forEach(nomePasta => {
                const btnPasta = document.createElement('div');
                btnPasta.className = 'material-card';
                btnPasta.style.cursor = 'pointer';
                btnPasta.style.minWidth = '200px';
                btnPasta.style.textAlign = 'center';
                
                btnPasta.innerHTML = `
                    <h3 style="margin: 0; font-size: 1.3rem; color: #0275d8;">📂 ${nomePasta}</h3>
                    <p style="margin-top: 8px; font-size: 0.9rem; color: #ccc;">Clique para abrir</p>
                `;

                btnPasta.addEventListener('click', () => {
                    this.abrirListaEInjetarSidebar(nomePasta);
                });

                pastasContainer.appendChild(btnPasta);
            });

        } catch (error) {
            console.error("Erro ao carregar pastas:", error);
            // Aqui é a linha 62 do seu erro antigo. Só alteramos para buscar de forma segura também:
            const pastasContainerAlerta = document.getElementById('pastas-container');
            if (pastasContainerAlerta) {
                pastasContainerAlerta.innerHTML = `<p style="color: #ff4d4d;">Erro ao carregar o inventário.</p>`;
            }
        }
    }

    // ==========================================
    // 2. LÓGICA DE FIXAR NA SIDEBAR
    // ==========================================
    abrirListaEInjetarSidebar(nomeLista) {
        const chaveModulo = `lista-user-${nomeLista.replace(/\s+/g, '-')}`;

        // Se a lista já não estiver registrada no motor do app, registramos agora
        if (!window.EngenhApp._componentes[chaveModulo]) {
            window.EngenhApp._componentes[chaveModulo] = {
                nomeMenu: `📂 ${nomeLista}`,
                // Encapsula o contexto para renderizar a pasta correta quando clicado na barra lateral
                render: (containerPrincipal) => {
                    this.container = containerPrincipal;
                    this.renderizarConteudoDaPasta(nomeLista);
                }
            };
        }

        // Adiciona ao barramento padrão do sistema. O CoreUI vai renderizar com o botão 'X' automaticamente!
        window.EngenhApp.adicionarModulo(chaveModulo);

        // Renderiza imediatamente o conteúdo dela na tela central
        this.renderizarConteudoDaPasta(nomeLista);
    }

    // ==========================================
    // 3. TELA DE CATÁLOGO DA PASTA ESPECÍFICA
    // ==========================================
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
                <p class="loading-text">Carregando materiais de ${nomeLista}...</p>
            </div>
        `;

        this.container.querySelector('#btn-voltar-pastas').addEventListener('click', () => this.render(this.container));
        
        const inputBusca = this.container.querySelector('#input-busca-usuario');
        inputBusca.addEventListener('input', (e) => this.filtrarLista(e.target.value));

        try {
            // Busca TODOS os materiais do JSON e filtra apenas os que pertencem a esta pasta
            const todosMateriais = await API.materiais.usuario.obterTodos();
            this.materiaisCache = todosMateriais.filter(mat => mat.lista_origem === nomeLista);
            
            this.exibirLista(this.materiaisCache);
        } catch (error) {
            console.error("Erro ao carregar materiais da pasta:", error);
            this.container.querySelector('#catalogo-lista-container').innerHTML = `<p style="color: #ff4d4d;">Erro ao buscar materiais desta lista.</p>`;
        }
    }

    exibirLista(lista) {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        if (lista.length === 0) {
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
        if (!query) {
            this.exibirLista(this.materiaisCache);
            return;
        }

        const filtrados = this.materiaisCache.filter(mat => {
            const nomeMatch = mat.nome.toLowerCase().includes(query);
            const catMatch = mat.categoria.toLowerCase().includes(query);
            const tagMatch = mat.metadados?.tags?.some(tag => tag.toLowerCase().includes(query));
            return nomeMatch || catMatch || tagMatch;
        });

        this.exibirLista(filtrados);
    }

    // ==========================================
    // 4. FICHA TÉCNICA DO MATERIAL (SEM BOTÃO DE CLONAR)
    // ==========================================
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

        // Ao clicar em voltar, recarrega a visualização da pasta atual
        this.container.querySelector('#btn-voltar-lista').addEventListener('click', () => {
            this.renderizarConteudoDaPasta(this.pastaAtual);
        });
    }

    gerarLinhasTabela(subObjeto) {
        if (!subObjeto || Object.keys(subObjeto).length === 0) {
            return '<tr><td colspan="2" style="color: #666; font-style: italic; padding: 8px;">Nenhum dado disponível.</td></tr>';
        }
        
        return Object.entries(subObjeto).map(([chave, dados]) => {
            if (!dados || dados.valor === undefined) return '';
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